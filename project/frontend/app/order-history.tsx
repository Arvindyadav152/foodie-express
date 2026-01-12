import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StatusBar, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect, useContext } from 'react';
import { router } from 'expo-router';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { DEMO_IDS } from '../constants/DemoIds';

export default function OrderHistoryScreen() {
    const { userInfo } = useContext(AuthContext);
    const userId = userInfo?._id || DEMO_IDS.CUSTOMER;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get(`/orders/user/${userId}`);
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleReorder = async (order: any) => {
        // Mock reorder: Push items back to cart? Or just navigate to restaurant
        router.push(`/restaurant/${order.restaurantId?._id}`);
    };

    const StatusStep = ({ active, label, last = false }: { active: boolean, label: string, last?: boolean }) => (
        <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full ${active ? 'bg-[#FF6B6B]' : 'bg-gray-200'}`} />
            {!last && <View className={`h-[1px] w-4 ${active ? 'bg-[#FF6B6B]' : 'bg-gray-200'}`} />}
        </View>
    );

    const renderOrder = ({ item }: { item: any }) => {
        const isDelivered = item.status === 'delivered';
        const isCancelled = item.status === 'cancelled';

        return (
            <View className="bg-white mx-5 mb-5 rounded-[40px] overflow-hidden shadow-sm border border-gray-50">
                {/* Card Header */}
                <View className="p-5 flex-row items-center gap-4 border-b border-gray-50">
                    <Image
                        source={{ uri: item.restaurantId?.image || 'https://placehold.co/100' }}
                        className="w-14 h-14 rounded-2xl bg-[#f5f8f5]"
                    />
                    <View className="flex-1">
                        <View className="flex-row justify-between items-center">
                            <Text className="font-black text-[#1A1D3B] text-lg uppercase tracking-tight" numberOfLines={1}>
                                {item.restaurantId?.name || "The Foodie Joint"}
                            </Text>
                            <Text className="font-black text-[#FF6B6B] text-lg">${item.totalAmount.toFixed(2)}</Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                            {new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} • {item.items.length} items
                        </Text>
                    </View>
                </View>

                {/* Items Summary */}
                <View className="px-5 py-4 bg-[#f5f8f5]/30">
                    <Text className="text-[#1A1D3B] text-[11px] font-bold leading-5 opacity-70">
                        {item.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                    </Text>
                </View>

                {/* Status Timeline & Actions */}
                <View className="px-5 pb-5 pt-2">
                    {!isDelivered && !isCancelled && item.verificationCode && (
                        <View className="bg-[#1A1D3B] p-5 rounded-[28px] mb-5 flex-row justify-between items-center border border-[#FF6B6B]/20 shadow-lg">
                            <View>
                                <Text className="text-[#FF6B6B] text-[8px] font-black uppercase tracking-[3px] mb-1">Security Verification Code</Text>
                                <Text className="text-white text-3xl font-black tracking-[6px]">{item.verificationCode}</Text>
                            </View>
                            <View className="bg-[#FF6B6B]/10 p-3 rounded-2xl">
                                <Ionicons name="shield-checkmark" size={24} color="#FF6B6B" />
                            </View>
                        </View>
                    )}

                    <View className="flex-row items-center justify-between">
                        <View>
                            <View className="flex-row gap-0.5 items-center mb-1">
                                <StatusStep active={true} label="Conf" />
                                <StatusStep active={item.status !== 'confirmed'} label="Prep" />
                                <StatusStep active={item.status === 'out_for_delivery' || isDelivered} label="Ship" />
                                <StatusStep active={isDelivered} label="Done" last={true} />
                            </View>
                            <Text className={`text-[9px] font-black uppercase tracking-widest ${isCancelled ? 'text-red-500' : 'text-gray-400'}`}>
                                {isCancelled ? 'Order Cancelled' : isDelivered ? 'Successfully Delivered' : 'In Progress'}
                            </Text>
                        </View>

                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => handleReorder(item)}
                                className="bg-[#1A1D3B] px-4 py-2.5 rounded-2xl shadow-sm active:scale-95"
                            >
                                <Text className="text-[#FF6B6B] text-[10px] font-black uppercase tracking-widest">Reorder</Text>
                            </TouchableOpacity>

                            {!isDelivered && !isCancelled && (
                                <TouchableOpacity
                                    onPress={() => router.push(`/order-tracking/${item._id}`)}
                                    className="bg-[#FF6B6B] px-4 py-2.5 rounded-2xl shadow-sm active:scale-95"
                                >
                                    <Text className="text-[#1A1D3B] text-[10px] font-black uppercase tracking-widest">Track</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView edges={['top']} className="bg-white/80 z-50">
                <View className="px-5 py-3 flex-row items-center gap-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} className="w-10 h-10 rounded-2xl bg-[#f5f8f5] items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-black text-[#1A1D3B] uppercase tracking-tight">Gig History</Text>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Your past cravings</Text>
                    </View>
                </View>
            </SafeAreaView>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#FF6B6B" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item: any) => item._id}
                    renderItem={renderOrder}
                    contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); fetchOrders(); }}
                    ListEmptyComponent={
                        <View className="items-center py-20 px-10">
                            <View className="w-24 h-24 bg-white rounded-[40px] items-center justify-center mb-6 shadow-sm">
                                <MaterialIcons name="fastfood" size={48} color="#d1d5db" />
                            </View>
                            <Text className="text-[#1A1D3B] text-2xl font-black text-center uppercase tracking-tight">Empty Tummy?</Text>
                            <Text className="text-gray-500 text-center mt-2 font-medium">You haven't ordered anything yet. Let's fix that!</Text>
                            <TouchableOpacity
                                onPress={() => router.replace('/(tabs)/home')}
                                className="mt-8 bg-[#FF6B6B] px-8 py-4 rounded-[20px] shadow-xl shadow-[#FF6B6B]/30"
                            >
                                <Text className="text-[#1A1D3B] font-black uppercase tracking-widest text-xs">Explore Food</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
