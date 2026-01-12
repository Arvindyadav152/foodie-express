import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useContext } from 'react';
import { router } from 'expo-router';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { DEMO_IDS } from '../../constants/DemoIds';

export default function BankPayoutsScreen() {
    const { userInfo } = useContext(AuthContext);
    const vendorId = userInfo?.vendorId || DEMO_IDS.VENDOR;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Bank Details
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [bankName, setBankName] = useState('');
    const [upiId, setUpiId] = useState('');

    // Payout Stats (mock)
    const [stats] = useState({
        pendingPayout: 12450,
        lastPayout: 8760,
        totalEarned: 156780,
        nextPayoutDate: 'Jan 15, 2026'
    });

    const handleSave = async () => {
        if (!accountNumber || !ifscCode || !accountName) {
            Alert.alert("Error", "Please fill all required fields");
            return;
        }
        setSaving(true);
        try {
            // API call would go here
            await new Promise(resolve => setTimeout(resolve, 1000));
            Alert.alert("✅ Saved", "Bank details updated successfully!");
            router.back();
        } catch (error) {
            Alert.alert("Error", "Failed to save bank details");
        } finally {
            setSaving(false);
        }
    };

    const requestPayout = () => {
        Alert.alert(
            "Request Payout",
            `Request payout of ₹${stats.pendingPayout.toLocaleString()}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Request", onPress: () => Alert.alert("✅ Success", "Payout requested! Will be processed within 24-48 hours.") }
            ]
        );
    };

    return (
        <View className="flex-1 bg-[#FEFEFE]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-5 py-4 flex-row items-center justify-between border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="text-xl font-black text-[#1A1D3B]">Bank & Payouts</Text>
                    <TouchableOpacity onPress={handleSave} disabled={saving} className="bg-[#FF6B6B] px-4 py-2 rounded-xl">
                        <Text className="text-white font-bold text-sm">{saving ? '...' : 'Save'}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {/* Earnings Card */}
                <View className="bg-[#1A1D3B] p-6 rounded-[24px] mb-6">
                    <Text className="text-white/50 text-xs font-bold uppercase mb-1">Pending Payout</Text>
                    <Text className="text-white text-3xl font-black">₹{stats.pendingPayout.toLocaleString()}</Text>
                    <Text className="text-white/40 text-xs mt-1">Next payout: {stats.nextPayoutDate}</Text>

                    <TouchableOpacity
                        onPress={requestPayout}
                        className="bg-[#FF6B6B] mt-4 py-3 rounded-xl items-center"
                    >
                        <Text className="text-white font-bold">Request Payout</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View className="flex-row gap-3 mb-6">
                    <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center">
                        <Text className="text-[#4ECDC4] text-lg font-black">₹{stats.lastPayout.toLocaleString()}</Text>
                        <Text className="text-gray-400 text-xs font-bold mt-1">Last Payout</Text>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center">
                        <Text className="text-[#1A1D3B] text-lg font-black">₹{(stats.totalEarned / 1000).toFixed(1)}K</Text>
                        <Text className="text-gray-400 text-xs font-bold mt-1">Total Earned</Text>
                    </View>
                </View>

                {/* Bank Details Form */}
                <Text className="text-gray-400 text-xs font-bold uppercase mb-3 ml-2">Bank Account Details</Text>
                <View className="bg-white p-5 rounded-2xl border border-gray-100 gap-4 mb-6">
                    <View>
                        <Text className="text-gray-400 text-xs font-bold mb-2">Account Holder Name *</Text>
                        <TextInput
                            className="bg-gray-50 px-4 h-12 rounded-xl text-[#1A1D3B] font-bold"
                            value={accountName} onChangeText={setAccountName} placeholder="As per bank records"
                        />
                    </View>
                    <View>
                        <Text className="text-gray-400 text-xs font-bold mb-2">Account Number *</Text>
                        <TextInput
                            className="bg-gray-50 px-4 h-12 rounded-xl text-[#1A1D3B] font-bold"
                            value={accountNumber} onChangeText={setAccountNumber} placeholder="XXXXXXXXXXXX" keyboardType="numeric"
                        />
                    </View>
                    <View>
                        <Text className="text-gray-400 text-xs font-bold mb-2">IFSC Code *</Text>
                        <TextInput
                            className="bg-gray-50 px-4 h-12 rounded-xl text-[#1A1D3B] font-bold"
                            value={ifscCode} onChangeText={setIfscCode} placeholder="SBIN0001234" autoCapitalize="characters"
                        />
                    </View>
                    <View>
                        <Text className="text-gray-400 text-xs font-bold mb-2">Bank Name</Text>
                        <TextInput
                            className="bg-gray-50 px-4 h-12 rounded-xl text-[#1A1D3B]"
                            value={bankName} onChangeText={setBankName} placeholder="State Bank of India"
                        />
                    </View>
                </View>

                {/* UPI */}
                <Text className="text-gray-400 text-xs font-bold uppercase mb-3 ml-2">UPI (Optional)</Text>
                <View className="bg-white p-5 rounded-2xl border border-gray-100 mb-6">
                    <View>
                        <Text className="text-gray-400 text-xs font-bold mb-2">UPI ID</Text>
                        <TextInput
                            className="bg-gray-50 px-4 h-12 rounded-xl text-[#1A1D3B] font-bold"
                            value={upiId} onChangeText={setUpiId} placeholder="yourname@upi"
                        />
                    </View>
                </View>

                {/* Transaction History */}
                <Text className="text-gray-400 text-xs font-bold uppercase mb-3 ml-2">Recent Transactions</Text>
                <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-10">
                    {[
                        { type: 'Payout', amount: 8760, date: 'Jan 8, 2026', status: 'completed' },
                        { type: 'Payout', amount: 6540, date: 'Jan 1, 2026', status: 'completed' },
                        { type: 'Payout', amount: 9230, date: 'Dec 25, 2025', status: 'completed' },
                    ].map((txn, idx) => (
                        <View key={idx} className={`flex-row items-center justify-between p-4 ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 bg-[#4ECDC4]/10 rounded-xl items-center justify-center">
                                    <MaterialIcons name="arrow-downward" size={18} color="#4ECDC4" />
                                </View>
                                <View>
                                    <Text className="text-[#1A1D3B] font-bold">{txn.type}</Text>
                                    <Text className="text-gray-400 text-xs">{txn.date}</Text>
                                </View>
                            </View>
                            <Text className="text-[#4ECDC4] font-black">+₹{txn.amount.toLocaleString()}</Text>
                        </View>
                    ))}
                </View>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
