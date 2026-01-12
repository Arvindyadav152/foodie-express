import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useContext } from 'react';
import { router } from 'expo-router';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { DEMO_IDS } from '../../constants/DemoIds';

export default function OrderHistoryScreen() {
    const { userInfo } = useContext(AuthContext);
    const vendorId = userInfo?.vendorId || DEMO_IDS.VENDOR;

    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'delivered' | 'cancelled'>('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const restRes = await api.get(`/vendor/restaurant/${vendorId}`);
            if (restRes.data?._id) {
                const ordersRes = await api.get(`/vendor/orders/${restRes.data._id}`);
                setOrders(ordersRes.data);
            }
        } catch (error) {
            console.error("Error:", error);
            // Mock data
            setOrders([
                { _id: '1', status: 'delivered', totalAmount: 456, createdAt: new Date(), userId: { fullName: 'Rahul Sharma' }, items: [{ name: 'Butter Chicken', quantity: 2 }] },
                { _id: '2', status: 'delivered', totalAmount: 289, createdAt: new Date(Date.now() - 86400000), userId: { fullName: 'Priya Patel' }, items: [{ name: 'Paneer Tikka', quantity: 1 }] },
                { _id: '3', status: 'cancelled', totalAmount: 567, createdAt: new Date(Date.now() - 172800000), userId: { fullName: 'Amit Singh' }, items: [{ name: 'Biryani', quantity: 1 }] },
                { _id: '4', status: 'delivered', totalAmount: 345, createdAt: new Date(Date.now() - 259200000), userId: { fullName: 'Neha Gupta' }, items: [{ name: 'Dal Makhani', quantity: 2 }] },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return order.status === 'delivered' || order.status === 'cancelled';
        return order.status === filter;
    });

    const StatusBadge = ({ status }: { status: string }) => {
        const isDelivered = status === 'delivered';
        return (
            <View className={`px-3 py-1 rounded-full ${isDelivered ? 'bg-[#4ECDC4]/10' : 'bg-red-50'}`}>
                <Text className={`text-xs font-bold ${isDelivered ? 'text-[#4ECDC4]' : 'text-red-500'}`}>
                    {isDelivered ? 'Delivered' : 'Cancelled'}
                </Text>
            </View>
        );
    };

    const renderOrder = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/vendor/order-details/${item._id}`)}
            className="bg-white p-4 rounded-2xl border border-gray-100 mb-3"
        >
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center">
                        <Text className="font-black text-[#1A1D3B] text-xs">#{item._id.slice(-4).toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text className="font-bold text-[#1A1D3B]">{item.userId?.fullName || 'Guest'}</Text>
                        <Text className="text-gray-400 text-xs">{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
                <StatusBadge status={item.status} />
            </View>
            <View className="flex-row items-center justify-between">
                <Text className="text-gray-400 text-sm" numberOfLines={1}>
                    {item.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                </Text>
                <Text className="font-black text-[#FF6B6B]">₹{item.totalAmount.toFixed(0)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#FEFEFE]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-5 py-4 flex-row items-center gap-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="text-xl font-black text-[#1A1D3B]">Order History</Text>
                </View>
            </SafeAreaView>

            {/* Filter Tabs */}
            <View className="flex-row mx-5 mt-4 bg-gray-100 rounded-xl p-1">
                {(['all', 'delivered', 'cancelled'] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setFilter(tab)}
                        className={`flex-1 py-2.5 rounded-lg items-center ${filter === tab ? 'bg-white' : ''}`}
                    >
                        <Text className={`font-bold text-sm capitalize ${filter === tab ? 'text-[#1A1D3B]' : 'text-gray-400'}`}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Stats */}
            <View className="flex-row mx-5 mt-4 gap-3">
                <View className="flex-1 bg-[#4ECDC4]/10 p-4 rounded-2xl items-center">
                    <Text className="text-[#4ECDC4] text-xl font-black">{orders.filter(o => o.status === 'delivered').length}</Text>
                    <Text className="text-[#4ECDC4] text-xs font-bold">Delivered</Text>
                </View>
                <View className="flex-1 bg-red-50 p-4 rounded-2xl items-center">
                    <Text className="text-red-500 text-xl font-black">{orders.filter(o => o.status === 'cancelled').length}</Text>
                    <Text className="text-red-500 text-xs font-bold">Cancelled</Text>
                </View>
                <View className="flex-1 bg-[#FF6B6B]/10 p-4 rounded-2xl items-center">
                    <Text className="text-[#FF6B6B] text-xl font-black">₹{orders.reduce((sum, o) => sum + (o.status === 'delivered' ? o.totalAmount : 0), 0).toFixed(0)}</Text>
                    <Text className="text-[#FF6B6B] text-xs font-bold">Revenue</Text>
                </View>
            </View>

            {/* Orders List */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#FF6B6B" />
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrder}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={
                        <View className="items-center py-20">
                            <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
                            <Text className="text-gray-400 font-bold mt-4">No orders found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
