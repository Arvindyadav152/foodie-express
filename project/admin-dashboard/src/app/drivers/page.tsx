"use client";

import React, { useState, useEffect } from 'react';
import {
    Truck, Search, Filter, MapPin, Phone, Star, CheckCircle,
    XCircle, Clock, TrendingUp, DollarSign, Package, AlertCircle,
    MoreVertical, Eye, Ban, Shield
} from 'lucide-react';

interface Driver {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    profileImage?: string;
    isOnline: boolean;
    isVerified: boolean;
    driverStats: {
        completedTrips: number;
        totalEarnings: number;
        rating: number;
    };
    vehicleType: string;
    currentLocation?: { lat: number; lng: number };
    createdAt: string;
}

export default function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
    const [stats, setStats] = useState({
        total: 0,
        online: 0,
        activeDeliveries: 0,
        avgRating: 4.8
    });

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/admin/drivers');
            const data = await res.json();
            setDrivers(data.drivers || []);
            setStats({
                total: data.total || 0,
                online: data.online || 0,
                activeDeliveries: data.activeDeliveries || 0,
                avgRating: data.avgRating || 4.8
            });
        } catch (error) {
            console.error('Failed to fetch drivers:', error);
            // Mock data for demo
            setDrivers([
                {
                    _id: '1',
                    fullName: 'Rajesh Kumar',
                    email: 'rajesh@example.com',
                    phone: '+91 98765 43210',
                    isOnline: true,
                    isVerified: true,
                    driverStats: { completedTrips: 234, totalEarnings: 45600, rating: 4.9 },
                    vehicleType: 'Bike',
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    fullName: 'Amit Singh',
                    email: 'amit@example.com',
                    phone: '+91 87654 32109',
                    isOnline: true,
                    isVerified: true,
                    driverStats: { completedTrips: 187, totalEarnings: 38200, rating: 4.7 },
                    vehicleType: 'Scooter',
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '3',
                    fullName: 'Priya Sharma',
                    email: 'priya@example.com',
                    phone: '+91 76543 21098',
                    isOnline: false,
                    isVerified: true,
                    driverStats: { completedTrips: 156, totalEarnings: 32100, rating: 4.8 },
                    vehicleType: 'Bike',
                    createdAt: new Date().toISOString()
                }
            ]);
            setStats({ total: 156, online: 48, activeDeliveries: 23, avgRating: 4.8 });
        } finally {
            setLoading(false);
        }
    };

    const filteredDrivers = drivers.filter(driver => {
        const matchesSearch = driver.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            driver.phone.includes(searchQuery);
        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'online' && driver.isOnline) ||
            (filterStatus === 'offline' && !driver.isOnline);
        return matchesSearch && matchesFilter;
    });

    const toggleDriverStatus = async (driverId: string, action: 'suspend' | 'activate') => {
        try {
            await fetch(`http://localhost:8000/api/admin/drivers/${driverId}/${action}`, {
                method: 'PUT'
            });
            fetchDrivers();
        } catch (error) {
            console.error('Failed to update driver status');
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Delivery Partners</h1>
                    <p className="text-slate-500 mt-1">Manage and monitor all delivery partners</p>
                </div>
                <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all">
                    <Truck size={20} />
                    Add New Driver
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <Truck className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total Drivers</p>
                            <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                            <MapPin className="text-green-600" size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Online Now</p>
                            <p className="text-3xl font-black text-green-600">{stats.online}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
                            <Package className="text-orange-600" size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Active Deliveries</p>
                            <p className="text-3xl font-black text-orange-600">{stats.activeDeliveries}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center">
                            <Star className="text-yellow-600" size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Avg Rating</p>
                            <p className="text-3xl font-black text-slate-900">{stats.avgRating}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
                    {(['all', 'online', 'offline'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-3 text-sm font-medium capitalize ${filterStatus === status ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Drivers Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="text-left p-4 text-slate-600 font-bold text-sm">Driver</th>
                            <th className="text-left p-4 text-slate-600 font-bold text-sm">Status</th>
                            <th className="text-left p-4 text-slate-600 font-bold text-sm">Vehicle</th>
                            <th className="text-left p-4 text-slate-600 font-bold text-sm">Completed</th>
                            <th className="text-left p-4 text-slate-600 font-bold text-sm">Earnings</th>
                            <th className="text-left p-4 text-slate-600 font-bold text-sm">Rating</th>
                            <th className="text-left p-4 text-slate-600 font-bold text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-500">Loading drivers...</td>
                            </tr>
                        ) : filteredDrivers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-500">No drivers found</td>
                            </tr>
                        ) : filteredDrivers.map((driver) => (
                            <tr key={driver._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center text-white font-bold">
                                            {driver.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 flex items-center gap-2">
                                                {driver.fullName}
                                                {driver.isVerified && <Shield className="text-blue-500" size={14} />}
                                            </p>
                                            <p className="text-slate-500 text-sm">{driver.phone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${driver.isOnline
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {driver.isOnline ? '● Online' : '○ Offline'}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-600 font-medium">{driver.vehicleType || 'Bike'}</td>
                                <td className="p-4 font-bold text-slate-900">{driver.driverStats?.completedTrips || 0}</td>
                                <td className="p-4 font-bold text-green-600">₹{(driver.driverStats?.totalEarnings || 0).toLocaleString()}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1">
                                        <Star className="text-yellow-500 fill-yellow-500" size={14} />
                                        <span className="font-bold text-slate-900">{driver.driverStats?.rating?.toFixed(1) || '5.0'}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-slate-100 rounded-lg" title="View Details">
                                            <Eye size={18} className="text-slate-500" />
                                        </button>
                                        <button className="p-2 hover:bg-slate-100 rounded-lg" title="Call Driver">
                                            <Phone size={18} className="text-slate-500" />
                                        </button>
                                        <button
                                            onClick={() => toggleDriverStatus(driver._id, 'suspend')}
                                            className="p-2 hover:bg-red-50 rounded-lg"
                                            title="Suspend"
                                        >
                                            <Ban size={18} className="text-red-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
