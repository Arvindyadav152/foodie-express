"use client";

import React from 'react';
import {
    UtensilsCrossed,
    Star,
    TrendingUp,
    Plus,
    Search,
    Filter,
    ExternalLink,
    Edit2
} from 'lucide-react';

export default function RestaurantsPage() {
    const restaurants = [
        { name: 'Pizza Palace', category: 'Italian', rating: 4.8, orders: 1240, revenue: '$22,400', status: 'Open', image: '' },
        { name: 'Sushi Zen', category: 'Japanese', rating: 4.9, orders: 850, revenue: '$34,120', status: 'Open', image: '' },
        { name: 'Burger King', category: 'Fast Food', rating: 4.5, orders: 2100, revenue: '$18,900', status: 'Closed', image: '' },
        { name: 'Taco Bell', category: 'Mexican', rating: 4.2, orders: 940, revenue: '$12,400', status: 'Open', image: '' },
    ];

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Merchant Hub</h1>
                    <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-black">Restaurant Partners • Menu Control • Analytics</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/30 hover:opacity-90 transition-all">
                    <Plus size={16} />
                    Onboard New Partner
                </button>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Partners', value: '48', icon: UtensilsCrossed, color: 'text-slate-900' },
                    { label: 'Active Menus', value: '256', icon: Star, color: 'text-slate-900' },
                    { label: 'Avg Merchant Rating', value: '4.6', icon: Star, color: 'text-orange-500' },
                    { label: 'Merchant Payouts', value: '$84k', icon: TrendingUp, color: 'text-green-500' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4">
                            <stat.icon size={20} className={stat.color} />
                        </div>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Partners List */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <div className="flex gap-4 flex-1 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search partners..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm"
                            />
                        </div>
                        <button className="px-4 py-2 bg-slate-50 rounded-xl">
                            <Filter size={18} className="text-slate-400" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Restaurant Partner</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Orders</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {restaurants.map((res, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden"></div>
                                            <span className="text-sm font-black text-slate-900 tracking-tight uppercase">{res.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-xs font-bold text-slate-500 uppercase">{res.category}</td>
                                    <td className="px-10 py-6 text-sm font-black text-slate-900">{res.orders}</td>
                                    <td className="px-10 py-6 text-sm font-black text-slate-900">{res.revenue}</td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-1.5">
                                            <Star size={14} className="fill-orange-400 text-orange-400" />
                                            <span className="text-sm font-black text-slate-900">{res.rating}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${res.status === 'Open' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex gap-2">
                                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
