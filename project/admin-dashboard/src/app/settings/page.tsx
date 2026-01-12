"use client";

import React from 'react';
import {
    Settings as SettingsIcon,
    Lock,
    Bell,
    Globe,
    Database,
    ShieldCheck,
    Smartphone,
    Server
} from 'lucide-react';

export default function SettingsPage() {
    const sections = [
        {
            title: 'Platform Config',
            icon: SettingsIcon,
            items: [
                { label: 'Commission Rate (%)', value: '15', desc: 'Default marketplace fee' },
                { label: 'Minimum Delivery Fee', value: '$25', desc: 'Flat base fee for orders' },
                { label: 'Merchant Auto-Approval', value: 'Off', desc: 'Manual review required' },
            ]
        },
        {
            title: 'Global Security',
            icon: ShieldCheck,
            items: [
                { label: 'Two-Factor Auth', value: 'Required', desc: 'For all admin sessions' },
                { label: 'API Rate Limiting', value: '100 req/min', desc: 'Hard limit per user' },
                { label: 'IP Whitelisting', value: 'Inactive', desc: 'Allow specific office IPs' },
            ]
        }
    ];

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Platform Control</h1>
                    <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-black">Global Variables • API • Security</p>
                </div>
                <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-xl">Save All Changes</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary">
                                <section.icon size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{section.title}</h2>
                        </div>

                        <div className="space-y-8">
                            {section.items.map((item, id) => (
                                <div key={id} className="flex justify-between items-center group">
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tighter mb-0.5">{item.label}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="text"
                                            defaultValue={item.value}
                                            className="w-24 text-right px-3 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Tech Stack Indicator */}
                <div className="lg:col-span-2 bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
                    <div className="flex justify-between items-center z-10 relative">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                                <Server size={32} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">System Architecture</h3>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-[3px] mt-1">Status: High Performance</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
                                <p className="text-white/40 text-[8px] font-black uppercase tracking-widest mb-1">Latency</p>
                                <p className="text-lg font-black tracking-tighter">42ms</p>
                            </div>
                            <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
                                <p className="text-white/40 text-[8px] font-black uppercase tracking-widest mb-1">Uptime</p>
                                <p className="text-lg font-black tracking-tighter">99.9%</p>
                            </div>
                        </div>
                    </div>
                    <Database className="absolute -bottom-20 -right-20 text-white/5 w-80 h-80" />
                </div>
            </div>
        </div>
    );
}
