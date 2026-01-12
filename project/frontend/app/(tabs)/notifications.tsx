import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useState, useCallback, useContext } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

export default function NotificationsScreen() {
    // ... no changes to logic ...
    const { userInfo } = useContext(AuthContext);
    const userId = userInfo?._id;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get(`/orders/user/${userId}`);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [userId])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return { icon: 'receipt', color: '#3b82f6', text: 'Order Confirmed' };
            case 'preparing':
                return { icon: 'restaurant', color: '#f59e0b', text: 'Preparing Food' };
            case 'out-for-delivery':
                return { icon: 'delivery-dining', color: '#8b5cf6', text: 'Out for Delivery' };
            case 'delivered':
                return { icon: 'check-circle', color: '#FF6B6B', text: 'Delivered' };
            case 'cancelled':
                return { icon: 'cancel', color: '#ef4444', text: 'Cancelled' };
            default:
                return { icon: 'notifications', color: '#9ca3af', text: 'Notification' };
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#f5f8f5]">
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    if (!userId) {
        return (
            <View className="flex-1 items-center justify-center bg-[#f5f8f5] px-8">
                <View className="w-24 h-24 bg-white rounded-[40px] items-center justify-center mb-6 shadow-sm">
                    <MaterialIcons name="lock-outline" size={48} color="#d1d5db" />
                </View>
                <Text className="text-[#1A1D3B] text-2xl font-black text-center uppercase tracking-tight">Locked Content</Text>
                <Text className="text-gray-400 text-center mt-2 font-medium">Please login to track your orders and see real-time updates.</Text>
                <TouchableOpacity
                    onPress={() => router.push('/auth/login')}
                    className="mt-8 bg-[#1A1D3B] px-10 py-4 rounded-[20px] shadow-xl shadow-black/20"
                >
                    <Text className="text-[#FF6B6B] font-black uppercase tracking-widest text-xs">Unlock Now</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <SafeAreaView edges={['top']} className="bg-white/80 z-50">
                <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
                <View className="px-5 py-3 border-b border-gray-100 flex-row items-center justify-between">
                    <View>
                        <Text className="text-xl font-black text-[#1A1D3B] uppercase tracking-tighter">Activity Feed</Text>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Real-time order updates</Text>
                    </View>
                    <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-50">
                        <Ionicons name="options-outline" size={20} color="#1A1D3B" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
            >
                {orders.length > 0 ? (
                    <View className="gap-4">
                        {orders.map((order: any) => {
                            const config = getStatusConfig(order.status);
                            return (
                                <TouchableOpacity
                                    key={order._id}
                                    onPress={() => router.push(`/order-tracking/${order._id}`)}
                                    className="bg-white p-4 rounded-3xl shadow-sm border border-gray-50 flex-row items-start gap-4"
                                >
                                    <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: `${config.color}10` }}>
                                        <MaterialIcons name={config.icon as any} size={28} color={config.color} />
                                    </View>

                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-center mb-1">
                                            <Text className="font-bold text-[#1A1D3B] text-base">{config.text}</Text>
                                            <Text className="text-[10px] text-gray-400 font-bold uppercase">{new Date(order.createdAt).toLocaleDateString()}</Text>
                                        </View>
                                        <Text className="text-gray-500 text-sm" numberOfLines={2}>
                                            {order.restaurantId?.name}: Your order of {order.items.length} items is {order.status.toLowerCase()}.
                                        </Text>

                                        <View className="flex-row items-center gap-2 mt-3">
                                            <View className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                                <View className="h-full bg-[#FF6B6B]" style={{ width: order.status === 'delivered' ? '100%' : '25%' }} />
                                            </View>
                                            <Text className="text-[10px] font-black text-[#FF6B6B]">TRACK</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    <View className="items-center py-20 px-10">
                        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
                            <MaterialIcons name="notifications-none" size={40} color="#9ca3af" />
                        </View>
                        <Text className="text-[#1A1D3B] text-xl font-bold">No Activity Yet</Text>
                        <Text className="text-gray-500 text-center mt-2">When you place an order, you'll see your tracking updates here.</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/home')}
                            className="mt-8 bg-[#FF6B6B] px-8 py-3 rounded-xl shadow-lg shadow-[#FF6B6B]/30"
                        >
                            <Text className="text-[#1A1D3B] font-bold">Order Something Fresh</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
