import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Linking, Image, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import api from '../../../utils/api';

export default function VendorOrderDetails() {
    const { id } = useLocalSearchParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [prepTime, setPrepTime] = useState<number | null>(null);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/orders/${id}`);
            setOrder(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const updateStatus = async (status: string) => {
        setUpdating(true);
        try {
            await api.put(`/vendor/orders/${id}/status`, { status, prepTime });
            await fetchOrder();
            if (status === 'preparing') {
                Alert.alert('✅ Order Accepted', 'Start preparing the order!');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const rejectOrder = () => {
        Alert.alert(
            'Reject Order',
            'Are you sure you want to reject this order?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        setUpdating(true);
                        try {
                            await api.put(`/vendor/orders/${id}/status`, { status: 'cancelled' });
                            Alert.alert('Order Rejected', 'Customer will be notified.');
                            router.back();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reject order');
                        } finally {
                            setUpdating(false);
                        }
                    }
                }
            ]
        );
    };

    const callCustomer = () => {
        if (order?.userId?.phone) {
            Linking.openURL(`tel:${order.userId.phone}`);
        }
    };

    const callDriver = () => {
        if (order?.driverId?.phone) {
            Linking.openURL(`tel:${order.driverId.phone}`);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#FEFEFE]">
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    const PaymentBadge = () => {
        const isOnline = order?.paymentMethod !== 'cod';
        const isPaid = order?.paymentStatus === 'paid';
        return (
            <View className={`px-3 py-1.5 rounded-xl flex-row items-center gap-1.5 ${isOnline ? 'bg-[#4ECDC4]/10' : 'bg-[#FFE66D]/20'}`}>
                <Ionicons name={isOnline ? 'card' : 'cash'} size={14} color={isOnline ? '#4ECDC4' : '#F59E0B'} />
                <Text className={`text-xs font-bold ${isOnline ? 'text-[#4ECDC4]' : 'text-[#F59E0B]'}`}>
                    {isOnline ? 'Online' : 'COD'} {isPaid ? '✓' : ''}
                </Text>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-[#FEFEFE]">
            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-5 py-4 flex-row items-center justify-between border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="font-black text-[#1A1D3B] text-lg">Order #{id?.toString().slice(-6).toUpperCase()}</Text>
                    <TouchableOpacity onPress={callCustomer} className="w-10 h-10 bg-[#FF6B6B]/10 rounded-xl items-center justify-center">
                        <Ionicons name="call" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
                {/* Status Card */}
                <View className="bg-[#1A1D3B] p-5 rounded-[24px] mb-4">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-white/50 text-xs font-bold uppercase">Status</Text>
                            <Text className="text-white text-2xl font-black capitalize">{order?.status?.replace(/_/g, ' ')}</Text>
                        </View>
                        <PaymentBadge />
                    </View>
                    {order?.prepTime && (
                        <View className="bg-white/10 mt-3 p-3 rounded-xl flex-row items-center gap-2">
                            <Ionicons name="time" size={16} color="#FF6B6B" />
                            <Text className="text-white text-sm font-bold">Ready in {order.prepTime} mins</Text>
                        </View>
                    )}
                </View>

                {/* Driver Info (if assigned) */}
                {order?.driverId && (
                    <View className="bg-white p-5 rounded-2xl border border-gray-100 mb-4">
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-3">Delivery Partner</Text>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3">
                                <View className="w-12 h-12 bg-[#4ECDC4]/10 rounded-full items-center justify-center">
                                    <Text className="text-[#4ECDC4] font-black text-lg">
                                        {order.driverId.fullName?.charAt(0) || 'D'}
                                    </Text>
                                </View>
                                <View>
                                    <Text className="font-bold text-[#1A1D3B]">{order.driverId.fullName || 'Driver'}</Text>
                                    <Text className="text-gray-400 text-xs">{order.driverId.phone || 'Arriving soon'}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={callDriver} className="w-10 h-10 bg-[#4ECDC4] rounded-xl items-center justify-center">
                                <Ionicons name="call" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Customer Details */}
                <View className="bg-white p-5 rounded-2xl border border-gray-100 mb-4">
                    <Text className="text-gray-400 text-xs font-bold uppercase mb-3">Customer</Text>
                    <View className="flex-row items-center gap-3">
                        <View className="w-12 h-12 bg-[#FF6B6B]/10 rounded-full items-center justify-center">
                            <Text className="text-[#FF6B6B] font-black text-lg">
                                {order?.userId?.fullName?.charAt(0) || 'G'}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-[#1A1D3B]">{order?.userId?.fullName || 'Guest User'}</Text>
                            <Text className="text-gray-400 text-xs">{order?.deliveryAddress?.street}, {order?.deliveryAddress?.city}</Text>
                        </View>
                    </View>
                </View>

                {/* Prep Time Selection */}
                {order?.status === 'confirmed' && (
                    <View className="bg-white p-5 rounded-2xl border border-gray-100 mb-4">
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-3">Preparation Time</Text>
                        <View className="flex-row gap-2">
                            {[10, 20, 30, 45].map(time => (
                                <TouchableOpacity
                                    key={time}
                                    onPress={() => setPrepTime(time)}
                                    className={`flex-1 h-12 rounded-xl items-center justify-center ${prepTime === time ? 'bg-[#FF6B6B]' : 'bg-gray-100'}`}
                                >
                                    <Text className={`font-bold ${prepTime === time ? 'text-white' : 'text-gray-500'}`}>{time}m</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Order Items */}
                <View className="bg-white p-5 rounded-2xl border border-gray-100">
                    <Text className="text-gray-400 text-xs font-bold uppercase mb-4">Order Items</Text>
                    {order?.items.map((item: any, idx: number) => (
                        <View key={idx} className={`flex-row items-center justify-between py-3 ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                            <View className="flex-row items-center gap-3">
                                <View className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center">
                                    <Text className="font-bold text-[#1A1D3B]">{item.quantity}x</Text>
                                </View>
                                <Text className="font-bold text-[#1A1D3B]">{item.name}</Text>
                            </View>
                            <Text className="font-bold text-[#1A1D3B]">₹{(item.price * item.quantity).toFixed(0)}</Text>
                        </View>
                    ))}
                    <View className="mt-4 pt-4 border-t border-gray-100 flex-row justify-between">
                        <Text className="font-black text-[#1A1D3B] text-lg">Total</Text>
                        <Text className="font-black text-[#FF6B6B] text-xl">₹{order?.totalAmount?.toFixed(0)}</Text>
                    </View>
                </View>

                {/* Special Instructions */}
                {order?.instructions && (
                    <View className="bg-[#FFE66D]/10 p-4 rounded-2xl mt-4">
                        <Text className="text-[#F59E0B] text-xs font-bold uppercase mb-1">Special Instructions</Text>
                        <Text className="text-[#1A1D3B] font-medium">{order.instructions}</Text>
                    </View>
                )}
            </ScrollView>

            {/* Action Buttons */}
            {order?.status === 'confirmed' && (
                <View className="absolute bottom-8 left-5 right-5 gap-3">
                    <TouchableOpacity
                        onPress={() => updateStatus('preparing')}
                        disabled={updating || !prepTime}
                        className={`h-14 rounded-2xl items-center justify-center flex-row gap-2 ${!prepTime ? 'bg-gray-300' : 'bg-[#4ECDC4]'}`}
                    >
                        {updating ? <ActivityIndicator color="white" /> : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="white" />
                                <Text className="text-white font-bold text-base">Accept Order</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={rejectOrder}
                        disabled={updating}
                        className="h-14 rounded-2xl items-center justify-center flex-row gap-2 bg-red-50 border border-red-100"
                    >
                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                        <Text className="text-red-500 font-bold text-base">Reject Order</Text>
                    </TouchableOpacity>
                </View>
            )}

            {order?.status === 'preparing' && !order?.driverId && (
                <View className="absolute bottom-8 left-5 right-5">
                    <View className="bg-[#FFE66D]/20 p-4 rounded-2xl items-center">
                        <Ionicons name="bicycle" size={24} color="#F59E0B" />
                        <Text className="text-[#F59E0B] font-bold mt-2">Waiting for delivery partner...</Text>
                    </View>
                </View>
            )}
        </View>
    );
}
