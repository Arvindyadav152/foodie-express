import { View, Text, FlatList, TouchableOpacity, Image, Alert, RefreshControl, ActivityIndicator, StatusBar, StyleSheet, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import api from '../../utils/api';
import { useRequireAuth } from '../../hooks/useRequireAuth';

export default function DriverDashboard() {
    const { userId: driverId, userInfo, isLoading: authLoading } = useRequireAuth('driver');
    const { joinAsDriver, broadcastDriverLocation, socket } = useSocket();
    const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [availableOrders, setAvailableOrders] = useState<any[]>([]);
    const [myOrders, setMyOrders] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ todayEarnings: 0, completedTrips: 0, rating: 5.0 });

    // Safety & PIN Verification
    const [showPinModal, setShowPinModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [enteredPin, setEnteredPin] = useState('');

    const fetchData = async () => {
        try {
            if (activeTab === 'available') {
                const { data } = await api.get('/driver/available');
                setAvailableOrders(data);
            } else {
                const { data } = await api.get(`/driver/my-orders/${driverId}`);
                setMyOrders(data);
            }
            // Use real stats from the user session
            setStats({
                todayEarnings: userInfo?.driverStats?.totalEarnings || 0,
                completedTrips: userInfo?.driverStats?.completedTrips || 0,
                rating: userInfo?.driverStats?.rating || 5.0
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // Join driver socket room and start location broadcasting
    useEffect(() => {
        if (driverId) {
            joinAsDriver(driverId);
        }

        // Start location broadcasting when on active tab
        const startLocationBroadcast = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;

                locationIntervalRef.current = setInterval(async () => {
                    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    // Get first active order for location broadcast
                    if (myOrders.length > 0 && myOrders[0].status !== 'delivered') {
                        broadcastDriverLocation(
                            driverId,
                            myOrders[0]._id,
                            location.coords.latitude,
                            location.coords.longitude
                        );
                        console.log(`📍 Location broadcast: ${location.coords.latitude}, ${location.coords.longitude}`);
                    }
                }, 30000); // Every 30 seconds
            } catch (error) {
                console.error('Location broadcast error:', error);
            }
        };

        startLocationBroadcast();

        return () => {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
            }
        };
    }, [driverId, myOrders]);

    // Listen for new order assignment notifications
    useEffect(() => {
        if (!socket) return;

        const handleNewAssignment = (data: any) => {
            Alert.alert(
                '🚚 Nayi Delivery Assign Hui!',
                `Order #${data.orderId?.slice(-6)} - Accept karo!`,
                [{ text: 'Dekho', onPress: () => { setActiveTab('active'); fetchData(); } }]
            );
        };

        (socket as any)?.on('order:assigned_notification', handleNewAssignment);

        return () => {
            (socket as any)?.off('order:assigned_notification', handleNewAssignment);
        };
    }, [socket]);

    const acceptOrder = async (orderId: string) => {
        try {
            await api.put(`/driver/accept/${orderId}`, { driverId });
            Alert.alert("Order Accepted", "Head to the restaurant now!");
            setActiveTab('active');
        } catch (error) {
            Alert.alert("Unavailable", "Another partner might have accepted this order.");
        }
    };

    const completeDelivery = async (orderId: string, status: string = 'delivered', pin?: string) => {
        try {
            await api.put(`/driver/status/${orderId}`, {
                status,
                verificationCode: pin
            });
            Alert.alert("Success", status === 'delivered' ? "Delivery Complete!" : "Order Picked Up!");
            setShowPinModal(false);
            setEnteredPin('');
            fetchData();
        } catch (error: any) {
            Alert.alert("Verification Failed", error.response?.data?.message || "Could not update status");
        }
    };

    const handleMarkDelivered = (orderId: string) => {
        setSelectedOrderId(orderId);
        setShowPinModal(true);
    };

    const renderOrder = ({ item }: { item: any }) => (
        <View className="bg-white mx-5 mb-5 p-6 rounded-[32px] shadow-sm border border-gray-50">
            <View className="flex-row justify-between items-start mb-6">
                <View className="flex-row gap-4">
                    <View className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                        <Image
                            source={{ uri: item.restaurantId?.image || 'https://placehold.co/100x100?text=Shop' }}
                            className="w-full h-full"
                        />
                    </View>
                    <View>
                        <Text className="font-black text-[#1A1D3B] text-lg leading-tight">{item.restaurantId?.name}</Text>
                        <View className="flex-row items-center gap-1 mt-1">
                            <Ionicons name="location" size={12} color="#9ca3af" />
                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter w-40" numberOfLines={1}>
                                {item.restaurantId?.address?.street}, {item.restaurantId?.address?.city}
                            </Text>
                        </View>
                    </View>
                </View>
                <View className="items-end">
                    <Text className="font-black text-[#FF6B6B] text-xl">${(item.totalAmount * 0.15).toFixed(2)}</Text>
                    <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Earnings</Text>
                </View>
            </View>

            <View className="gap-3 mb-6">
                <View className="flex-row items-center gap-3 bg-[#f5f8f5] p-3 rounded-2xl border border-[#FF6B6B]/10">
                    <View className="w-8 h-8 rounded-xl bg-white items-center justify-center">
                        <MaterialIcons name="my-location" size={16} color="#FF6B6B" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Deliver To</Text>
                        <Text className="text-xs font-bold text-[#1A1D3B]" numberOfLines={1}>{item.deliveryAddress?.street}, {item.deliveryAddress?.city}</Text>
                    </View>
                </View>
            </View>

            {activeTab === 'available' ? (
                <TouchableOpacity
                    onPress={() => acceptOrder(item._id)}
                    className="bg-[#1A1D3B] h-14 rounded-2xl items-center justify-center shadow-lg active:scale-95 transition-all"
                >
                    <Text className="text-[#FF6B6B] font-black uppercase tracking-widest">Accept Delivery</Text>
                </TouchableOpacity>
            ) : (
                item.status !== 'delivered' ? (
                    <TouchableOpacity
                        onPress={() => completeDelivery(item._id)}
                        className="bg-[#FF6B6B] h-14 rounded-2xl items-center justify-center shadow-lg active:scale-95 transition-all"
                    >
                        <Text className="text-[#1A1D3B] font-black uppercase tracking-widest">Mark as Delivered</Text>
                    </TouchableOpacity>
                ) : (
                    <View className="bg-gray-50 h-14 rounded-2xl items-center justify-center border border-gray-100 italic">
                        <Text className="text-gray-400 font-black uppercase tracking-widest">Delivery Completed</Text>
                    </View>
                )
            )}
        </View>
    );

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
                    <View>
                        <Text className="text-2xl font-black text-[#1A1D3B] uppercase tracking-tighter">Fleet Portal</Text>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{activeTab === 'available' ? 'Available' : 'Assigned'} Gigs</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/driver/profile')}
                        className="w-12 h-12 rounded-2xl bg-[#1A1D3B] items-center justify-center shadow-lg"
                    >
                        <Text className="text-[#FF6B6B] font-black text-xs">${stats.todayEarnings.toFixed(0)}</Text>
                        <Text className="text-white text-[6px] font-black uppercase tracking-tighter">Today</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Dashboard Stats / Performance */}
            <View className="px-5 mt-4">
                <View className="flex-row gap-4 mb-6">
                    <View className="flex-1 bg-white p-5 rounded-[28px] shadow-sm border border-gray-50">
                        <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1">Weekly Streak</Text>
                        <Text className="text-2xl font-black text-[#1A1D3B]">12 / 20</Text>
                        <View className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                            <View className="w-[60%] h-full bg-[#FF6B6B] rounded-full" />
                        </View>
                    </View>
                    <View className="flex-1 bg-[#1A1D3B] p-5 rounded-[28px] shadow-xl">
                        <Text className="text-[#FF6B6B]/60 text-[9px] font-black uppercase tracking-widest mb-1">Fleet Rating</Text>
                        <View className="flex-row items-center gap-1.5">
                            <Text className="text-2xl font-black text-white">{stats.rating?.toFixed(1) || '5.0'}</Text>
                            <Ionicons name="star" size={16} color="#FF6B6B" />
                        </View>
                        <Text className="text-white/40 text-[8px] font-black uppercase mt-1">Diamond Partner</Text>
                    </View>
                </View>

                {/* Status Tabs */}
                <View className="flex-row mb-6 gap-3">
                    <TouchableOpacity
                        onPress={() => setActiveTab('available')}
                        className={`flex-1 h-12 rounded-2xl items-center justify-center border ${activeTab === 'available' ? 'bg-[#1A1D3B] border-[#1A1D3B]' : 'bg-white border-gray-100'}`}
                    >
                        <Text className={`font-black uppercase tracking-widest text-[10px] ${activeTab === 'available' ? 'text-[#FF6B6B]' : 'text-gray-400'}`}>New Gigs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('active')}
                        className={`flex-1 h-12 rounded-2xl items-center justify-center border ${activeTab === 'active' ? 'bg-[#1A1D3B] border-[#1A1D3B]' : 'bg-white border-gray-100'}`}
                    >
                        <Text className={`font-black uppercase tracking-widest text-[10px] ${activeTab === 'active' ? 'text-[#FF6B6B]' : 'text-gray-400'}`}>Active Fleet</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={activeTab === 'available' ? availableOrders : myOrders}
                keyExtractor={(item: any) => item._id}
                renderItem={({ item }) => {
                    const earnings = (item.totalAmount * 0.15).toFixed(2);
                    const isPickable = item.status === 'preparing';
                    const isDeliverable = item.status === 'out_for_delivery';

                    return (
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/driver/order-detail', params: { orderId: item._id } })}
                            activeOpacity={0.9}
                            className="bg-white mx-5 mb-5 p-6 rounded-[32px] shadow-sm border border-gray-50"
                        >
                            <View className="flex-row justify-between items-start mb-6">
                                <View className="flex-row gap-4 flex-1">
                                    <View className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                                        <Image
                                            source={{ uri: item.restaurantId?.image || 'https://placehold.co/100x100?text=Shop' }}
                                            className="w-full h-full"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-black text-[#1A1D3B] text-lg leading-tight" numberOfLines={1}>{item.restaurantId?.name}</Text>
                                        <View className="flex-row items-center gap-1 mt-1">
                                            <Ionicons name="location" size={12} color="#FF6B6B" />
                                            <Text className="text-gray-400 text-[9px] font-black uppercase tracking-tighter" numberOfLines={1}>
                                                {item.restaurantId?.address?.street}, {item.restaurantId?.address?.city}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="font-black text-[#FF6B6B] text-xl">${earnings}</Text>
                                    <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Payout</Text>
                                </View>
                            </View>

                            <View className="bg-[#f5f8f5] p-5 rounded-2xl mb-6 flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-xl bg-white items-center justify-center">
                                    <MaterialIcons name="navigation" size={20} color="#FF6B6B" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Drop Off Location</Text>
                                    <Text className="text-xs font-black text-[#1A1D3B]" numberOfLines={1}>{item.deliveryAddress?.street}, {item.deliveryAddress?.city}</Text>
                                </View>
                                <View className="bg-[#FF6B6B]/10 px-2 py-1 rounded-lg">
                                    <Text className="text-[#FF6B6B] text-[8px] font-black uppercase">2.4 KM</Text>
                                </View>
                            </View>

                            {activeTab === 'available' ? (
                                <TouchableOpacity
                                    onPress={() => acceptOrder(item._id)}
                                    className="bg-[#1A1D3B] h-16 rounded-[24px] items-center justify-center shadow-lg active:scale-95 flex-row gap-3"
                                >
                                    <Ionicons name="flash" size={20} color="#FF6B6B" />
                                    <Text className="text-[#FF6B6B] font-black uppercase tracking-widest text-sm">Accept Gig</Text>
                                </TouchableOpacity>
                            ) : (
                                <View className="flex-row gap-3">
                                    {item.status !== 'delivered' ? (
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (item.status === 'preparing') {
                                                    completeDelivery(item._id, 'out_for_delivery');
                                                } else {
                                                    handleMarkDelivered(item._id);
                                                }
                                            }}
                                            className="flex-1 bg-[#FF6B6B] h-16 rounded-[24px] items-center justify-center shadow-lg active:scale-95"
                                        >
                                            <Text className="text-[#1A1D3B] font-black uppercase tracking-widest text-xs">
                                                {item.status === 'preparing' ? 'Order Picked Up' : 'Verify & Deliver'}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View className="flex-1 bg-gray-50 h-16 rounded-[24px] items-center justify-center border border-gray-100">
                                            <Text className="text-gray-400 font-black uppercase tracking-widest text-xs">Gig Completed</Text>
                                        </View>
                                    )}
                                    <TouchableOpacity className="w-16 h-16 bg-[#1A1D3B] rounded-[24px] items-center justify-center">
                                        <Ionicons name="call" size={24} color="#FF6B6B" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center py-20 px-10">
                        <View className="w-24 h-24 bg-white rounded-[40px] items-center justify-center mb-6 shadow-sm border border-gray-50">
                            <Ionicons name="map-outline" size={48} color="#d1d5db" />
                        </View>
                        <Text className="text-[#1A1D3B] text-xl font-black text-center uppercase tracking-tighter">Quiet Streets...</Text>
                        <Text className="text-gray-500 text-center mt-2 font-medium">New gigs near your location will appear here instantly.</Text>
                    </View>
                }
            />
            {/* PIN Verification Modal */}
            <Modal
                visible={showPinModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowPinModal(false)}
            >
                <View className="flex-1 bg-black/60 items-center justify-center p-6">
                    <View className="bg-white w-full rounded-[40px] p-8 shadow-2xl">
                        <View className="items-center mb-6">
                            <View className="w-20 h-20 bg-[#f5f8f5] rounded-full items-center justify-center mb-4">
                                <Ionicons name="shield-checkmark" size={40} color="#FF6B6B" />
                            </View>
                            <Text className="text-2xl font-black text-[#1A1D3B] uppercase tracking-tighter">Enter Delivery PIN</Text>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">Ask the customer for code</Text>
                        </View>

                        <TextInput
                            className="bg-gray-50 h-20 rounded-3xl text-center text-4xl font-black border-2 border-[#f5f8f5] focus:border-[#FF6B6B]"
                            placeholder="0 0 0 0"
                            placeholderTextColor="#d1d5db"
                            keyboardType="number-pad"
                            maxLength={4}
                            value={enteredPin}
                            onChangeText={setEnteredPin}
                            autoFocus
                        />

                        <View className="flex-row gap-3 mt-8">
                            <TouchableOpacity
                                onPress={() => setShowPinModal(false)}
                                className="flex-1 h-14 rounded-2xl bg-gray-100 items-center justify-center"
                            >
                                <Text className="text-gray-400 font-black uppercase tracking-widest text-xs">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => selectedOrderId && completeDelivery(selectedOrderId, 'delivered', enteredPin)}
                                className="flex-2 bg-[#1A1D3B] px-8 h-14 rounded-2xl items-center justify-center shadow-lg"
                            >
                                <Text className="text-[#FF6B6B] font-black uppercase tracking-widest text-xs">Verify PIN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
