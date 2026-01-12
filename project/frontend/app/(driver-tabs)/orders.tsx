import { View, Text, FlatList, TouchableOpacity, Image, Alert, RefreshControl, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { router } from 'expo-router';
import api from '../../utils/api';

export default function DriverOrdersScreen() {
    const { userInfo } = useContext(AuthContext);
    const { socket } = useSocket();
    const driverId = userInfo?._id || userInfo?.driverId;

    const [availableOrders, setAvailableOrders] = useState<any[]>([]);
    const [myOrders, setMyOrders] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    // Listen for real-time order updates
    useEffect(() => {
        if (!socket) return;

        const handleNewOrder = () => {
            if (activeTab === 'available') fetchOrders();
        };

        (socket as any).on('order:new_notification', handleNewOrder);
        (socket as any).on('order:status_update', fetchOrders);

        return () => {
            (socket as any).off('order:new_notification', handleNewOrder);
            (socket as any).off('order:status_update', fetchOrders);
        };
    }, [socket, activeTab]);

    const fetchOrders = async () => {
        try {
            if (activeTab === 'available') {
                const { data } = await api.get('/driver/available');
                setAvailableOrders(data);
            } else {
                const { data } = await api.get(`/driver/my-orders/${driverId}`);
                if (activeTab === 'active') {
                    setMyOrders(data.filter((o: any) => o.status !== 'delivered'));
                } else {
                    setMyOrders(data.filter((o: any) => o.status === 'delivered'));
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const acceptOrder = async (orderId: string) => {
        try {
            await api.put(`/driver/accept/${orderId}`, { driverId });
            Alert.alert('✅ Order Accepted!', 'Head to the restaurant now!');
            setActiveTab('active');
            fetchOrders();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Could not accept order');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'preparing': return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
            case 'out_for_delivery': return { bg: 'bg-blue-100', text: 'text-blue-600' };
            case 'delivered': return { bg: 'bg-green-100', text: 'text-green-600' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-600' };
        }
    };

    const orders = activeTab === 'available' ? availableOrders : myOrders;

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-5 py-4">
                    <Text className="text-2xl font-black text-[#1A1D3B]">Orders</Text>
                    <Text className="text-gray-400 text-xs font-bold mt-1">
                        {activeTab === 'available' ? 'Available for pickup' : activeTab === 'active' ? 'Your active deliveries' : 'Completed deliveries'}
                    </Text>
                </View>

                {/* Tabs */}
                <View className="flex-row px-5 gap-2 pb-4">
                    {[
                        { id: 'available', label: 'Available', count: availableOrders.length },
                        { id: 'active', label: 'Active', count: myOrders.filter((o: any) => o.status !== 'delivered').length },
                        { id: 'completed', label: 'History', count: null },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id as any)}
                            className={`flex-1 h-10 rounded-xl items-center justify-center flex-row gap-1 ${activeTab === tab.id ? 'bg-[#1A1D3B]' : 'bg-gray-100'}`}
                        >
                            <Text className={`font-bold text-sm ${activeTab === tab.id ? 'text-[#FF6B6B]' : 'text-gray-500'}`}>
                                {tab.label}
                            </Text>
                            {tab.count !== null && tab.count > 0 && (
                                <View className={`w-5 h-5 rounded-full items-center justify-center ${activeTab === tab.id ? 'bg-[#FF6B6B]' : 'bg-gray-300'}`}>
                                    <Text className={`text-[10px] font-bold ${activeTab === tab.id ? 'text-[#1A1D3B]' : 'text-white'}`}>
                                        {tab.count}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </SafeAreaView>

            {loading && !refreshing ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#FF6B6B" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />
                    }
                    renderItem={({ item }) => {
                        const earnings = (item.totalAmount * 0.15).toFixed(0);
                        const statusStyle = getStatusColor(item.status);

                        return (
                            <TouchableOpacity
                                onPress={() => router.push({ pathname: '/driver/order-detail', params: { id: item._id } })}
                                className="bg-white mb-4 p-5 rounded-[24px] border border-gray-100"
                            >
                                {/* Restaurant */}
                                <View className="flex-row items-center gap-3 mb-3">
                                    <Image
                                        source={{ uri: item.restaurantId?.image || 'https://placehold.co/100' }}
                                        className="w-12 h-12 rounded-xl bg-gray-100"
                                    />
                                    <View className="flex-1">
                                        <Text className="text-[#1A1D3B] font-black" numberOfLines={1}>
                                            {item.restaurantId?.name || 'Restaurant'}
                                        </Text>
                                        <Text className="text-gray-400 text-xs" numberOfLines={1}>
                                            {item.restaurantId?.address?.street}
                                        </Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-[#FF6B6B] font-black text-lg">₹{earnings}</Text>
                                        <Text className="text-gray-400 text-[10px]">Earnings</Text>
                                    </View>
                                </View>

                                {/* Delivery Address */}
                                <View className="bg-gray-50 p-3 rounded-xl flex-row items-center gap-2 mb-3">
                                    <Ionicons name="location" size={16} color="#FF6B6B" />
                                    <Text className="text-[#1A1D3B] text-xs font-medium flex-1" numberOfLines={1}>
                                        {item.deliveryAddress?.street}, {item.deliveryAddress?.city}
                                    </Text>
                                </View>

                                {/* Status & Action */}
                                <View className="flex-row items-center justify-between">
                                    <View className={`px-3 py-1.5 rounded-full ${statusStyle.bg}`}>
                                        <Text className={`text-xs font-bold capitalize ${statusStyle.text}`}>
                                            {item.status?.replace(/_/g, ' ')}
                                        </Text>
                                    </View>

                                    {activeTab === 'available' && (
                                        <TouchableOpacity
                                            onPress={() => acceptOrder(item._id)}
                                            className="bg-[#FF6B6B] px-4 py-2 rounded-xl flex-row items-center gap-1"
                                        >
                                            <Ionicons name="flash" size={14} color="#1A1D3B" />
                                            <Text className="text-[#1A1D3B] font-bold text-sm">Accept</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                    ListEmptyComponent={
                        <View className="items-center py-20">
                            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                                <MaterialIcons name="delivery-dining" size={40} color="#d1d5db" />
                            </View>
                            <Text className="text-[#1A1D3B] font-black text-lg">
                                {activeTab === 'available' ? 'No Orders Available' : activeTab === 'active' ? 'No Active Orders' : 'No Completed Orders'}
                            </Text>
                            <Text className="text-gray-400 text-center mt-2 px-10">
                                {activeTab === 'available' ? 'New orders will appear here when available' : 'Your orders will show here'}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
