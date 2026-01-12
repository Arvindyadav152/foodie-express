"use client";

import React, { useEffect, useState } from 'react';
import {
    DollarSign,
    ShieldAlert,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Search,
    CheckCircle,
    AlertTriangle,
    History
} from 'lucide-react';
import api from '@/lib/api';

export default function FinancePage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchFinanceStats = async () => {
        try {
            const { data } = await api.get('/admin/finance/stats');
            setStats(data);
        } catch (error) {
            console.error("Error fetching finance stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinanceStats();
    }, []);

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Finance & Audit</h1>
                    <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-black">Revenue Streams • Fraud Prevention • Payouts</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-2">
                        <ShieldAlert size={16} />
                        Security Lockdown
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">Platform Revenue</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter relative z-10">${stats?.revenue?.toFixed(2) || '0.00'}</h3>
                    <div className="mt-4 flex items-center gap-2 text-green-500 relative z-10">
                        <ArrowUpRight size={16} />
                        <span className="text-[10px] font-black uppercase">Growth +18%</span>
                    </div>
                    <DollarSign className="absolute -bottom-10 -right-10 text-slate-50 w-48 h-48" />
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Flagged / High Risk</p>
                    <h3 className="text-3xl font-black text-red-500 tracking-tighter">{stats?.flaggedCount || 0}</h3>
                    <div className="mt-4 flex items-center gap-2 text-slate-400">
                        <Activity size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest font-black">Scanning System Live</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Vendor Payouts Pending</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">${stats?.payoutsPending?.toFixed(2) || '0.00'}</h3>
                    <button className="mt-4 text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Process Payouts</button>
                </div>
            </div>

            {/* Main Section: Transaction Audit */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                            <History size={20} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Financial Audit Trail</h2>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="text" placeholder="Transaction ID..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Analysis</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="py-20 text-center text-slate-300 font-bold uppercase tracking-[10px] animate-pulse">Running Integrity Check...</td></tr>
                            ) : (
                                stats?.transactions?.map((tx: any) => (
                                    <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-6">
                                            <p className="text-sm font-black text-slate-900 tracking-tighter uppercase">{tx.transactionId || 'INTERNAL'}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{tx.userId?.fullName || 'Anonymous'}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="text-sm font-black text-slate-900">${tx.totalAmount.toFixed(2)}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1 rounded-full w-fit">
                                                <CheckCircle size={10} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">{tx.paymentStatus}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full w-fit ${tx.riskStatus === 'high_risk' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                {tx.riskStatus === 'high_risk' ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
                                                <span className="text-[8px] font-black uppercase tracking-widest">{tx.riskStatus}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-xs font-bold text-slate-400">
                                            {new Date(tx.createdAt).toLocaleString()}
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
