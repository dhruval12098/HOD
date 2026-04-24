'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Box, ChevronLeft, ChevronRight, LogOut, Package, UserRound } from 'lucide-react';
import { getCollectionHref } from '@/lib/browse-context';
import { supabase } from '@/lib/supabase';

type ProfileState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | {
      status: 'signed-in'
      email: string
      username: string
      createdAt: string
      userId: string
    };

type AccountTab = 'profile' | 'orders';
type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  image_url?: string | null;
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

export default function ProfileClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') === 'orders' ? 'orders' : 'profile';
  const [state, setState] = useState<ProfileState>({ status: 'loading' });
  const [signingOut, setSigningOut] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!mounted) return;

      if (!user) {
        setState({ status: 'signed-out' });
        return;
      }

      setState({
        status: 'signed-in',
        email: user.email ?? 'No email available',
        username: getUsername(user.email, user.user_metadata),
        createdAt: user.created_at ?? '',
        userId: user.id,
      });
    };

    void syncSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;

      if (!mounted) return;

      if (!user) {
        setState({ status: 'signed-out' });
        return;
      }

      setState({
        status: 'signed-in',
        email: user.email ?? 'No email available',
        username: getUsername(user.email, user.user_metadata),
        createdAt: user.created_at ?? '',
        userId: user.id,
      });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (tab !== 'orders' || state.status !== 'signed-in') return;

    let ignore = false;

    const loadOrders = async () => {
      setOrdersLoading(true);
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

        setOrders(Array.isArray(payload?.orders) ? payload.orders : []);
        setOrdersTotalPages(Math.max(1, Number(payload?.pagination?.totalPages || 1)));
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
  }, [ordersPage, state, tab]);

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
    router.replace(nextTab === 'profile' ? '/profile' : '/profile?tab=orders');
  };

  const formatMoney = (amount: number | null | undefined) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  if (state.status === 'loading') {
    return (
      <section className="min-h-[calc(100vh-111px)] bg-[#f7f8fa] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1120px] rounded-[28px] border border-[#e7ebf0] bg-white p-6 text-sm text-[#667085] shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          Loading your account...
        </div>
      </section>
    );
  }

  if (state.status === 'signed-out') {
    return (
      <section className="min-h-[calc(100vh-111px)] bg-[#f7f8fa] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[720px] rounded-[28px] border border-[#e7ebf0] bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#101828]">Sign in to view your account</h1>
          <p className="mt-3 text-sm leading-7 text-[#667085]">
            Your profile details and future order history will appear here once you&apos;re signed in.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#101828] px-6 text-sm font-medium text-white transition hover:bg-[#1d2939]"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#d0d5dd] px-6 text-sm font-medium text-[#344054] transition hover:border-[#101828] hover:text-[#101828]"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-111px)] bg-[#f7f8fa] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-6">
          <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#101828]">My account</h1>
          <p className="mt-2 text-sm text-[#667085]">Manage your profile details and check your orders.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-[24px] border border-[#e7ebf0] bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
            <div className="rounded-[20px] bg-[#f8fafc] p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#101828] text-white">
                <UserRound size={18} />
              </div>
              <div className="mt-4">
                <div className="text-base font-semibold text-[#101828]">{state.username}</div>
                <div className="mt-1 break-all text-sm text-[#667085]">{state.email}</div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => setTab('profile')}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  tab === 'profile' ? 'bg-[#101828] text-white' : 'bg-[#f8fafc] text-[#344054] hover:bg-[#eef2f6]'
                }`}
              >
                <UserRound size={16} />
                My Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrdersPage(1);
                  setTab('orders');
                }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  tab === 'orders' ? 'bg-[#101828] text-white' : 'bg-[#f8fafc] text-[#344054] hover:bg-[#eef2f6]'
                }`}
              >
                <Package size={16} />
                My Orders
              </button>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d0d5dd] px-4 py-3 text-sm font-medium text-[#344054] transition hover:border-[#101828] hover:text-[#101828] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogOut size={16} />
              {signingOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </aside>

          <div className="rounded-[24px] border border-[#e7ebf0] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
            {tab === 'profile' ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#101828]">My Profile</h2>
                  <p className="mt-1 text-sm text-[#667085]">Your core account details from Supabase Auth.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[20px] border border-[#eaecf0] bg-[#fcfcfd] p-4">
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#98a2b3]">Username</div>
                    <div className="mt-2 text-base font-semibold text-[#101828]">{state.username}</div>
                  </div>
                  <div className="rounded-[20px] border border-[#eaecf0] bg-[#fcfcfd] p-4">
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#98a2b3]">Email</div>
                    <div className="mt-2 break-all text-base font-semibold text-[#101828]">{state.email}</div>
                  </div>
                  <div className="rounded-[20px] border border-[#eaecf0] bg-[#fcfcfd] p-4">
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#98a2b3]">Joined</div>
                    <div className="mt-2 text-base font-semibold text-[#101828]">{joinedLabel}</div>
                  </div>
                  <div className="rounded-[20px] border border-[#eaecf0] bg-[#fcfcfd] p-4">
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#98a2b3]">User ID</div>
                    <div className="mt-2 break-all text-sm font-medium text-[#344054]">{state.userId}</div>
                  </div>
                </div>

                <div className="mt-6 rounded-[20px] border border-[#eaecf0] bg-[#f8fafc] p-4">
                  <div className="text-sm font-medium text-[#101828]">Need to shop more?</div>
                  <p className="mt-1 text-sm text-[#667085]">Browse the catalog or come back later. Your session stays active in this browser.</p>
                  <Link
                    href={getCollectionHref()}
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#101828] px-5 text-sm font-medium text-white transition hover:bg-[#1d2939]"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#101828]">My Orders</h2>
                  <p className="mt-1 text-sm text-[#667085]">Your recent orders appear here with current status and totals.</p>
                </div>

                {ordersLoading ? (
                  <div className="rounded-[20px] border border-[#eaecf0] bg-[#fcfcfd] p-8 text-center text-sm text-[#667085]">
                    Loading your orders...
                  </div>
                ) : ordersError ? (
                  <div className="rounded-[20px] border border-[rgba(179,69,69,0.18)] bg-[rgba(179,69,69,0.06)] p-5 text-sm text-[#8f2f2f]">
                    {ordersError}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="rounded-[20px] border border-dashed border-[#d0d5dd] bg-[#fcfcfd] p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2f6] text-[#344054]">
                      <Box size={20} />
                    </div>
                    <div className="mt-4 text-base font-semibold text-[#101828]">No orders yet</div>
                    <p className="mt-2 text-sm leading-6 text-[#667085]">
                      Once you place an order, it will show up here automatically.
                    </p>
                    <Link
                      href={getCollectionHref()}
                      className="mt-5 inline-flex h-10 items-center justify-center rounded-full border border-[#d0d5dd] px-5 text-sm font-medium text-[#344054] transition hover:border-[#101828] hover:text-[#101828]"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4">
                      {orders.map((order) => (
                        <article key={order.id} className="rounded-[22px] border border-[#eaecf0] bg-[#fcfcfd] p-5">
                          <div className="flex flex-col gap-4 border-b border-[#eaecf0] pb-4 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#98a2b3]">Order</div>
                              <div className="mt-2 text-lg font-semibold text-[#101828]">{order.order_number || 'Pending Number'}</div>
                              <div className="mt-1 text-sm text-[#667085]">
                                {order.created_at
                                  ? new Date(order.created_at).toLocaleDateString(undefined, {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })
                                  : 'Recently placed'}
                              </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                              <div className="rounded-[18px] border border-[#e7ebf0] bg-white px-4 py-3">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-[#98a2b3]">Status</div>
                                <div className="mt-2 text-sm font-semibold capitalize text-[#101828]">{order.status || 'pending'}</div>
                              </div>
                              <div className="rounded-[18px] border border-[#e7ebf0] bg-white px-4 py-3">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-[#98a2b3]">Payment</div>
                                <div className="mt-2 text-sm font-semibold capitalize text-[#101828]">
                                  {order.payment_status || 'pending'}
                                </div>
                              </div>
                              <div className="rounded-[18px] border border-[#e7ebf0] bg-white px-4 py-3">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-[#98a2b3]">Total</div>
                                <div className="mt-2 text-sm font-semibold text-[#101828]">{formatMoney(order.total_amount)}</div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3">
                            {order.items.map((item, index) => (
                              <div
                                key={`${order.id}-${item.product_name}-${index}`}
                                className="flex items-center justify-between gap-4 rounded-[18px] border border-[#edf1f5] bg-white px-4 py-3"
                              >
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-semibold text-[#101828]">{item.product_name}</div>
                                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#98a2b3]">
                                    Qty {item.quantity}
                                  </div>
                                </div>
                                <div className="shrink-0 text-sm font-semibold text-[#101828]">{formatMoney(item.line_total)}</div>
                              </div>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 border-t border-[#eaecf0] pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-[#667085]">
                        Page {ordersPage} of {ordersTotalPages}
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setOrdersPage((current) => Math.max(1, current - 1))}
                          disabled={ordersPage <= 1}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#d0d5dd] px-4 text-sm font-medium text-[#344054] transition hover:border-[#101828] hover:text-[#101828] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ChevronLeft size={16} />
                          Previous
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrdersPage((current) => Math.min(ordersTotalPages, current + 1))}
                          disabled={ordersPage >= ordersTotalPages}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#d0d5dd] px-4 text-sm font-medium text-[#344054] transition hover:border-[#101828] hover:text-[#101828] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Next
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
