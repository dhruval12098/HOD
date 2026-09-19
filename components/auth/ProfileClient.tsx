'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { LogOut, ShoppingBag } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { getCollectionHref } from '@/lib/browse-context';
import { formatUsd } from '@/lib/money';
import { supabase } from '@/lib/supabase';
import WishlistClient from '@/components/pages/WishlistClient';

type ProfileState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | {
      status: 'signed-in'
      email: string
      username: string
      firstName: string
      lastName: string
      phone: string
      createdAt: string
      userId: string
    };

type AccountTab = 'dashboard' | 'account' | 'orders' | 'wishlist';
type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  image_url?: string | null;
  selected_metal?: string | null;
  selected_purity?: string | null;
  selected_size_or_fit?: string | null;
  selected_gemstone?: string | null;
  selected_carat?: string | null;
};
type OrderRecord = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal_amount: number;
  gst_amount: number;
  shipping_amount: number;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
};

type SignedInProfileState = Extract<ProfileState, { status: 'signed-in' }>;
type OrdersCacheEntry = {
  orders: OrderRecord[];
  totalPages: number;
  cachedAt: number;
};

const ORDERS_CACHE_TTL_MS = 60_000;
let cachedProfileState: SignedInProfileState | null = null;
const ordersCache = new Map<string, OrdersCacheEntry>();

const PROFILE_BANNER = '/HOD%20specs/profile%20banner/wesfly-jzXYuYd-o00-unsplash.jpg';
const INPUT_CLASS =
  'h-11 border border-[#b8b8b8] bg-white px-4 font-secondary text-[13px] text-[var(--theme-ink)] outline-none transition placeholder:text-[#4f5662] focus:border-[var(--theme-ink)]';
const TABS: Array<{ id: AccountTab; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'account', label: 'Account Details' },
  { id: 'orders', label: 'Orders' },
  { id: 'wishlist', label: 'Wish List' },
];

function parseTab(value: string | null): AccountTab {
  return value === 'orders' || value === 'account' || value === 'wishlist' ? value : 'dashboard';
}

function buildSelectionLabel(metal?: string | null, purity?: string | null) {
  const normalizedMetal = metal?.trim() || '';
  const normalizedPurity = purity?.trim() || '';
  if (!normalizedMetal) return normalizedPurity;
  if (!normalizedPurity || normalizedMetal.toLowerCase().includes(normalizedPurity.toLowerCase())) return normalizedMetal;
  return `${normalizedPurity} ${normalizedMetal}`.trim();
}

