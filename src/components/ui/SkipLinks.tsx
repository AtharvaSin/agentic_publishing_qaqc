'use client';

import { FC } from 'react';
import { cn } from '@/lib/utils';
import { DEFAULT_SKIP_LINKS, SkipLinkTarget } from '@/lib/accessibility';

export interface SkipLinksProps {
  links?: SkipLinkTarget[];
  className?: string;
}

/**
 * Skip links for keyboard navigation accessibility
 * These links are visually hidden but appear on focus
 */
export const SkipLinks: FC<SkipLinksProps> = ({
  links = DEFAULT_SKIP_LINKS,
  className,
}) => {
  return (
    <nav
      aria-label="Skip navigation"
      className={cn('tw-fixed tw-top-0 tw-left-0 tw-z-[100]', className)}
    >
      <ul className="tw-m-0 tw-p-0 tw-list-none">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              className={cn(
                // Visually hidden by default
                'tw-absolute tw-left-[-9999px] tw-top-0',
                'tw-z-[100] tw-px-4 tw-py-2',
                'tw-bg-aurora-cyan tw-text-obsidian-900',
                'tw-font-semibold tw-text-body',
                'tw-no-underline tw-rounded-br-lg',
                'tw-transition-all tw-duration-200',
                // Show on focus
                'focus:tw-left-0 focus:tw-outline-none',
                'focus:tw-ring-2 focus:tw-ring-aurora-cyan focus:tw-ring-offset-2',
                'focus:tw-ring-offset-obsidian-900'
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SkipLinks;
