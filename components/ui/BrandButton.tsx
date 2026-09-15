import Link from 'next/link'
import type { ComponentProps, ButtonHTMLAttributes, MouseEvent } from 'react'

import { cn } from '@/lib/utils'

type BrandButtonSharedProps = {
  children: React.ReactNode
  className?: string
}

type NextLinkProps = ComponentProps<typeof Link>

type BrandButtonLinkProps = BrandButtonSharedProps &
  Omit<NextLinkProps, 'children' | 'className' | 'href' | 'type'> & {
    href: NextLinkProps['href']
    disabled?: boolean
    type?: never
  }

type BrandButtonActionProps = BrandButtonSharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className' | 'href'> & {
    href?: never
  }

export type BrandButtonProps = BrandButtonLinkProps | BrandButtonActionProps

export function BrandButton(props: BrandButtonProps) {
  const className = cn('brand-button', props.className)

  if ('href' in props && props.href !== undefined) {
    const { children, disabled = false, onClick, ...linkProps } = props

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        event.preventDefault()
        return
      }

      onClick?.(event)
    }

    return (
      <Link
        {...linkProps}
        aria-disabled={disabled || undefined}
        className={className}
        onClick={handleClick}
        tabIndex={disabled ? -1 : linkProps.tabIndex}
      >
        {children}
      </Link>
    )
  }

  const { children, type = 'button', ...buttonProps } = props

  return (
    <button {...buttonProps} className={className} type={type}>
      {children}
    </button>
  )
}

export default BrandButton