function getUsername(email: string | null | undefined, metadata: Record<string, unknown> | undefined) {
  const preferredKeys = ['username', 'full_name', 'name', 'given_name'];

  for (const key of preferredKeys) {
    const value = metadata?.[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return email?.split('@')[0] ?? 'Member';
}

function readMetadata(metadata: Record<string, unknown> | undefined) {
  const fullName = typeof metadata?.full_name === 'string' ? metadata.full_name.trim() : '';
  const firstName = typeof metadata?.first_name === 'string' ? metadata.first_name.trim() : fullName ? fullName.split(' ')[0] : '';
  const lastName = typeof metadata?.last_name === 'string' ? metadata.last_name.trim() : fullName ? fullName.split(' ').slice(1).join(' ') : '';
  const phone = typeof metadata?.phone === 'string' ? metadata.phone.trim() : '';
  return { firstName, lastName, phone };
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-center text-[clamp(1.35rem,2vw,1.75rem)] uppercase leading-none tracking-[0.04em] text-[#111111] font-bold!">
      {children}
    </h2>
  );
}

function BoxHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[16px] uppercase tracking-[0.06em] text-[#222222] font-bold!">{children}</h3>;
}

function DetailField({ label, value, onAdd }: { label: string; value?: string | null; onAdd?: () => void }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-[#222222]">{label}</p>
      {value ? (
        <p className="mt-1 break-all text-[13px] leading-[1.75] text-[#3f3f3f]">{value}</p>
      ) : (
        <button type="button" onClick={onAdd} className="mt-1 text-[13px] text-[#222222] underline underline-offset-4">
          Add
        </button>
      )}
    </div>
  );
}

export default function ProfileClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTabState] = useState<AccountTab>(() => parseTab(searchParams.get('tab')));
  const [state, setState] = useState<ProfileState>(() => cachedProfileState ?? { status: 'loading' });
  const [signingOut, setSigningOut] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [accountStatus, setAccountStatus] = useState('');

  useEffect(() => {
    setTabState(parseTab(searchParams.get('tab')));
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    const applySession = (session: Session | null) => {
      const user = session?.user;
      if (!mounted) return;

      if (!user) {
        cachedProfileState = null;
        setState({ status: 'signed-out' });
        return;
      }

      const metadata = user.user_metadata as Record<string, unknown> | undefined;
      const { firstName: metaFirst, lastName: metaLast, phone: metaPhone } = readMetadata(metadata);
      const nextState: SignedInProfileState = {
        status: 'signed-in',
        email: user.email ?? 'No email available',
        username: getUsername(user.email, metadata),
        firstName: metaFirst,
        lastName: metaLast,
        phone: metaPhone,
        createdAt: user.created_at ?? '',
        userId: user.id,
      };
      cachedProfileState = nextState;
      setState(nextState);
      setFirstName(metaFirst);
      setLastName(metaLast);
      setPhone(metaPhone);
    };

    void supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signedInUserId = state.status === 'signed-in' ? state.userId : '';

  useEffect(() => {
    if (!signedInUserId) return;

    let ignore = false;
    const cacheKey = `${signedInUserId}:${ordersPage}`;
    const cached = ordersCache.get(cacheKey);

    if (cached) {
      setOrders(cached.orders);
      setOrdersTotalPages(cached.totalPages);
      setOrdersError('');
      setOrdersLoading(false);
      if (Date.now() - cached.cachedAt < ORDERS_CACHE_TTL_MS) return;
    }

    const loadOrders = async () => {
      setOrdersLoading(!cached);
      setOrdersError('');

      try {
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;

        if (!accessToken) {
          throw new Error('Please sign in again to view your orders.');
        }

        const response = await fetch(`/api/profile/orders?page=${ordersPage}&pageSize=5`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error || 'Unable to load your orders right now.');
        }

        if (ignore) return;

        const nextOrders = Array.isArray(payload?.orders) ? payload.orders : [];
        const nextTotalPages = Math.max(1, Number(payload?.pagination?.totalPages || 1));
        ordersCache.set(cacheKey, { orders: nextOrders, totalPages: nextTotalPages, cachedAt: Date.now() });
        setOrders(nextOrders);
        setOrdersTotalPages(nextTotalPages);
      } catch (loadError) {
        if (ignore) return;
        setOrdersError(loadError instanceof Error ? loadError.message : 'Unable to load your orders right now.');
      } finally {
        if (!ignore) {
          setOrdersLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      ignore = true;
    };
  }, [ordersPage, signedInUserId]);

  const joinedLabel = useMemo(() => {
    if (state.status !== 'signed-in' || !state.createdAt) return 'Recently joined';
    return new Date(state.createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [state]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
    setSigningOut(false);
  };

  const setTab = (nextTab: AccountTab) => {
    setTabState(nextTab);
    if (nextTab === 'orders') setOrdersPage(1);
    window.history.replaceState(null, '', nextTab === 'dashboard' ? '/profile' : `/profile?tab=${nextTab}`);
  };

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (state.status !== 'signed-in') return;
    setSaving(true);
    setAccountStatus('');
    const fullName = `${firstName} ${lastName}`.trim();
    const { error } = await supabase.auth.updateUser({
      data: { first_name: firstName, last_name: lastName, phone, full_name: fullName },
    });
    if (error) {
      setAccountStatus(error.message);
    } else {
      const next: SignedInProfileState = {
        ...state,
        username: fullName || state.username,
        firstName,
        lastName,
        phone,
      };
      cachedProfileState = next;
      setState(next);
      setAccountStatus('Profile saved.');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (state.status !== 'signed-in') return;
    setAccountStatus('');
    const { error } = await supabase.auth.resetPasswordForEmail(state.email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setAccountStatus(error ? error.message : 'Password reset email sent. Check your inbox.');
  };

  const formatMoney = (amount: number | null | undefined) => formatUsd(amount);

  if (state.status === 'loading') {
    return (
      <section className="min-h-[calc(100vh-111px)] bg-(--color-white) px-4 py-16 sm:px-7">
        <div className="mx-auto max-w-4xl border border-[#e4e4e4] bg-(--color-white) px-6 py-12 text-center text-[13px] text-[#3f3f3f]">
          Loading your account...
        </div>
      </section>
    );
  }

  if (state.status === 'signed-out') {
    return (
      <section className="min-h-[calc(100vh-111px)] bg-(--color-white) px-4 py-16 sm:px-7">
        <div className="mx-auto max-w-4xl border border-[#e4e4e4] bg-(--color-white) px-6 py-12 text-center sm:px-10">
          <h1 className="text-[clamp(1.35rem,2vw,1.75rem)] uppercase leading-none tracking-[0.04em] text-[#111111] font-bold!">
            Sign in to view your account
          </h1>
          <p className="mt-4 text-[13px] leading-[1.75] text-[#3f3f3f]">
            Your profile details and future order history will appear here once you&apos;re signed in.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login" className="brand-button">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-[3rem] items-center justify-center border border-[var(--color-brand-primary,#000000)] px-8 font-[family-name:var(--font-family-button)] text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--color-brand-primary,#000000)] no-underline transition-colors hover:bg-[var(--color-brand-primary,#000000)] hover:text-white"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-111px)] bg-(--color-white)">
      <div className="relative">
        <img src={PROFILE_BANNER} alt="" className="h-[240px] w-full object-cover object-center sm:h-[320px]" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" aria-hidden="true" />
        <h1 className="absolute inset-x-0 bottom-7 px-4 text-center text-[clamp(1.5rem,2.4vw,1.875rem)] uppercase leading-none tracking-[0.04em] text-white font-bold! [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
          Welcome, {state.username}
        </h1>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-7">
        <div className="mt-8 flex items-center gap-6 overflow-x-auto border-b border-[#e4e4e4] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-8">
          {TABS.map((item) => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={
                  'shrink-0 border-b-2 pb-3 text-[14px] transition-colors ' +
                  (isActive
                    ? 'border-[#111111] font-semibold text-[#111111]'
                    : 'border-transparent text-[#767676] hover:text-[#111111]')
                }
              >
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="ml-auto inline-flex shrink-0 items-center gap-2 pb-3 text-[13px] text-[#767676] transition-colors hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={15} strokeWidth={1.75} aria-hidden="true" />
            {signingOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-7 sm:pb-24">
        {tab === 'dashboard' ? (
          <>
            <SectionHeading>Dashboard</SectionHeading>
            <div className="mt-8 border border-[#e4e4e4] bg-(--color-white) px-6 py-6 sm:px-10 sm:py-8">
              <div className="flex items-center justify-between gap-4 border-b border-[#e4e4e4] pb-4">
                <BoxHeading>Account Details</BoxHeading>
                <button
                  type="button"
                  onClick={() => setTab('account')}
                  className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#222222] underline underline-offset-4"
                >
                  Edit
                </button>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <DetailField label="Name" value={state.username} />
                <DetailField label="Email Address" value={state.email} />
                <DetailField label="Phone" value={state.phone || null} onAdd={() => setTab('account')} />
                <DetailField label="Member Since" value={joinedLabel} />
              </div>
            </div>
          </>
        ) : null}

        {tab === 'account' ? (
          <>
            <SectionHeading>Account Details</SectionHeading>
            <div className="mt-8 border border-[#e4e4e4] bg-(--color-white) px-6 py-6 sm:px-10 sm:py-8">
              <BoxHeading>Personal Information</BoxHeading>
              <form onSubmit={handleSaveProfile} className="mt-6 grid gap-3 sm:grid-cols-2">
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  type="text"
                  placeholder="First Name*"
                  aria-label="First name"
                  className={INPUT_CLASS}
                  required
                />
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  type="text"
                  placeholder="Last Name*"
                  aria-label="Last name"
                  className={INPUT_CLASS}
                  required
                />
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  type="tel"
                  placeholder="Phone"
                  aria-label="Phone"
                  className={INPUT_CLASS + ' sm:col-span-2'}
                />
                <div>
                  <button type="submit" disabled={saving} className="brand-button">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 border border-[#e4e4e4] bg-(--color-white) px-6 py-6 sm:px-10 sm:py-8">
              <BoxHeading>Login Information</BoxHeading>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <DetailField label="Email Address" value={state.email} />
                <div>
                  <p className="text-[13px] font-semibold text-[#222222]">Password</p>
                  <p className="mt-1 text-[13px] leading-[1.75] text-[#3f3f3f]">••••••••</p>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#222222] underline underline-offset-4"
                  >
                    Change Password
                  </button>
                </div>
              </div>
              {accountStatus ? <p className="mt-6 text-[13px] text-[#3f3f3f]">{accountStatus}</p> : null}
            </div>
          </>
        ) : null}

        {tab === 'orders' ? (
          <>
            <SectionHeading>Orders</SectionHeading>
            <div className="mt-8">
              {ordersLoading ? (
                <div className="border border-[#e4e4e4] bg-(--color-white) px-6 py-12 text-center text-[13px] text-[#3f3f3f]">
                  Loading your orders...
                </div>
              ) : ordersError ? (
                <div className="border border-[#e4e4e4] bg-(--color-white) px-6 py-12 text-center text-[13px] text-[#8f2f2f]">
                  {ordersError}
                </div>
              ) : orders.length === 0 ? (
                <div className="border border-[#e4e4e4] bg-(--color-white) px-6 py-12 text-center">
                  <ShoppingBag size={22} strokeWidth={1.5} className="mx-auto text-[#222222]" aria-hidden="true" />
                  <p className="mt-4 text-[13px] leading-[1.75] text-[#3f3f3f]">
                    No orders have been placed for the selected time period.
                  </p>
                  <Link
                    href={getCollectionHref()}
                    className="mt-5 inline-block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#222222] underline underline-offset-4"
                  >
                    Shop The Collection
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid gap-4">
                    {orders.map((order) => (
                      <article key={order.id} className="border border-[#e4e4e4] bg-(--color-white) px-6 py-5">
                        <div className="flex flex-col gap-4 border-b border-[#e4e4e4] pb-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-[13px] font-semibold text-[#222222]">{order.order_number || 'Pending Number'}</p>
                            <p className="mt-1 text-[12px] text-[#3f3f3f]">
                              {order.created_at
                                ? new Date(order.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })
                                : 'Recently placed'}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-6">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.08em] text-[#767676]">Status</p>
                              <p className="mt-1 text-[13px] font-semibold capitalize text-[#222222]">{order.status || 'pending'}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.08em] text-[#767676]">Payment</p>
                              <p className="mt-1 text-[13px] font-semibold capitalize text-[#222222]">
                                {order.payment_status || 'pending'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.08em] text-[#767676]">Total</p>
                              <p className="mt-1 text-[13px] font-semibold text-[#222222]">{formatMoney(order.total_amount)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="divide-y divide-[#e4e4e4]">
                          {order.items.map((item, index) => (
                            <div
                              key={`${order.id}-${item.product_name}-${index}`}
                              className="flex items-start justify-between gap-4 py-4"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-semibold text-[#222222]">{item.product_name}</p>
                                <p className="mt-1 text-[12px] uppercase tracking-[0.08em] text-[#767676]">Qty {item.quantity}</p>
                                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[#3f3f3f]">
                                  {buildSelectionLabel(item.selected_metal, item.selected_purity) ? (
                                    <span>Metal: {buildSelectionLabel(item.selected_metal, item.selected_purity)}</span>
                                  ) : null}
                                  {item.selected_size_or_fit ? <span>Size/Fit: {item.selected_size_or_fit}</span> : null}
                                  {item.selected_gemstone ? <span>Stone: {item.selected_gemstone}</span> : null}
                                  {item.selected_carat ? <span>Carat: {item.selected_carat}</span> : null}
                                </div>
                              </div>
                              <p className="shrink-0 text-[13px] font-semibold text-[#222222]">{formatMoney(item.line_total)}</p>
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 border-t border-[#e4e4e4] pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[13px] text-[#3f3f3f]">
                      Page {ordersPage} of {ordersTotalPages}
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setOrdersPage((current) => Math.max(1, current - 1))}
                        disabled={ordersPage <= 1}
                        className="brand-button"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrdersPage((current) => Math.min(ordersTotalPages, current + 1))}
                        disabled={ordersPage >= ordersTotalPages}
                        className="brand-button"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : null}

        {tab === 'wishlist' ? (
          <>
            <SectionHeading>Wish List</SectionHeading>
            <div className="mt-8">
              <WishlistClient embedded />
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
