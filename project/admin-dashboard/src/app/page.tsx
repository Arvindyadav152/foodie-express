"use client";

import React from 'react';
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { label: 'Total Revenue', value: '$45,280.50', change: '+12.5%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Orders', value: '24', change: '8 Live Now', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Users', value: '1,240', change: '+180 new', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending Payouts', value: '$3,400', change: '4 Vendors', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Operations Hub</h1>
          <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-black">Platform Overview • Live Stream</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">Export DB</button>
          <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/30 hover:opacity-90 transition-all">Broadcast Alert</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-green-500' : 'text-slate-400'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Recent Live Orders</h2>
            <button className="text-primary text-[10px] font-black uppercase tracking-widest">View All Orders</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { id: '#FD-8821', user: 'Arvind Y.', amt: '$42.50', status: 'In Kitchen', color: 'bg-orange-100 text-orange-600' },
                  { id: '#FD-8822', user: 'Neha S.', amt: '$128.00', status: 'Delivering', color: 'bg-blue-100 text-blue-600' },
                  { id: '#FD-8823', user: 'Rahul M.', amt: '$15.20', status: 'Delivered', color: 'bg-green-100 text-green-600' },
                  { id: '#FD-8824', user: 'Sneha P.', amt: '$64.00', status: 'Verification', color: 'bg-primary/20 text-primary' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 text-sm font-bold text-slate-900">{row.id}</td>
                    <td className="px-8 py-5 text-sm text-slate-600 font-medium">{row.user}</td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900">{row.amt}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${row.color}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Center */}
        <div className="space-y-6">
          <div className="bg-[#111811] rounded-[40px] p-8 relative overflow-hidden shadow-2xl">
            <h2 className="text-white text-xl font-black uppercase tracking-tight mb-4 z-10 relative">Promo Engine</h2>
            <p className="text-white/60 text-xs font-medium mb-6 z-10 relative">Create flash deals or personalized coupons to boost sales in specific zones.</p>
            <button className="bg-primary text-[#111811] w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest z-10 relative hover:scale-[1.02] active:scale-[0.98] transition-all">New Campaign</button>
            <TrendingUp className="absolute -bottom-10 -right-10 text-white/5 w-48 h-48" />
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
            <h2 className="text-slate-900 text-lg font-black uppercase tracking-tight mb-6">Service Health</h2>
            <div className="space-y-4">
              {[
                { label: 'API Gateway', status: 'Healthy', color: 'text-green-500' },
                { label: 'Redis Cluster', status: 'Normal', color: 'text-green-500' },
                { label: 'Socket Stream', status: 'Heavy Load', color: 'text-orange-500' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{item.label}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
