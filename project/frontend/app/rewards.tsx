import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import SpinWheel from '../components/SpinWheel';
import api from '../utils/api';

export default function RewardsScreen() {
    const { userInfo } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [streakData, setStreakData] = useState<any>(null);
    const [prizes, setPrizes] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const [streakRes, prizesRes] = await Promise.all([
                api.get(`/gamification/streak/${userInfo?._id}`),
                api.get(`/gamification/prizes/${userInfo?._id}`)
            ]);
            setStreakData(streakRes.data);
            setPrizes(prizesRes.data);
        } catch (error) {
            console.error('Error fetching rewards data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo?._id) {
            fetchData();
        }
    }, [userInfo]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#f5f8f5]">
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <SafeAreaView edges={['top']} className="bg-[#1A1D3B]">
                <View className="px-6 py-4 flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-2xl bg-white/10 items-center justify-center"
                    >
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-black uppercase tracking-tighter">Rewards</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/leaderboard')}
                        className="w-10 h-10 rounded-2xl bg-[#FF6B6B]/20 items-center justify-center"
                    >
                        <MaterialIcons name="leaderboard" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Streak Card */}
                <View className="mx-5 -mt-2 bg-gradient-to-r from-[#1A1D3B] to-[#1a2a1a] bg-[#1A1D3B] rounded-[32px] p-6 shadow-xl">
                    <View className="flex-row items-center gap-2 mb-4">
                        <MaterialIcons name="local-fire-department" size={24} color="#f59e0b" />
                        <Text className="text-white font-black uppercase tracking-tight">Daily Streak</Text>
                    </View>

                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-5xl font-black text-[#FF6B6B]">{streakData?.currentDays || 0}</Text>
                            <Text className="text-white/40 text-xs font-bold uppercase">Days in a row</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-white/60 text-sm font-bold">Best: {streakData?.maxStreak || 0} days</Text>
                            {streakData?.reward && (
                                <View className="bg-[#FF6B6B]/20 px-3 py-1 rounded-full mt-2">
                                    <Text className="text-[#FF6B6B] text-[10px] font-black">{streakData.reward.message}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Streak Progress */}
                    <View className="flex-row gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                            <View
                                key={day}
                                className={`flex-1 h-2 rounded-full ${day <= (streakData?.currentDays || 0) ? 'bg-[#FF6B6B]' : 'bg-white/10'}`}
                            />
                        ))}
                    </View>
                    <Text className="text-white/30 text-[10px] font-bold mt-2 text-center">7 days = Free Delivery Week! 🚀</Text>
                </View>

                {/* Spin Wheel Section */}
                <View className="mt-8 px-5">
                    <Text className="text-[#1A1D3B] text-xs font-black uppercase tracking-[3px] mb-4">Spin & Win</Text>
                    <View className="bg-white rounded-[40px] p-4 shadow-sm">
                        <SpinWheel
                            spinCredits={streakData?.spinCredits || 0}
                            onSpinComplete={() => fetchData()}
                        />
                    </View>
                </View>

                {/* Active Prizes */}
                {prizes.length > 0 && (
                    <View className="mt-8 px-5">
                        <Text className="text-[#1A1D3B] text-xs font-black uppercase tracking-[3px] mb-4">Your Prizes</Text>
                        {prizes.map((prize) => (
                            <View key={prize._id} className="bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between border border-gray-50">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-12 h-12 rounded-xl bg-[#FF6B6B]/10 items-center justify-center">
                                        <MaterialIcons name="card-giftcard" size={24} color="#FF6B6B" />
                                    </View>
                                    <View>
                                        <Text className="text-[#1A1D3B] font-bold">{prize.prizeName}</Text>
                                        <Text className="text-gray-400 text-xs">Expires {new Date(prize.expiresAt).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity className="bg-[#1A1D3B] px-4 py-2 rounded-xl">
                                    <Text className="text-[#FF6B6B] text-[10px] font-black uppercase">Use</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                <View className="h-24" />
            </ScrollView>
        </View>
    );
}
