import { View, Text, ScrollView, TouchableOpacity, Switch, Image, RefreshControl, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { router } from 'expo-router';
import api from '../../utils/api';
import { DEMO_IDS } from '../../constants/DemoIds';

const TEST_VENDOR_ID = DEMO_IDS.VENDOR;

export default function VendorDashboard() {
    const { userInfo } = useContext(AuthContext);
    const vendorId = userInfo?.vendorId || DEMO_IDS.VENDOR;

    const [restaurant, setRestaurant] = useState<any>(null);
    const [stats, setStats] = useState({ todaysOrders: 0, totalRevenue: 0, activeOrders: 0 });
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [isOnline, setIsOnline] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const restRes = await api.get(`/vendor/restaurant/${vendorId}`);
            const restData = restRes.data;
            setRestaurant(restData);
            setIsOnline(restData.isActive);

            if (restData?._id) {
                const statsRes = await api.get(`/vendor/stats/${restData._id}`);
                setStats(statsRes.data);

                const ordersRes = await api.get(`/vendor/orders/${restData._id}`);
                setOrders(ordersRes.data.slice(0, 8));

                const menuRes = await api.get(`/menu/${restData._id}`);
                setMenuItems(menuRes.data);
            }
        } catch (error) {
            console.error("Error fetching vendor data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (vendorId) fetchDashboardData();
    }, [vendorId]);

    const toggleStatus = async (value: boolean) => {
        setIsOnline(value);
        try {
            await api.post('/vendor/restaurant', {
                vendorId,
                isActive: value
            });
        } catch (error) {
            console.error("Error toggling status:", error);
            setIsOnline(!value);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const configs: any = {
            confirmed: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'New' },
            preparing: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Preparing' },
            out_for_delivery: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'In Transit' },
            delivered: { bg: 'bg-green-50', text: 'text-green-600', label: 'Done' },
            cancelled: { bg: 'bg-red-50', text: 'text-red-600', label: 'Cancelled' }
        };
        const config = configs[status] || { bg: 'bg-gray-50', text: 'text-gray-600', label: status };

        return (
            <View className={`px-2 py-1 rounded-lg ${config.bg}`}>
                <Text className={`text-[10px] font-black uppercase tracking-wider ${config.text}`}>{config.label}</Text>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View className="flex-1 items-center justify-center bg-[#f5f8f5]">
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} className="bg-white/80 z-50">
                <View className="px-5 py-3 flex-row items-center justify-between border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.push('/vendor/profile')} className="flex-row items-center gap-3">
                        <View className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm overflow-hidden bg-gray-100">
                            <Image
                                source={{ uri: restaurant?.image || 'https://placehold.co/100x100?text=Shop' }}
                                className="w-full h-full"
                            />
                        </View>
                        <View>
                            <Text className="font-black text-[#1A1D3B] text-lg leading-tight" numberOfLines={1}>{restaurant?.name || 'Loading...'}</Text>
                            <View className="flex-row items-center gap-1.5">
                                <View className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#FF6B6B]' : 'bg-gray-300'}`} />
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{isOnline ? 'Active' : 'Offline'}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <View className="flex-row items-center gap-4">
                        <Switch
                            value={isOnline}
                            onValueChange={toggleStatus}
                            trackColor={{ true: '#FF6B6B', false: '#d1d5db' }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboardData(); }} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Stats Section */}
                <View className="px-5 mt-4">
                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1 bg-white p-5 rounded-[28px] shadow-sm border border-gray-50">
                            <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1">Today's Revenue</Text>
                            <Text className="text-2xl font-black text-[#1A1D3B]">${stats.totalRevenue.toFixed(2)}</Text>
                            <View className="flex-row items-center gap-1 mt-1">
                                <Ionicons name="trending-up" size={12} color="#FF6B6B" />
                                <Text className="text-[#FF6B6B] text-[10px] font-black">+12% vs y'day</Text>
                            </View>
                        </View>

                        <View className="flex-1 bg-[#1A1D3B] p-5 rounded-[28px] shadow-xl">
                            <Text className="text-[#FF6B6B]/60 text-[9px] font-black uppercase tracking-widest mb-1">Active Gigs</Text>
                            <Text className="text-2xl font-black text-white">{stats.activeOrders}</Text>
                            <View className="flex-row items-center gap-1 mt-1">
                                <View className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
                                <Text className="text-white/60 text-[10px] font-black uppercase">Live Now</Text>
                            </View>
                        </View>
                    </View>

                    {/* Revenue Insights Chart (Custom Implementation) */}
                    <View className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 mb-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-[#1A1D3B] text-lg font-black uppercase tracking-tight">Revenue Insights</Text>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Last 7 Days</Text>
                            </View>
                            <View className="bg-[#f5f8f5] px-3 py-1.5 rounded-xl">
                                <Text className="text-[#1A1D3B] text-[10px] font-black uppercase tracking-widest">Weekly</Text>
                            </View>
                        </View>

                        <View className="flex-row items-end justify-between h-32 px-2">
                            {[
                                { day: 'M', val: 0.4, active: false },
                                { day: 'T', val: 0.7, active: false },
                                { day: 'W', val: 0.5, active: false },
                                { day: 'T', val: 0.9, active: true },
                                { day: 'F', val: 0.6, active: false },
                                { day: 'S', val: 0.8, active: false },
                                { day: 'S', val: 0.3, active: false },
                            ].map((item, idx) => (
                                <View key={idx} className="items-center gap-2">
                                    <View
                                        style={{ height: `${item.val * 100}%` }}
                                        className={`w-6 rounded-t-lg ${item.active ? 'bg-[#FF6B6B]' : 'bg-[#1A1D3B]/10'}`}
                                    />
                                    <Text className={`text-[10px] font-black ${item.active ? 'text-[#1A1D3B]' : 'text-gray-300'}`}>{item.day}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push('/vendor/menu')}
                        className="w-full bg-white p-6 rounded-[28px] shadow-sm border border-gray-50 flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center gap-4">
                            <View className="w-12 h-12 rounded-2xl bg-[#f5f8f5] items-center justify-center">
                                <MaterialIcons name="restaurant-menu" size={24} color="#FF6B6B" />
                            </View>
                            <View>
                                <Text className="text-[#1A1D3B] font-black text-base uppercase tracking-tight">Manage Kitchen</Text>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{menuItems.length} items live</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                    </TouchableOpacity>
                </View>

                {/* Section Title */}
                <View className="px-6 mb-4 flex-row justify-between items-end">
                    <View>
                        <Text className="text-[#1A1D3B] text-2xl font-black">Incoming Orders</Text>
                        <Text className="text-gray-400 text-xs font-medium">Keep it hot! Customer is waiting.</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/vendor/orders')}>
                        <Text className="text-[#FF6B6B] font-bold text-sm">History</Text>
                    </TouchableOpacity>
                </View>

                {/* Orders List */}
                <View className="px-5 gap-4">
                    {orders.length > 0 ? (
                        orders.map((order: any) => (
                            <TouchableOpacity
                                key={order._id}
                                onPress={() => router.push(`/vendor/order-details/${order._id}`)}
                                className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-50 flex-row gap-4"
                            >
                                <View className="w-12 h-12 bg-[#f5f8f5] rounded-2xl items-center justify-center shadow-inner">
                                    <Text className="font-black text-[#1A1D3B] text-xs">#{order._id.slice(-4).toUpperCase()}</Text>
                                </View>
                                <View className="flex-1 justify-between">
                                    <View className="flex-row justify-between items-start">
                                        <View>
                                            <Text className="font-black text-[#1A1D3B] text-lg" numberOfLines={1}>{order.userId?.fullName || 'Guest User'}</Text>
                                            <Text className="text-gray-400 text-xs font-bold leading-tight uppercase tracking-tighter" numberOfLines={1}>
                                                {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                                            </Text>
                                        </View>
                                        <StatusBadge status={order.status} />
                                    </View>
                                    <View className="flex-row justify-between items-end mt-2">
                                        <View className="flex-row items-center gap-1">
                                            <Ionicons name="time-outline" size={14} color="#9ca3af" />
                                            <Text className="text-gray-400 text-[10px] font-black">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                        </View>
                                        <Text className="font-black text-[#FF6B6B] text-lg">${order.totalAmount.toFixed(2)}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View className="items-center py-20 bg-white/50 rounded-[40px] border border-dashed border-gray-200">
                            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                                <Ionicons name="restaurant-outline" size={40} color="#d1d5db" />
                            </View>
                            <Text className="text-gray-400 font-black uppercase tracking-widest text-xs">Kitchen is Quiet</Text>
                            <Text className="text-gray-300 text-[10px] mt-1">Accepting online orders will show up here.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    absoluteFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    }
});
