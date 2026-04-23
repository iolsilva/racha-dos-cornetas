"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type AppNavLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  children: ReactNode;
};

export function AppNavLink({ href, children, prefetch, ...props }: AppNavLinkProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch ?? false}
      {...props}
    >
      {children}
    </Link>
  );
}
