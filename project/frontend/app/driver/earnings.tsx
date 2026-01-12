import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

export default function DriverEarnings() {
    const [loading, setLoading] = useState(false);

    const stats = {
        walletBalance: 425.80,
        todayEarnings: 84.20,
        weeklyEarnings: 512.00,
        totalDeliveries: 124
    };

    const transactions = [
        { id: '1', amount: 12.50, date: 'Today, 2:45 PM', shop: 'Burger King' },
        { id: '2', amount: 8.00, date: 'Today, 1:15 PM', shop: 'Starbucks' },
        { id: '3', amount: 15.20, date: 'Yesterday, 8:30 PM', shop: 'Pizza Hut' },
        { id: '4', amount: 10.00, date: 'Yesterday, 6:45 PM', shop: 'KFC' },
    ];

    return (
        <View className="flex-1 bg-[#1A1D3B]">
            <StatusBar barStyle="light-content" />

            <SafeAreaView edges={['top']} className="bg-[#1A1D3B]">
                <View className="px-5 py-3 flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/10 items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                    <Text className="text-xl font-black text-white uppercase tracking-tight">Earnings</Text>
                    <View className="w-10" />
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
                {/* Wallet Balance Card */}
                <View className="px-5 py-8 items-center justify-center">
                    <Text className="text-[#FF6B6B] text-[10px] font-black uppercase tracking-[4px] mb-2">Available for Payout</Text>
                    <Text className="text-white text-6xl font-black">${stats.walletBalance.toFixed(2)}</Text>

                    <TouchableOpacity className="mt-8 bg-[#FF6B6B] px-10 py-4 rounded-[20px] shadow-xl shadow-[#FF6B6B]/30 active:scale-95 transition-all">
                        <Text className="text-[#1A1D3B] font-black uppercase tracking-widest text-xs">Transfer to Bank</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Container (Rounded corners at top) */}
                <View className="bg-[#f5f8f5] flex-1 rounded-t-[48px] mt-4 p-8 min-h-[500px]">
                    <View className="flex-row gap-4 mb-8">
                        <View className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                            <MaterialCommunityIcons name="calendar-today" size={20} color="#FF6B6B" />
                            <Text className="text-2xl font-black text-[#1A1D3B] mt-2">${stats.todayEarnings.toFixed(0)}</Text>
                            <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Today</Text>
                        </View>
                        <View className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                            <MaterialCommunityIcons name="chart-line" size={20} color="#3b82f6" />
                            <Text className="text-2xl font-black text-[#1A1D3B] mt-2">${stats.weeklyEarnings.toFixed(0)}</Text>
                            <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">This Week</Text>
                        </View>
                    </View>

                    <Text className="text-[#1A1D3B] text-xl font-black mb-6">Recent Gigs</Text>

                    {transactions.map((tx) => (
                        <View key={tx.id} className="bg-white p-5 rounded-[28px] shadow-sm border border-gray-50 flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center gap-4">
                                <View className="w-12 h-12 rounded-2xl bg-[#f5f8f5] items-center justify-center shadow-inner">
                                    <Ionicons name="checkmark-circle" size={24} color="#FF6B6B" />
                                </View>
                                <View>
                                    <Text className="font-black text-[#1A1D3B] text-base">{tx.shop}</Text>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase">{tx.date}</Text>
                                </View>
                            </View>
                            <Text className="font-black text-[#1A1D3B] text-lg">+${tx.amount.toFixed(2)}</Text>
                        </View>
                    ))}

                    <TouchableOpacity className="items-center mt-4">
                        <Text className="text-gray-400 font-black uppercase text-[10px] tracking-widest">View History</Text>
                    </TouchableOpacity>
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
