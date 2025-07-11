import React, { PropsWithChildren } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
    href: string;
    icon: React.ReactNode;
    activeColor?: string;
    inactiveColor?: string;
    border?: boolean;
    warning?: string;
}

const NavLink = ({ href, icon, activeColor, inactiveColor, border, warning, children }: PropsWithChildren<NavLinkProps>) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    const base =
        'text-base font-medium px-3 py-1 rounded transition-colors flex items-center gap-1 select-none';
    const active = activeColor || 'bg-blue-700 text-blue-100';
    const inactive = inactiveColor || 'hover:bg-blue-800';
    const borderClass = border ? 'border border-blue-600' : '';
    const className = [
        base,
        isActive ? active : inactive,
        borderClass
    ].join(' ');

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (warning) {
            const confirmed = window.confirm(warning);
            if (!confirmed) {
                e.preventDefault();
            }
        }
    };

    return (
        <Link href={href} className={className} onClick={handleClick}>
            {icon}
            {children}
        </Link>
    );
};

export default NavLink;
