import { View, Text, TouchableOpacity, ScrollView, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useContext } from 'react';
import { router } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function SalesReportsScreen() {
    const { userInfo } = useContext(AuthContext);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

    // Mock data
    const stats = {
        week: { revenue: 18450, orders: 67, avgOrder: 275, growth: 12 },
        month: { revenue: 78620, orders: 284, avgOrder: 277, growth: 8 },
        year: { revenue: 845230, orders: 3120, avgOrder: 271, growth: 23 },
    };

    const currentStats = stats[selectedPeriod];

    const topItems = [
        { name: 'Butter Chicken', orders: 156, revenue: 28080 },
        { name: 'Paneer Tikka', orders: 134, revenue: 20100 },
        { name: 'Chicken Biryani', orders: 98, revenue: 17640 },
        { name: 'Dal Makhani', orders: 87, revenue: 10440 },
        { name: 'Naan Basket', orders: 234, revenue: 9360 },
    ];

    const peakHours = [
        { hour: '12 PM', orders: 23 },
        { hour: '1 PM', orders: 34 },
        { hour: '7 PM', orders: 45 },
        { hour: '8 PM', orders: 52 },
        { hour: '9 PM', orders: 38 },
    ];

    const maxPeakOrders = Math.max(...peakHours.map(p => p.orders));

    return (
        <View className="flex-1 bg-[#FEFEFE]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-5 py-4 flex-row items-center gap-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-xl font-black text-[#1A1D3B]">Sales Reports</Text>
                        <Text className="text-gray-400 text-xs">Detailed business analytics</Text>
                    </View>
                    <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center">
                        <Ionicons name="download-outline" size={20} color="#1A1D3B" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Period Selector */}
                <View className="flex-row mx-5 mt-4 bg-gray-100 rounded-xl p-1">
                    {(['week', 'month', 'year'] as const).map((period) => (
                        <TouchableOpacity
                            key={period}
                            onPress={() => setSelectedPeriod(period)}
                            className={`flex-1 py-3 rounded-lg items-center ${selectedPeriod === period ? 'bg-white' : ''}`}
                        >
                            <Text className={`font-bold text-sm capitalize ${selectedPeriod === period ? 'text-[#1A1D3B]' : 'text-gray-400'}`}>
                                This {period}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Main Stats */}
                <View className="mx-5 mt-4 bg-[#1A1D3B] p-6 rounded-[24px]">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-white/50 text-xs font-bold uppercase">Total Revenue</Text>
                            <Text className="text-white text-3xl font-black">₹{currentStats.revenue.toLocaleString()}</Text>
                        </View>
                        <View className="bg-[#4ECDC4]/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                            <Ionicons name="trending-up" size={14} color="#4ECDC4" />
                            <Text className="text-[#4ECDC4] text-xs font-bold">+{currentStats.growth}%</Text>
                        </View>
                    </View>
                    <View className="flex-row gap-4">
                        <View className="flex-1 bg-white/10 p-3 rounded-xl items-center">
                            <Text className="text-white text-xl font-black">{currentStats.orders}</Text>
                            <Text className="text-white/50 text-xs font-bold">Orders</Text>
                        </View>
                        <View className="flex-1 bg-white/10 p-3 rounded-xl items-center">
                            <Text className="text-white text-xl font-black">₹{currentStats.avgOrder}</Text>
                            <Text className="text-white/50 text-xs font-bold">Avg Order</Text>
                        </View>
                        <View className="flex-1 bg-[#FF6B6B] p-3 rounded-xl items-center">
                            <Text className="text-white text-xl font-black">4.8</Text>
                            <Text className="text-white/80 text-xs font-bold">Rating</Text>
                        </View>
                    </View>
                </View>

                {/* Peak Hours */}
                <View className="mx-5 mt-6 bg-white p-5 rounded-2xl border border-gray-100">
                    <Text className="text-[#1A1D3B] font-black text-lg mb-4">Peak Hours</Text>
                    <View className="flex-row items-end justify-between h-28">
                        {peakHours.map((item, idx) => {
                            const height = (item.orders / maxPeakOrders) * 100;
                            const isPeak = item.orders === maxPeakOrders;
                            return (
                                <View key={idx} className="items-center flex-1">
                                    <Text className="text-[#1A1D3B] text-xs font-bold mb-1">{item.orders}</Text>
                                    <View
                                        style={{ height: `${height}%` }}
                                        className={`w-8 rounded-t-lg ${isPeak ? 'bg-[#FF6B6B]' : 'bg-gray-200'}`}
                                    />
                                    <Text className="text-gray-400 text-[10px] font-bold mt-2">{item.hour}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Top Selling Items */}
                <View className="mx-5 mt-6 bg-white p-5 rounded-2xl border border-gray-100">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-[#1A1D3B] font-black text-lg">Top Sellers</Text>
                        <MaterialIcons name="trending-up" size={20} color="#4ECDC4" />
                    </View>
                    {topItems.map((item, idx) => (
                        <View key={idx} className={`flex-row items-center justify-between py-3 ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                            <View className="flex-row items-center gap-3">
                                <View className="w-8 h-8 bg-[#FF6B6B]/10 rounded-lg items-center justify-center">
                                    <Text className="font-black text-[#FF6B6B] text-sm">#{idx + 1}</Text>
                                </View>
                                <View>
                                    <Text className="font-bold text-[#1A1D3B]">{item.name}</Text>
                                    <Text className="text-gray-400 text-xs">{item.orders} orders</Text>
                                </View>
                            </View>
                            <Text className="font-black text-[#4ECDC4]">₹{item.revenue.toLocaleString()}</Text>
                        </View>
                    ))}
                </View>

                {/* Performance Metrics */}
                <View className="flex-row mx-5 mt-6 gap-3 mb-10">
                    <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center">
                        <Ionicons name="time" size={24} color="#8B5CF6" />
                        <Text className="text-[#1A1D3B] text-xl font-black mt-2">18m</Text>
                        <Text className="text-gray-400 text-xs font-bold">Avg Prep Time</Text>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center">
                        <Ionicons name="repeat" size={24} color="#3B82F6" />
                        <Text className="text-[#1A1D3B] text-xl font-black mt-2">67%</Text>
                        <Text className="text-gray-400 text-xs font-bold">Repeat Rate</Text>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center">
                        <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
                        <Text className="text-[#1A1D3B] text-xl font-black mt-2">98%</Text>
                        <Text className="text-gray-400 text-xs font-bold">Accept Rate</Text>
                    </View>
                </View>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
