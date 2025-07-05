import React from "react";
import Link, { LinkProps } from "next/link";

interface ButtonLinkProps extends Omit<LinkProps, 'href'>, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    href: LinkProps['href'];
    children: React.ReactNode;
    className?: string;
}

export function LinkButton({ href, children, className, ...props }: ButtonLinkProps) {
    const style = `bg-blue-600 hover:bg-blue-700 select-none cursor-pointer text-white font-semibold px-6 py-2 rounded-full shadow-lg transition-colors ${className ?? ''}`;
    return (
        <Link href={href} className={style} {...props}>
            {children}
        </Link>
    );
}
