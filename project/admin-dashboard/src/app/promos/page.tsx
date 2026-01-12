"use client";

import React, { useState } from 'react';
import {
    Plus,
    TicketPercent,
    Users,
    Calendar,
    Trash2,
    Edit3,
    Search,
    Filter
} from 'lucide-react';
import api from '@/utils/api';
import { useEffect } from 'react';

export default function PromosPage() {
    const [activeTab, setActiveTab] = useState('Coupons'); // 'Coupons' or 'Banners'
    const [showAddModal, setShowAddModal] = useState(false);
    const [promos, setPromos] = useState<any[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [promoRes, bannerRes] = await Promise.all([
                api.get('/promos'),
                api.get('/banners')
            ]);
            setPromos(promoRes.data);
            setBanners(bannerRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type: 'promo' | 'banner', id: string) => {
        if (!confirm('Are you sure you want to delete this?')) return;
        try {
            await api.delete(`/${type === 'promo' ? 'promos' : 'banners'}/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Promo Engine</h1>
                    <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-black">Campaigns • Referrals • Loyalty</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
                >
                    <Plus size={16} />
                    {activeTab === 'Coupons' ? 'Launch New Campaign' : 'Create Hero Banner'}
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-8 border-b border-slate-100">
                {['Coupons', 'Banners'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search coupon codes..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <button className="px-6 py-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-colors">
                    <Filter size={18} className="text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Filters</span>
                </button>
            </div>

            {activeTab === 'Coupons' ? (
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coupon Code</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type / Value</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Conditions</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usage Stats</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {promos.map((promo, idx) => (
                                    <tr key={promo._id || idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <TicketPercent size={16} className="text-primary" />
                                                </div>
                                                <span className="text-sm font-black text-slate-900 tracking-tight uppercase">{promo.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="text-sm font-bold text-slate-900">
                                                {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                                            </p>
                                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{promo.discountType}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Min Order: ${promo.minOrderAmount}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="w-32">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{promo.usedCount}/{promo.usageLimit || '∞'}</span>
                                                </div>
                                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${!promo.isActive ? 'bg-slate-300' : 'bg-primary'}`}
                                                        style={{ width: promo.usageLimit ? `${(promo.usedCount / promo.usageLimit) * 100}%` : '0%' }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar size={12} />
                                                <span className="text-xs font-bold">{new Date(promo.expiryDate).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${promo.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                {promo.isActive ? 'Active' : 'Expired'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete('promo', promo._id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {banners.map((banner, idx) => (
                        <div key={banner._id || idx} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{banner.title}</h3>
                                    <p className="text-[10px]" style={{ color: banner.textColor }} >{banner.offerText}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${banner.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {banner.isActive ? 'Active' : 'Disabled'}
                                </span>
                            </div>

                            <div style={{ backgroundColor: banner.bgColor }} className="flex-1 rounded-[32px] p-8 mb-6 relative overflow-hidden group border-4 border-slate-50">
                                <div className="relative z-10">
                                    <p style={{ color: banner.textColor }} className="text-[8px] font-black uppercase tracking-[4px] mb-2">{banner.title}</p>
                                    <p className="text-3xl font-black text-white italic tracking-tighter mb-1">{banner.offerText}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{banner.subtitle}</p>
                                </div>
                                <div style={{ backgroundColor: banner.textColor }} className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 group-hover:scale-110 transition-transform" />
                            </div>

                            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority: {banner.priority}</span>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-white rounded-lg text-slate-400 shadow-sm transition-all"><Edit3 size={16} /></button>
                                    <button
                                        onClick={() => handleDelete('banner', banner._id)}
                                        className="p-2 hover:bg-red-50 rounded-lg text-red-400 shadow-sm transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="border-4 border-dashed border-slate-100 rounded-[40px] p-12 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-primary hover:border-primary/20 transition-all hover:bg-primary/[0.02]"
                    >
                        <Plus size={40} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Launch New Hero</span>
                    </button>
                </div>
            )}

            {/* Add Modal Placeholder */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl p-10">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">New Promo Campaign</h2>
                        <p className="text-slate-500 text-xs font-medium mb-8 uppercase tracking-widest">Global platform discount generator</p>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Coupon Code</label>
                                    <input type="text" placeholder="e.g. FESTIVAL50" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Discount Type</label>
                                    <select className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm">
                                        <option>Percentage (%)</option>
                                        <option>Fixed Amount ($)</option>
                                        <option>Free Delivery</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Discount Value</label>
                                <input type="number" placeholder="50" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Min. Order ($)</label>
                                    <input type="number" placeholder="100" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Expiry Date</label>
                                    <input type="date" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancel</button>
                            <button className="flex-2 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/30">Launch Campaign</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
