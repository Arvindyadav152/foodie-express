import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function OrderDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/orders/${id}`);
            setOrder(data);
        } catch (error) {
            console.error("Error fetching order:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#f5f8f5]">
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    if (!order) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-[#f5f8f5]">
                <Text>Order not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <SafeAreaView className="flex-1">
                <View className="px-4 py-3 flex-row items-center bg-white border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <MaterialIcons name="arrow-back-ios-new" size={20} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-[#1A1D3B]">Order Details</Text>
                </View>

                <ScrollView className="flex-1 px-4 py-4">
                    {/* Restaurant Header */}
                    <View className="bg-white p-4 rounded-xl shadow-sm mb-4 flex-row items-center gap-4">
                        <Image
                            source={{ uri: order.restaurantId?.image || 'https://via.placeholder.com/50' }}
                            className="w-16 h-16 rounded-xl bg-gray-200"
                        />
                        <View className="flex-1">
                            <Text className="font-bold text-lg text-[#1A1D3B]">{order.restaurantId?.name}</Text>
                            <Text className="text-gray-500 text-xs">{order.restaurantId?.address?.street}, {order.restaurantId?.address?.city}</Text>
                            <Text className="text-[#FF6B6B] font-bold text-xs mt-1">{order.status.toUpperCase()}</Text>
                        </View>
                    </View>

                    {/* Items List */}
                    <Text className="text-[#1A1D3B] font-bold text-lg mb-3">Items</Text>
                    <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                        {order.items.map((item: any, index: number) => (
                            <View key={index} className="flex-row justify-between mb-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0 last:mb-0">
                                <View className="flex-row gap-3 items-center">
                                    <View className="bg-gray-100 px-2 py-1 rounded">
                                        <Text className="font-bold text-xs">{item.quantity}x</Text>
                                    </View>
                                    <Text className="text-[#1A1D3B] font-medium">{item.name}</Text>
                                </View>
                                <Text className="font-bold text-[#1A1D3B]">${(item.price * item.quantity).toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Bill Details */}
                    <Text className="text-[#1A1D3B] font-bold text-lg mb-3">Bill Details</Text>
                    <View className="bg-white p-4 rounded-xl shadow-sm mb-4 gap-2">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-500">Item Total</Text>
                            <Text className="font-bold text-[#1A1D3B]">${(order.totalAmount - 1.99).toFixed(2)}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-500">Delivery Fee</Text>
                            <Text className="font-bold text-[#1A1D3B]">$1.99</Text>
                        </View>
                        <View className="h-[1px] bg-gray-100 my-1" />
                        <View className="flex-row justify-between">
                            <Text className="font-bold text-lg text-[#1A1D3B]">Total</Text>
                            <Text className="font-bold text-lg text-[#FF6B6B]">${order.totalAmount.toFixed(2)}</Text>
                        </View>
                    </View>

                    {/* Order Info */}
                    <View className="bg-white p-4 rounded-xl shadow-sm mb-8 gap-3">
                        <View className="flex-row items-center gap-3">
                            <MaterialIcons name="receipt" size={20} color="gray" />
                            <View>
                                <Text className="text-xs text-gray-500">Order ID</Text>
                                <Text className="font-bold text-[#1A1D3B] text-xs">{order._id}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-3">
                            <MaterialIcons name="event" size={20} color="gray" />
                            <View>
                                <Text className="text-xs text-gray-500">Date</Text>
                                <Text className="font-bold text-[#1A1D3B] text-xs">{new Date(order.createdAt).toLocaleString()}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-3">
                            <MaterialIcons name="location-on" size={20} color="gray" />
                            <View>
                                <Text className="text-xs text-gray-500">Deliver to</Text>
                                <Text className="font-bold text-[#1A1D3B] text-xs">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</Text>
                            </View>
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
