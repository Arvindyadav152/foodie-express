import { View, Text, TouchableOpacity, ScrollView, TextInput, StatusBar, Alert, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function PayoutSettingsScreen() {
    const { userInfo } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);

    const [payoutData, setPayoutData] = useState({
        bankName: 'HDFC Bank',
        accountNumber: 'XXXX XXXX 1234',
        ifscCode: 'HDFC0001234',
        accountHolder: userInfo?.fullName || 'Driver Name',
        upiId: 'driver@paytm',
        payoutSchedule: 'weekly',
        instantPayout: false,
        minPayoutAmount: '500',
    });

    const [earnings, setEarnings] = useState({
        available: 2450,
        pending: 850,
        thisWeek: 3200,
        thisMonth: 12500,
    });

    const scheduleOptions = [
        { id: 'daily', label: 'Daily', desc: 'Paid every day at 6 AM' },
        { id: 'weekly', label: 'Weekly', desc: 'Paid every Monday' },
        { id: 'biweekly', label: 'Bi-weekly', desc: 'Paid on 1st & 15th' },
    ];

    const handleSave = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            Alert.alert('Success', 'Payout settings updated successfully!');
            setEditing(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = () => {
        if (earnings.available < parseInt(payoutData.minPayoutAmount)) {
            Alert.alert('Insufficient Balance', `Minimum payout amount is ₹${payoutData.minPayoutAmount}`);
            return;
        }
        Alert.alert(
            'Withdraw Funds',
            `Withdraw ₹${earnings.available} to your bank account?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Withdraw',
                    onPress: () => {
                        Alert.alert('Success', 'Withdrawal initiated! Amount will be credited within 24 hours.');
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-5 py-3 flex-row items-center justify-between border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-2xl bg-[#f5f8f5] items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="text-lg font-black text-[#1A1D3B] uppercase tracking-tight">Payout Settings</Text>
                    <TouchableOpacity onPress={() => setEditing(!editing)} className="w-10 h-10 rounded-2xl bg-[#FF6B6B]/10 items-center justify-center">
                        <MaterialIcons name={editing ? "close" : "edit"} size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Balance Card */}
                <View className="mx-5 mt-6 bg-[#1A1D3B] rounded-[32px] p-6 relative overflow-hidden">
                    <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Available Balance</Text>
                    <Text className="text-[#FF6B6B] text-4xl font-black mt-2">₹{earnings.available.toLocaleString()}</Text>
                    <Text className="text-white/40 text-xs mt-1">+ ₹{earnings.pending} pending</Text>

                    <TouchableOpacity
                        onPress={handleWithdraw}
                        className="bg-[#FF6B6B] h-12 rounded-xl items-center justify-center mt-4 flex-row gap-2"
                    >
                        <MaterialIcons name="account-balance-wallet" size={18} color="#1A1D3B" />
                        <Text className="text-[#1A1D3B] font-black">Withdraw Now</Text>
                    </TouchableOpacity>

                    <View className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#FF6B6B]/5 rounded-full" />
                </View>

                {/* Earnings Overview */}
                <View className="flex-row mx-5 mt-4 gap-3">
                    <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100">
                        <Text className="text-gray-400 text-xs font-bold">This Week</Text>
                        <Text className="text-[#1A1D3B] text-xl font-black mt-1">₹{earnings.thisWeek.toLocaleString()}</Text>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100">
                        <Text className="text-gray-400 text-xs font-bold">This Month</Text>
                        <Text className="text-[#1A1D3B] text-xl font-black mt-1">₹{earnings.thisMonth.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Bank Details */}
                <View className="px-5 mt-6">
                    <Text className="text-[#1A1D3B] text-xs font-black uppercase tracking-widest mb-3 ml-2">Bank Account</Text>

                    <View className="bg-white rounded-2xl p-4 border border-gray-100 gap-4">
                        {[
                            { label: 'Bank Name', key: 'bankName', icon: 'account-balance' },
                            { label: 'Account Number', key: 'accountNumber', icon: 'credit-card' },
                            { label: 'IFSC Code', key: 'ifscCode', icon: 'pin' },
                            { label: 'Account Holder', key: 'accountHolder', icon: 'person' },
                        ].map((field) => (
                            <View key={field.key} className="flex-row items-center justify-between py-2 border-b border-gray-50">
                                <View className="flex-row items-center gap-2">
                                    <MaterialIcons name={field.icon as any} size={18} color="#9ca3af" />
                                    <Text className="text-gray-400 text-sm">{field.label}</Text>
                                </View>
                                {editing ? (
                                    <TextInput
                                        value={payoutData[field.key as keyof typeof payoutData] as string}
                                        onChangeText={(text) => setPayoutData({ ...payoutData, [field.key]: text })}
                                        className="text-[#1A1D3B] font-bold text-right flex-1 ml-4"
                                    />
                                ) : (
                                    <Text className="text-[#1A1D3B] font-bold">{payoutData[field.key as keyof typeof payoutData]}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* UPI */}
                <View className="px-5 mt-6">
                    <Text className="text-[#1A1D3B] text-xs font-black uppercase tracking-widest mb-3 ml-2">UPI Payment</Text>

                    <View className="bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center">
                                <MaterialIcons name="qr-code" size={20} color="#8b5cf6" />
                            </View>
                            <View>
                                <Text className="text-gray-400 text-xs">UPI ID</Text>
                                {editing ? (
                                    <TextInput
                                        value={payoutData.upiId}
                                        onChangeText={(text) => setPayoutData({ ...payoutData, upiId: text })}
                                        className="text-[#1A1D3B] font-bold"
                                    />
                                ) : (
                                    <Text className="text-[#1A1D3B] font-bold">{payoutData.upiId}</Text>
                                )}
                            </View>
                        </View>
                        <View className="bg-purple-100 px-3 py-1 rounded-full">
                            <Text className="text-purple-600 text-xs font-bold">Verified</Text>
                        </View>
                    </View>
                </View>

                {/* Payout Schedule */}
                <View className="px-5 mt-6">
                    <Text className="text-[#1A1D3B] text-xs font-black uppercase tracking-widest mb-3 ml-2">Payout Schedule</Text>

                    <View className="gap-2">
                        {scheduleOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                onPress={() => editing && setPayoutData({ ...payoutData, payoutSchedule: option.id })}
                                className={`bg-white rounded-2xl p-4 border-2 flex-row items-center justify-between ${payoutData.payoutSchedule === option.id ? 'border-[#FF6B6B]' : 'border-gray-100'}`}
                            >
                                <View>
                                    <Text className="text-[#1A1D3B] font-bold">{option.label}</Text>
                                    <Text className="text-gray-400 text-xs">{option.desc}</Text>
                                </View>
                                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${payoutData.payoutSchedule === option.id ? 'border-[#FF6B6B] bg-[#FF6B6B]' : 'border-gray-300'}`}>
                                    {payoutData.payoutSchedule === option.id && (
                                        <MaterialIcons name="check" size={14} color="white" />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Instant Payout Toggle */}
                <View className="px-5 mt-6">
                    <View className="bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center justify-between">
                        <View className="flex-1">
                            <Text className="text-[#1A1D3B] font-bold">Instant Payout</Text>
                            <Text className="text-gray-400 text-xs">Get paid immediately (₹5 fee per withdrawal)</Text>
                        </View>
                        <Switch
                            value={payoutData.instantPayout}
                            onValueChange={(value) => setPayoutData({ ...payoutData, instantPayout: value })}
                            trackColor={{ false: '#e5e7eb', true: '#FF6B6B50' }}
                            thumbColor={payoutData.instantPayout ? '#FF6B6B' : '#9ca3af'}
                        />
                    </View>
                </View>

                {/* Save Button */}
                {editing && (
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={loading}
                        className="mx-5 bg-[#FF6B6B] h-14 rounded-2xl items-center justify-center mt-6"
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-black text-base">Save Changes</Text>
                        )}
                    </TouchableOpacity>
                )}

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
