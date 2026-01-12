import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

export default function LeaderboardScreen() {
    const { userInfo } = useContext(AuthContext);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRank, setUserRank] = useState<number | null>(null);

    const fetchLeaderboard = async () => {
        try {
            const { data } = await api.get('/gamification/leaderboard?limit=20');
            setLeaderboard(data);

            // Find user's rank
            const rank = data.findIndex((u: any) => u._id === userInfo?._id);
            setUserRank(rank !== -1 ? rank + 1 : null);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const getMedalColor = (rank: number) => {
        if (rank === 0) return '#fbbf24'; // Gold
        if (rank === 1) return '#9ca3af'; // Silver
        if (rank === 2) return '#cd7f32'; // Bronze
        return '#e5e7eb';
    };

    const getMedalIcon = (rank: number) => {
        if (rank < 3) return 'emoji-events';
        return 'military-tech';
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#f5f8f5]">
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            {/* Header */}
            <View className="bg-[#1A1D3B] pt-14 pb-8 px-6 rounded-b-[40px]">
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-2xl bg-white/10 items-center justify-center"
                    >
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-black uppercase tracking-tighter">Leaderboard</Text>
                    <View className="w-10" />
                </View>

                {/* Top 3 Podium */}
                <View className="flex-row items-end justify-center gap-4 mt-4">
                    {/* 2nd Place */}
                    {leaderboard[1] && (
                        <View className="items-center">
                            <Image
                                source={{ uri: leaderboard[1].avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leaderboard[1].fullName)}&background=9ca3af&color=fff` }}
                                className="w-14 h-14 rounded-2xl border-4 border-gray-400"
                            />
                            <View className="bg-gray-400 px-3 py-1 rounded-full -mt-2">
                                <Text className="text-white font-black text-xs">2</Text>
                            </View>
                            <Text className="text-white/60 text-[10px] font-bold mt-1" numberOfLines={1}>{leaderboard[1].fullName?.split(' ')[0]}</Text>
                            <Text className="text-gray-400 text-[8px] font-bold">{leaderboard[1].orderCount} orders</Text>
                        </View>
                    )}

                    {/* 1st Place */}
                    {leaderboard[0] && (
                        <View className="items-center -mt-4">
                            <View className="w-8 h-8 items-center justify-center">
                                <MaterialIcons name="emoji-events" size={28} color="#fbbf24" />
                            </View>
                            <Image
                                source={{ uri: leaderboard[0].avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leaderboard[0].fullName)}&background=fbbf24&color=fff` }}
                                className="w-20 h-20 rounded-3xl border-4 border-yellow-400"
                            />
                            <View className="bg-yellow-400 px-4 py-1.5 rounded-full -mt-3">
                                <Text className="text-[#1A1D3B] font-black text-sm">1</Text>
                            </View>
                            <Text className="text-white text-xs font-black mt-1 uppercase" numberOfLines={1}>{leaderboard[0].fullName?.split(' ')[0]}</Text>
                            <Text className="text-[#FF6B6B] text-[10px] font-bold">{leaderboard[0].orderCount} orders</Text>
                        </View>
                    )}

                    {/* 3rd Place */}
                    {leaderboard[2] && (
                        <View className="items-center">
                            <Image
                                source={{ uri: leaderboard[2].avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leaderboard[2].fullName)}&background=cd7f32&color=fff` }}
                                className="w-14 h-14 rounded-2xl border-4 border-orange-600"
                            />
                            <View className="bg-orange-600 px-3 py-1 rounded-full -mt-2">
                                <Text className="text-white font-black text-xs">3</Text>
                            </View>
                            <Text className="text-white/60 text-[10px] font-bold mt-1" numberOfLines={1}>{leaderboard[2].fullName?.split(' ')[0]}</Text>
                            <Text className="text-gray-400 text-[8px] font-bold">{leaderboard[2].orderCount} orders</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Your Position */}
            {userRank && (
                <View className="mx-6 -mt-4 bg-[#FF6B6B] rounded-2xl p-4 flex-row items-center justify-between shadow-lg z-10">
                    <View className="flex-row items-center gap-3">
                        <Text className="text-[#1A1D3B] text-2xl font-black">#{userRank}</Text>
                        <Text className="text-[#1A1D3B] font-bold">Your Rank</Text>
                    </View>
                    <Text className="text-[#1A1D3B] font-black">Keep ordering! 🔥</Text>
                </View>
            )}

            {/* Full Leaderboard */}
            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Full Rankings</Text>

                {leaderboard.slice(3).map((user, index) => (
                    <View
                        key={user._id}
                        className={`flex-row items-center bg-white rounded-2xl p-4 mb-3 border ${user._id === userInfo?._id ? 'border-[#FF6B6B]' : 'border-gray-50'}`}
                    >
                        <Text className="text-gray-300 font-black text-lg w-8">{index + 4}</Text>
                        <Image
                            source={{ uri: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=e5e7eb&color=111811` }}
                            className="w-10 h-10 rounded-xl"
                        />
                        <View className="flex-1 ml-3">
                            <Text className="text-[#1A1D3B] font-bold">{user.fullName}</Text>
                            <Text className="text-gray-400 text-xs">{user.loyaltyPoints || 0} points</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-[#FF6B6B] font-black">{user.orderCount}</Text>
                            <Text className="text-gray-300 text-[8px] font-bold uppercase">orders</Text>
                        </View>
                    </View>
                ))}

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
