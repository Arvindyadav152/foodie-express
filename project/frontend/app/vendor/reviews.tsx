import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

const REVIEWS = [
    { id: '1', user: 'Arvind Y.', rating: 5, comment: 'Amazing food! The butter chicken was incredible.', date: '2 hours ago', sentiment: 'Positive' },
    { id: '2', user: 'Sarah K.', rating: 4, comment: 'Great taste, but preparation took a bit longer than expected.', date: 'Yesterday', sentiment: 'Neutral' },
    { id: '3', user: 'Mike R.', rating: 5, comment: 'Best pizza in town. Period.', date: '2 days ago', sentiment: 'Positive' },
];

export default function VendorReviewsScreen() {
    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <SafeAreaView edges={['top']} className="bg-white/80 z-50">
                <View className="px-5 py-3 flex-row items-center justify-between border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-2xl bg-[#f5f8f5] items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="font-black text-[#1A1D3B] text-xl uppercase tracking-tight">Customer Feedback</Text>
                    <View className="w-10" />
                </View>
            </SafeAreaView>

            <View className="p-5">
                <View className="bg-[#1A1D3B] p-6 rounded-[32px] shadow-xl mb-8 flex-row justify-between items-center">
                    <View>
                        <Text className="text-[#FF6B6B] text-[10px] font-black uppercase tracking-widest mb-1">Store Rating</Text>
                        <Text className="text-white text-4xl font-black">4.8</Text>
                    </View>
                    <View className="items-end">
                        <View className="flex-row gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => <Ionicons key={i} name="star" size={16} color="#FF6B6B" />)}
                        </View>
                        <Text className="text-white/40 text-[10px] font-black uppercase mt-1">From 1.2k Reviews</Text>
                    </View>
                </View>

                <FlatList
                    data={REVIEWS}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View className="bg-white mb-4 p-6 rounded-[32px] shadow-sm border border-gray-50">
                            <View className="flex-row justify-between items-start mb-3">
                                <View>
                                    <Text className="text-[#1A1D3B] font-black text-base">{item.user}</Text>
                                    <Text className="text-gray-400 text-[10px] font-medium">{item.date}</Text>
                                </View>
                                <View className={`px-3 py-1 rounded-full ${item.sentiment === 'Positive' ? 'bg-[#FF6B6B]/10' : 'bg-orange-50'}`}>
                                    <Text className={`text-[8px] font-black uppercase tracking-widest ${item.sentiment === 'Positive' ? 'text-[#FF6B6B]' : 'text-orange-500'}`}>
                                        {item.sentiment}
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row gap-0.5 mb-3">
                                {[1, 2, 3, 4, 5].map(i => <Ionicons key={i} name="star" size={12} color={i <= item.rating ? '#FF6B6B' : '#e5e7eb'} />)}
                            </View>
                            <Text className="text-gray-500 text-sm font-medium leading-5">"{item.comment}"</Text>
                        </View>
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            </View>
        </View>
    );
}
