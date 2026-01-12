import { View, Text, Image, TouchableOpacity, ScrollView, Alert, StyleSheet, Modal, TextInput, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Link } from 'expo-router';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BlurView } from 'expo-blur';
import api from '../../utils/api';

export default function ProfileScreen() {
    const { logout, userInfo } = useContext(AuthContext);
    const { language, changeLanguage, t } = useLanguage();

    // Add Funds Modal State
    const [showAddFundsModal, setShowAddFundsModal] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(100);
    const [customAmount, setCustomAmount] = useState('');
    const [addingFunds, setAddingFunds] = useState(false);
    const [walletBalance, setWalletBalance] = useState(userInfo?.walletBalance || 0);
    const [stats, setStats] = useState({ orders: 0, points: 0, badges: 0 });

    // Fetch wallet balance on mount
    useEffect(() => {
        if (userInfo?._id) {
            fetchWalletBalance();
            fetchUserStats();
        }
    }, [userInfo]);

    const fetchWalletBalance = async () => {
        try {
            const { data } = await api.get(`/wallet/${userInfo._id}`);
            setWalletBalance(data.balance || 0);
        } catch (error) {
            console.error('Error fetching wallet:', error);
        }
    };

    const fetchUserStats = async () => {
        try {
            const { data } = await api.get(`/users/${userInfo._id}/stats`);
            setStats({
                orders: data.totalOrders || 0,
                points: data.loyaltyPoints || 0,
                badges: data.achievements?.length || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleAddFunds = async () => {
        const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
        if (!amount || amount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        setAddingFunds(true);
        try {
            const { data } = await api.post(`/wallet/${userInfo._id}/add`, {
                amount,
                source: 'upi_add'
            });
            setWalletBalance(data.balance);
            setShowAddFundsModal(false);
            setCustomAmount('');
            Alert.alert('✅ Success!', `₹${amount} added to your wallet!`);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add funds');
        } finally {
            setAddingFunds(false);
        }
    };

    const handleLogout = async () => {
        console.log('🔴 Logout button pressed!');
        try {
            await logout();
            console.log('🔴 Logout complete, navigating...');
            router.replace('/auth/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const menuItems = [
        { icon: 'receipt-long', label: 'My Orders', route: '/order-history', color: '#1A1D3B' },
        { icon: 'favorite-border', label: 'Favorites', route: '/(tabs)/favorites', color: '#ef4444' },
        { icon: 'location-on', label: 'Addresses', route: '/manage-addresses', color: '#3b82f6' },
        { icon: 'notifications-none', label: 'Notifications', route: '/(tabs)/notifications', color: '#f59e0b' },
        { icon: 'help-outline', label: 'Help & Support', route: '/support', color: '#10b981' },
        { icon: 'settings', label: 'Settings', route: '/settings', color: '#6b7280' },
    ];

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            {/* Header with Glassmorphism */}
            <View className="h-64 relative">
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop' }}
                    className="w-full h-full absolute"
                    resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/40" />

                <SafeAreaView edges={['top']} className="flex-1">
                    <View className="px-6 py-6 flex-row items-center justify-between">
                        <Text className="text-2xl font-black text-white uppercase tracking-tighter">My Profile</Text>
                        <TouchableOpacity
                            onPress={handleLogout}
                            activeOpacity={0.7}
                            style={{ zIndex: 100 }}
                            className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center border border-white/30"
                        >
                            <MaterialIcons name="logout" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="px-6 flex-row items-center mt-6">
                        <View className="relative">
                            <View className="w-20 h-20 rounded-[28px] border-4 border-white/20 p-1">
                                <Image
                                    source={{ uri: userInfo?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg' }}
                                    className="w-full h-full rounded-[20px]"
                                />
                            </View>
                            <View className="absolute -bottom-1 -right-1 bg-[#FF6B6B] w-7 h-7 rounded-full border-4 border-[#1A1D3B] items-center justify-center">
                                <MaterialIcons name="verified" size={14} color="white" />
                            </View>
                        </View>
                        <View className="ml-5">
                            <Text className="text-2xl font-black text-white tracking-tight uppercase">{userInfo?.fullName || 'John Doe'}</Text>
                            <Text className="text-white/60 text-xs font-bold -mt-0.5">{userInfo?.email}</Text>
                            <View className="flex-row items-center bg-white/10 self-start px-2 py-1 rounded-lg border border-white/10 mt-2">
                                <Ionicons name="shield-checkmark" size={12} color="#FF6B6B" />
                                <Text className="text-white text-[9px] font-black uppercase tracking-widest ml-1">Elite Member</Text>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView className="flex-1 -mt-8" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Stats / Loyalty Card */}
                <View className="px-5">
                    <BlurView intensity={80} tint="light" className="bg-white/80 rounded-[40px] overflow-hidden shadow-xl shadow-black/5 border border-white p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Foodie Wallet</Text>
                                <Text className="text-[#1A1D3B] text-3xl font-black mt-1 tracking-tighter">₹{walletBalance.toFixed(2)}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowAddFundsModal(true)}
                                className="bg-[#1A1D3B] px-6 py-3.5 rounded-2xl shadow-lg shadow-black/20"
                            >
                                <Text className="text-[#FF6B6B] text-[10px] font-black uppercase tracking-widest">Add Funds</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1 bg-white p-4 rounded-3xl items-center shadow-sm border border-gray-50">
                                <Text className="text-xl font-black text-[#1A1D3B]">{stats.orders}</Text>
                                <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Orders</Text>
                            </View>
                            <View className="flex-1 bg-white p-4 rounded-3xl items-center shadow-sm border border-gray-50">
                                <Text className="text-xl font-black text-[#FF6B6B]">{stats.points}</Text>
                                <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Points</Text>
                            </View>
                            <View className="flex-1 bg-white p-4 rounded-3xl items-center shadow-sm border border-gray-50">
                                <Text className="text-xl font-black text-[#3b82f6]">{stats.badges}</Text>
                                <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Badges</Text>
                            </View>
                        </View>
                    </BlurView>
                </View>

                {/* Achievement Gallery */}
                <View className="mt-8">
                    <Text className="text-[#1A1D3B] text-xs font-black uppercase tracking-[4px] ml-9 mb-4">Elite Achievements</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5" contentContainerStyle={{ paddingRight: 40 }}>
                        {[
                            { title: 'Sultan of Spice', icon: 'flare', color: '#f59e0b' },
                            { title: 'Night Owl', icon: 'nights-stay', color: '#6366f1' },
                            { title: 'Sustainability Hero', icon: 'eco', color: '#10b981' },
                            { title: 'Early Bird', icon: 'wb-sunny', color: '#fbbf24' },
                            { title: 'Local Legend', icon: 'place', color: '#ef4444' },
                        ].map((item, idx) => (
                            <View key={idx} className="items-center mr-6">
                                <View className={`w-16 h-16 rounded-[24px] bg-white items-center justify-center shadow-sm border border-gray-50`}>
                                    <View className="w-12 h-12 rounded-2xl bg-gray-50 items-center justify-center">
                                        <MaterialIcons name={item.icon as any} size={24} color={item.color} />
                                    </View>
                                </View>
                                <Text className="text-[#1A1D3B] text-[8px] font-black uppercase tracking-tighter mt-2 text-center w-16">{item.title}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Quest Center */}
                <View className="mt-8 px-5">
                    <Text className="text-[#1A1D3B] text-xs font-black uppercase tracking-[4px] ml-4 mb-4">Active Quests</Text>
                    <TouchableOpacity className="bg-[#1A1D3B] p-6 rounded-[40px] shadow-xl shadow-black/20 overflow-hidden">
                        <View className="flex-row justify-between items-center z-10">
                            <View className="flex-1">
                                <View className="flex-row items-center gap-2 mb-2">
                                    <MaterialCommunityIcons name="trophy-variant" size={20} color="#FF6B6B" />
                                    <Text className="text-[#FF6B6B] text-[10px] font-black uppercase tracking-[3px]">Weekly Challenge</Text>
                                </View>
                                <Text className="text-white text-xl font-black uppercase tracking-tighter leading-tight">Order from 3 different Indian spots</Text>
                                <View className="mt-4 bg-white/10 h-2 rounded-full overflow-hidden">
                                    <View className="bg-[#FF6B6B] h-full w-[66%]" />
                                </View>
                                <View className="flex-row justify-between mt-2">
                                    <Text className="text-white/40 text-[8px] font-black uppercase tracking-widest">Progress: 2/3</Text>
                                    <Text className="text-[#FF6B6B] text-[8px] font-black uppercase tracking-widest">+500 Points</Text>
                                </View>
                            </View>
                            <View className="ml-4 opacity-20">
                                <Ionicons name="fast-food" size={80} color="white" />
                            </View>
                        </View>
                        {/* Decorative background circle */}
                        <View className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full" />
                    </TouchableOpacity>
                </View>

                {/* Account Settings Section */}
                <View className="mt-8 px-5">
                    <Text className="text-[#1A1D3B] text-xs font-black uppercase tracking-[4px] ml-4 mb-4">Account Overview</Text>

                    <View className="bg-white rounded-[40px] p-2 shadow-sm border border-gray-50">
                        {menuItems.map((item, index) => (
                            <Link href={item.route as any} asChild key={index}>
                                <TouchableOpacity className={`flex-row items-center p-4 ${index !== menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <View className="w-12 h-12 rounded-[22px] bg-[#f5f8f5] items-center justify-center mr-5">
                                        <MaterialIcons name={item.icon as any} size={22} color={item.color} />
                                    </View>
                                    <Text className="flex-1 text-base font-black text-[#1A1D3B] tracking-tight">{item.label}</Text>
                                    <View className="w-8 h-8 rounded-xl bg-gray-50 items-center justify-center">
                                        <MaterialIcons name="chevron-right" size={20} color="#d1d5db" />
                                    </View>
                                </TouchableOpacity>
                            </Link>
                        ))}
                    </View>

                    {/* Language Toggle */}
                    <TouchableOpacity
                        onPress={() => changeLanguage(language === 'en' ? 'hi' : 'en')}
                        className="mt-4 bg-white rounded-[32px] p-5 shadow-sm border border-gray-50 flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 rounded-[22px] bg-[#FF6B6B]/10 items-center justify-center mr-5">
                                <MaterialIcons name="translate" size={22} color="#FF6B6B" />
                            </View>
                            <View>
                                <Text className="text-base font-black text-[#1A1D3B] tracking-tight">{t('profile.language')}</Text>
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                    {language === 'en' ? 'English' : 'हिंदी'}
                                </Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Text className={`text-xs font-black ${language === 'en' ? 'text-[#FF6B6B]' : 'text-gray-300'}`}>EN</Text>
                            <View className="w-12 h-7 rounded-full bg-gray-100 p-1 flex-row items-center">
                                <View className={`w-5 h-5 rounded-full bg-[#FF6B6B] ${language === 'hi' ? 'ml-auto' : ''}`} />
                            </View>
                            <Text className={`text-xs font-black ${language === 'hi' ? 'text-[#FF6B6B]' : 'text-gray-300'}`}>हि</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Pressable
                    onPress={handleLogout}
                    hitSlop={20}
                    style={({ pressed }) => ({
                        backgroundColor: pressed ? '#fee2e2' : '#fef2f2',
                        opacity: pressed ? 0.8 : 1,
                        zIndex: 100,
                        marginHorizontal: 20,
                        marginTop: 40,
                        marginBottom: 20,
                        paddingVertical: 24,
                        borderRadius: 32,
                        borderWidth: 2,
                        borderStyle: 'dashed',
                        borderColor: '#fee2e2',
                        alignItems: 'center',
                        justifyContent: 'center'
                    })}
                >
                    <Text className="text-red-500 font-black uppercase tracking-[3px] text-xs">Terminate Session</Text>
                </Pressable>

                <View className="items-center opacity-10 pb-10">
                    <Text className="text-[#1A1D3B] text-[10px] font-black tracking-widest uppercase">Foodie Express • Premium Build</Text>
                </View>
            </ScrollView>

            {/* Add Funds Modal */}
            <Modal
                visible={showAddFundsModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddFundsModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-[40px] p-8">
                        <View className="w-12 h-1 bg-gray-200 rounded-full self-center mb-6" />

                        <Text className="text-2xl font-black text-[#1A1D3B] uppercase tracking-tight mb-2">Add Funds</Text>
                        <Text className="text-gray-400 text-sm mb-6">Select amount or enter custom</Text>

                        {/* Quick Amount Buttons */}
                        <View className="flex-row flex-wrap gap-3 mb-6">
                            {[50, 100, 200, 500, 1000].map((amount) => (
                                <TouchableOpacity
                                    key={amount}
                                    onPress={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                                    className={`px-5 py-3 rounded-2xl border-2 ${selectedAmount === amount && !customAmount ? 'bg-[#1A1D3B] border-[#1A1D3B]' : 'bg-white border-gray-100'}`}
                                >
                                    <Text className={`font-black ${selectedAmount === amount && !customAmount ? 'text-[#FF6B6B]' : 'text-[#1A1D3B]'}`}>₹{amount}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Custom Amount Input */}
                        <View className="flex-row items-center border-2 border-gray-100 rounded-2xl px-4 mb-6">
                            <Text className="text-xl font-black text-[#1A1D3B]">₹</Text>
                            <TextInput
                                placeholder="Custom amount"
                                value={customAmount}
                                onChangeText={(text) => { setCustomAmount(text); setSelectedAmount(0); }}
                                keyboardType="numeric"
                                className="flex-1 py-4 px-2 text-lg font-bold"
                            />
                        </View>

                        {/* Payment Method */}
                        <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl mb-6">
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 rounded-xl bg-[#5f259f] items-center justify-center">
                                    <Text className="text-white font-black text-xs">UPI</Text>
                                </View>
                                <View>
                                    <Text className="text-[#1A1D3B] font-bold">UPI Payment</Text>
                                    <Text className="text-gray-400 text-xs">Instant credit</Text>
                                </View>
                            </View>
                            <MaterialIcons name="check-circle" size={24} color="#FF6B6B" />
                        </View>

                        {/* Add Button */}
                        <TouchableOpacity
                            onPress={handleAddFunds}
                            disabled={addingFunds}
                            className={`py-5 rounded-2xl items-center ${addingFunds ? 'bg-gray-200' : 'bg-[#1A1D3B]'}`}
                        >
                            {addingFunds ? (
                                <ActivityIndicator color="#1A1D3B" />
                            ) : (
                                <Text className="text-[#FF6B6B] font-black uppercase tracking-widest">
                                    Add ₹{customAmount || selectedAmount} to Wallet
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Cancel */}
                        <TouchableOpacity
                            onPress={() => setShowAddFundsModal(false)}
                            className="mt-4 py-4 items-center"
                        >
                            <Text className="text-gray-400 font-bold">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
