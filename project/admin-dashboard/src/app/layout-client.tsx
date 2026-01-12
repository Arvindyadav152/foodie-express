"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    UtensilsCrossed,
    Users,
    TicketPercent,
    Settings,
    LogOut,
    Bell,
    Search,
    TrendingUp,
    Package,
    DollarSign
} from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/' },
        { icon: Package, label: 'Live Orders', href: '/orders' },
        { icon: UtensilsCrossed, label: 'Restaurants', href: '/restaurants' },
        { icon: Users, label: 'Users', href: '/users' },
        { icon: TrendingUp, label: 'Drivers', href: '/drivers' },
        { icon: TicketPercent, label: 'Promo Engine', href: '/promos' },
        { icon: DollarSign, label: 'Finance & Fraud', href: '/finance' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    return (
        <div className="flex h-screen bg-[#f8fafc]">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <UtensilsCrossed className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900 uppercase">Foodie Admin</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-50">
                    <button className="sidebar-link w-full text-slate-400 hover:text-red-500">
                        <LogOut size={20} />
                        <span className="text-sm">Logout Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search data, orders, stats..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-600">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-900 uppercase tracking-tighter">Master Admin</p>
                                <p className="text-[10px] text-primary font-black uppercase tracking-widest">Active Now</p>
                            </div>
                            <div className="w-10 h-10 bg-slate-900 rounded-xl"></div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <div className="flex-1 overflow-y-auto p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
