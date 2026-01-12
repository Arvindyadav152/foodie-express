"use client";

import React, { useEffect, useState } from 'react';
import {
    Users,
    ShieldCheck,
    MapPin,
    Phone,
    Star,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import api from '@/lib/api';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleVerify = async (userId: string) => {
        try {
            await api.put(`/admin/users/${userId}/verify`);
            fetchUsers(); // Refresh list
        } catch (error) {
            alert("Failed to update status");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">User & Partner Control</h1>
                    <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-black">Approve Vendors • Verify Drivers • User Directory</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">Export All Data</button>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>
                <button className="px-6 py-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-colors text-[10px] font-black uppercase tracking-widest text-slate-600">
                    <Filter size={18} className="text-slate-400" /> Filter Roles
                </button>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name / ID</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Approval Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined On</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Establishing Connection...</td></tr>
                            ) : (
                                users.map((user, idx) => (
                                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users size={20} className="text-slate-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{user.fullName}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold tracking-wider">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-slate-900 text-white' :
                                                    user.role === 'vendor' ? 'bg-purple-100 text-purple-600' :
                                                        user.role === 'driver' ? 'bg-blue-100 text-blue-600' :
                                                            'bg-slate-100 text-slate-500'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            {user.role === 'user' ? (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">N/A</span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {user.isVerified ? (
                                                        <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1 rounded-full">
                                                            <CheckCircle size={12} />
                                                            <span className="text-[8px] font-black uppercase tracking-widest">Approved</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
                                                            <Clock size={12} />
                                                            <span className="text-[8px] font-black uppercase tracking-widest">Pending</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="text-xs font-bold text-slate-400">{new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex gap-4">
                                                {(user.role === 'vendor' || user.role === 'driver') && (
                                                    <button
                                                        onClick={() => toggleVerify(user._id)}
                                                        className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${user.isVerified
                                                                ? 'border-red-100 text-red-500 hover:bg-red-50'
                                                                : 'border-primary/20 text-primary hover:bg-primary/5'
                                                            }`}
                                                    >
                                                        {user.isVerified ? 'Reject Access' : 'Approve Member'}
                                                    </button>
                                                )}
                                                <button className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-900 transition-colors">Details</button>
                                            </div>
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
