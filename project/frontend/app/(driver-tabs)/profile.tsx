import { View, Text, Pressable, ScrollView, Image, StatusBar, Alert, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function DriverProfileScreen() {
    const { userInfo, logout } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const menuItems = [
        { icon: 'car-sport', label: 'Vehicle Details', route: '/driver/vehicle', color: '#FF6B6B' },
        { icon: 'document-text', label: 'KYC Documents', route: '/driver/kyc', color: '#3b82f6' },
        { icon: 'wallet', label: 'Payout Settings', route: '/driver/payout', color: '#8b5cf6' },
        { icon: 'shield-checkmark', label: 'Insurance', route: '/driver/insurance', color: '#f97316' },
    ];

    const stats = {
        rating: userInfo?.driverStats?.rating || 4.9,
        trips: userInfo?.driverStats?.completedTrips || 0,
        experience: '2 years',
    };

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-5 py-4 flex-row items-center justify-between">
                    <Text className="text-2xl font-black text-[#1A1D3B]">Profile</Text>
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="w-10 h-10 bg-red-50 rounded-full items-center justify-center border border-red-100"
                        >
                            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                            <Ionicons name="settings-outline" size={20} color="#1A1D3B" />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 180 }}
            >
                {/* Profile Card */}
                <View className="mx-5 mt-4 bg-[#1A1D3B] rounded-[32px] p-6 relative overflow-hidden">
                    <View className="flex-row items-center gap-4">
                        <View className="w-20 h-20 rounded-full border-3 border-[#FF6B6B] overflow-hidden bg-gray-800">
                            <Image
                                source={{ uri: userInfo?.profileImage || `https://ui-avatars.com/api/?name=${userInfo?.fullName}&background=0df20d&color=111811&size=200` }}
                                className="w-full h-full"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white text-xl font-black">{userInfo?.fullName || 'Driver'}</Text>
                            <Text className="text-[#FF6B6B] text-xs font-bold mt-1">Fleet Partner</Text>
                            <Text className="text-white/40 text-xs mt-1">{userInfo?.email}</Text>
                        </View>
                    </View>

                    {/* Stats Row */}
                    <View className="flex-row mt-6 gap-4">
                        <View className="flex-1 bg-white/10 p-3 rounded-xl items-center">
                            <View className="flex-row items-center gap-1">
                                <Text className="text-white text-xl font-black">{stats.rating}</Text>
                                <Ionicons name="star" size={14} color="#FF6B6B" />
                            </View>
                            <Text className="text-white/40 text-[10px] font-bold mt-1">Rating</Text>
                        </View>
                        <View className="flex-1 bg-[#FF6B6B] p-3 rounded-xl items-center">
                            <Text className="text-[#1A1D3B] text-xl font-black">{stats.trips}</Text>
                            <Text className="text-[#1A1D3B]/60 text-[10px] font-bold mt-1">Trips</Text>
                        </View>
                        <View className="flex-1 bg-white/10 p-3 rounded-xl items-center">
                            <Text className="text-white text-xl font-black">2y</Text>
                            <Text className="text-white/40 text-[10px] font-bold mt-1">Exp</Text>
                        </View>
                    </View>

                    <View className="absolute -right-8 -bottom-8 w-28 h-28 bg-[#FF6B6B]/10 rounded-full" />
                </View>

                {/* Verification Badge */}
                <View className="mx-5 mt-4 bg-green-50 p-4 rounded-2xl flex-row items-center gap-3 border border-green-100">
                    <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                        <Ionicons name="shield-checkmark" size={20} color="#22c55e" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-green-600 font-bold">Verified Partner</Text>
                        <Text className="text-green-500/60 text-xs">Background check completed</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View className="mx-5 mt-6 gap-3">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 ml-2">Account Settings</Text>

                    {menuItems.map((item, idx) => (
                        <TouchableOpacity
                            key={idx}
                            onPress={() => router.push(item.route as any)}
                            className="bg-white p-4 rounded-2xl flex-row items-center justify-between border border-gray-100"
                        >
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                                </View>
                                <Text className="text-[#1A1D3B] font-bold">{item.label}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Support & Help */}
                <View className="mx-5 mt-6 gap-3">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 ml-2">Support</Text>

                    <TouchableOpacity
                        onPress={() => router.push('/driver/support')}
                        className="bg-white p-4 rounded-2xl flex-row items-center justify-between border border-gray-100"
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center">
                                <Ionicons name="help-circle-outline" size={20} color="#3b82f6" />
                            </View>
                            <Text className="text-[#1A1D3B] font-bold">Help & Support</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/driver/contact-manager')}
                        className="bg-white p-4 rounded-2xl flex-row items-center justify-between border border-gray-100"
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center">
                                <Ionicons name="chatbubbles-outline" size={20} color="#8b5cf6" />
                            </View>
                            <Text className="text-[#1A1D3B] font-bold">Contact Manager</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
                    </TouchableOpacity>
                </View>

                <View className="items-center opacity-10 py-10">
                    <Text className="text-[#1A1D3B] text-[10px] font-black tracking-widest uppercase text-center">Foodie Express • Driver Build</Text>
                </View>
            </ScrollView>
        </View>
    );
}
