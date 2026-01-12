"use client";

import React, { useEffect, useState } from 'react';
import {
    Package,
    MapPin,
    Clock,
    ChevronRight,
    Search,
    Filter,
    AlertCircle,
    ShoppingBag,
    ExternalLink,
    ShieldCheck
} from 'lucide-react';
import api from '@/lib/api';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/admin/orders');
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Master Ledger</h1>
                    <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-black">All Orders • Customer Records • Transaction History</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl flex items-center gap-3 shadow-2xl">
                        <span className="text-[10px] font-black uppercase tracking-widest">Total Logs: {orders.length}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="relative col-span-1 lg:col-span-3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Customer Name, or Restaurant..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-medium shadow-sm transition-all focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <button className="px-6 py-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm">
                    <Filter size={18} className="text-slate-400" /> Advanced Logic
                </button>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Reference</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer / User</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Merchant Partner</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">OTP</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={8} className="py-20 text-center text-slate-300 font-black uppercase tracking-[5px] animate-pulse">Scanning Database Matrix...</td></tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                                    <ShoppingBag size={18} className="text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 tracking-tight uppercase">#ORD-{order._id.slice(-6).toUpperCase()}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date(order.createdAt).toLocaleTimeString()} • {order.items.length} Units</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{order.userId?.fullName || 'Guest'}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{order.userId?.email || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{order.restaurantId?.name || 'Partner Deleted'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                                    'bg-orange-100 text-orange-600'
                                                }`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${order.paymentMethod === 'cod' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                {order.paymentMethod === 'cod' ? '💵 COD' : '💳 Online'}
                                                {order.paymentStatus === 'paid' && ' ✓'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-sm font-black text-slate-900 tracking-tighter">₹{order.totalAmount.toFixed(0)}</p>
                                            {order.promoCode && (
                                                <p className="text-[8px] text-primary font-black uppercase tracking-widest">Promo: {order.promoCode}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg inline-block">
                                                <span className="text-sm font-black text-slate-900 tracking-[3px]">{order.verificationCode || '----'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-slate-900 hover:text-white transition-all">
                                                <ExternalLink size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
