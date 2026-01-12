import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, StatusBar, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { useRequireAuth } from '../../hooks/useRequireAuth';

export default function VendorOrders() {
    const { vendorId, isLoading: authLoading } = useRequireAuth('vendor');
    const { joinAsVendor, newOrderNotification, clearNewOrderNotification } = useSocket();

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        if (!vendorId) return;
        try {
            const restRes = await api.get(`/vendor/restaurant/${vendorId}`);
            const restId = restRes.data._id;
            const ordersRes = await api.get(`/vendor/orders/${restId}`);
            setOrders(ordersRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Join vendor socket room for real-time notifications
        if (vendorId) {
            joinAsVendor(vendorId);
        }
    }, [vendorId]);

    // Listen for new order notifications
    useEffect(() => {
        if (newOrderNotification) {
            const notification = newOrderNotification as any;
            Alert.alert(
                '🔔 Naya Order Aaya!',
                `Order #${notification.orderId?.slice(-6)} - Jaldi accept karo!`,
                [
                    { text: 'Dekho', onPress: () => { fetchData(); clearNewOrderNotification(); } }
                ]
            );
        }
    }, [newOrderNotification]);

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
                <View className="px-5 py-3 flex-row items-center gap-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-2xl bg-[#f5f8f5] items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-black text-[#1A1D3B] uppercase tracking-tight">Order Logs</Text>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total {orders.length} Gigs</Text>
                    </View>
                </View>
            </SafeAreaView>

            <FlatList
                data={orders}
                keyExtractor={(item: any) => item._id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => router.push(`/vendor/order-details/${item._id}`)}
                        className="bg-white mx-5 mb-4 p-5 rounded-[32px] shadow-sm border border-gray-50 flex-row gap-4"
                    >
                        <View className="w-12 h-12 bg-[#f5f8f5] rounded-2xl items-center justify-center shadow-inner">
                            <Text className="font-black text-[#1A1D3B] text-[10px]">#{item._id.slice(-4).toUpperCase()}</Text>
                        </View>
                        <View className="flex-1 justify-between">
                            <View className="flex-row justify-between items-start">
                                <View>
                                    <Text className="font-black text-[#1A1D3B] text-base" numberOfLines={1}>{item.userId?.fullName || 'Guest User'}</Text>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter" numberOfLines={1}>
                                        {item.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                                    </Text>
                                </View>
                                <StatusBadge status={item.status} />
                            </View>
                            <View className="flex-row justify-between items-end mt-2">
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="time-outline" size={14} color="#9ca3af" />
                                    <Text className="text-gray-400 text-[10px] font-black">{new Date(item.createdAt).toLocaleDateString()}</Text>
                                </View>
                                <Text className="font-black text-[#FF6B6B] text-lg">${item.totalAmount.toFixed(2)}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View className="items-center py-20 px-10">
                        <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-6 shadow-sm">
                            <Ionicons name="receipt-outline" size={40} color="#d1d5db" />
                        </View>
                        <Text className="text-[#1A1D3B] text-xl font-black text-center uppercase">No History Found</Text>
                        <Text className="text-gray-500 text-center mt-2 font-medium">Your historical orders will appear here.</Text>
                    </View>
                }
            />
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
