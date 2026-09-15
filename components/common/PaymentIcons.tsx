'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCcVisa,
  faCcMastercard,
  faCcAmex,
  faCcDinersClub,
  faCcPaypal,
} from '@fortawesome/free-brands-svg-icons';

const PAYMENT_ICONS = [
  { icon: faCcVisa, label: 'Visa' },
  { icon: faCcMastercard, label: 'Mastercard' },
  { icon: faCcAmex, label: 'American Express' },
  { icon: faCcDinersClub, label: 'Diners Club' },
  { icon: faCcPaypal, label: 'PayPal' },
] as const;

export function PaymentIcons() {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-[var(--space-4)] text-white/85 lg:justify-end"
      role="img"
      aria-label="Accepted payment methods: Visa, Mastercard, American Express, Diners Club, PayPal"
    >
      {PAYMENT_ICONS.map(({ icon, label }) => (
        <span key={label} title={label} className="inline-flex h-10 items-center lg:h-12">
          <FontAwesomeIcon icon={icon} aria-hidden="true" className="h-10 w-auto lg:h-12" />
        </span>
      ))}
    </div>
  );
}
