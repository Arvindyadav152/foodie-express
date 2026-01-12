import { View, Text, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { router } from 'expo-router';
import api from '../../utils/api';

export default function DriverEarningsScreen() {
    const { userInfo } = useContext(AuthContext);
    const driverId = userInfo?._id || userInfo?.driverId;
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');

    const [earnings, setEarnings] = useState({
        today: 0,
        week: 0,
        month: 0,
        available: 0,
        pending: 0,
        trips: { today: 0, week: 0, month: 0 },
    });

    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            const { data } = await api.get(`/driver/earnings/${driverId}`);
            setEarnings({
                today: data.todayEarnings || userInfo?.driverStats?.totalEarnings || 245,
                week: data.weekEarnings || 1840,
                month: data.monthEarnings || 8450,
                available: data.availableBalance || 2450,
                pending: data.pendingBalance || 580,
                trips: data.trips || { today: 8, week: 42, month: 156 },
            });
            setTransactions(data.transactions || [
                { id: '1', type: 'earning', amount: 45, date: new Date().toISOString(), orderId: '#ORD123' },
                { id: '2', type: 'earning', amount: 62, date: new Date().toISOString(), orderId: '#ORD124' },
                { id: '3', type: 'withdrawal', amount: -500, date: new Date(Date.now() - 86400000).toISOString() },
            ]);
        } catch (error) {
            // Use fallback data
            setEarnings({
                today: userInfo?.driverStats?.totalEarnings || 0,
                week: 0,
                month: 0,
                available: 0,
                pending: 0,
                trips: { today: 0, week: 0, month: 0 },
            });
        } finally {
            setLoading(false);
        }
    };

    const periodData = {
        today: { amount: earnings.today, trips: earnings.trips.today, label: 'Today' },
        week: { amount: earnings.week, trips: earnings.trips.week, label: 'This Week' },
        month: { amount: earnings.month, trips: earnings.trips.month, label: 'This Month' },
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
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-5 py-4 flex-row items-center justify-between">
                    <View>
                        <Text className="text-2xl font-black text-[#1A1D3B]">Earnings</Text>
                        <Text className="text-gray-400 text-xs font-bold mt-1">Track your income</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/driver/payout')}
                        className="bg-[#FF6B6B] px-4 py-2 rounded-xl flex-row items-center gap-1"
                    >
                        <MaterialIcons name="account-balance-wallet" size={18} color="#1A1D3B" />
                        <Text className="text-[#1A1D3B] font-bold">Withdraw</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Period Selector */}
                <View className="flex-row mx-5 mt-4 bg-gray-100 p-1 rounded-xl">
                    {(['today', 'week', 'month'] as const).map((period) => (
                        <TouchableOpacity
                            key={period}
                            onPress={() => setSelectedPeriod(period)}
                            className={`flex-1 py-3 rounded-lg ${selectedPeriod === period ? 'bg-white' : ''}`}
                        >
                            <Text className={`text-center font-bold capitalize ${selectedPeriod === period ? 'text-[#1A1D3B]' : 'text-gray-400'}`}>
                                {period}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Main Earnings Card */}
                <View className="mx-5 mt-4 bg-[#1A1D3B] rounded-[32px] p-6 relative overflow-hidden">
                    <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">{periodData[selectedPeriod].label}</Text>
                    <Text className="text-[#FF6B6B] text-5xl font-black mt-2">
                        ₹{periodData[selectedPeriod].amount.toLocaleString()}
                    </Text>

                    <View className="flex-row mt-4 gap-6">
                        <View>
                            <Text className="text-white/40 text-xs font-bold">Trips</Text>
                            <Text className="text-white text-xl font-black">{periodData[selectedPeriod].trips}</Text>
                        </View>
                        <View>
                            <Text className="text-white/40 text-xs font-bold">Avg/Trip</Text>
                            <Text className="text-white text-xl font-black">
                                ₹{periodData[selectedPeriod].trips > 0 ? Math.round(periodData[selectedPeriod].amount / periodData[selectedPeriod].trips) : 0}
                            </Text>
                        </View>
                    </View>

                    <View className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#FF6B6B]/10 rounded-full" />
                </View>

                {/* Balance Cards */}
                <View className="flex-row mx-5 mt-4 gap-3">
                    <View className="flex-1 bg-white p-5 rounded-2xl border border-gray-100">
                        <View className="w-10 h-10 bg-green-50 rounded-xl items-center justify-center mb-3">
                            <MaterialIcons name="account-balance" size={20} color="#22c55e" />
                        </View>
                        <Text className="text-gray-400 text-xs font-bold">Available</Text>
                        <Text className="text-[#1A1D3B] text-2xl font-black mt-1">₹{earnings.available.toLocaleString()}</Text>
                    </View>
                    <View className="flex-1 bg-white p-5 rounded-2xl border border-gray-100">
                        <View className="w-10 h-10 bg-yellow-50 rounded-xl items-center justify-center mb-3">
                            <MaterialIcons name="schedule" size={20} color="#eab308" />
                        </View>
                        <Text className="text-gray-400 text-xs font-bold">Pending</Text>
                        <Text className="text-[#1A1D3B] text-2xl font-black mt-1">₹{earnings.pending.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Recent Transactions */}
                <View className="mx-5 mt-6 mb-24">
                    <Text className="text-[#1A1D3B] font-black mb-3">Recent Transactions</Text>

                    {transactions.map((tx) => (
                        <View key={tx.id} className="bg-white p-4 rounded-2xl border border-gray-100 mb-2 flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3">
                                <View className={`w-10 h-10 rounded-xl items-center justify-center ${tx.type === 'earning' ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <MaterialIcons
                                        name={tx.type === 'earning' ? 'add' : 'remove'}
                                        size={20}
                                        color={tx.type === 'earning' ? '#22c55e' : '#ef4444'}
                                    />
                                </View>
                                <View>
                                    <Text className="text-[#1A1D3B] font-bold">
                                        {tx.type === 'earning' ? `Order ${tx.orderId}` : 'Withdrawal'}
                                    </Text>
                                    <Text className="text-gray-400 text-xs">
                                        {new Date(tx.date).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                            <Text className={`font-black text-lg ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
