import { View, Text, Pressable, ScrollView, Image, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function DriverProfile() {
    const { userInfo, logout } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <SafeAreaView edges={['top']} className="bg-white/80 z-50">
                <View className="px-5 py-3 flex-row items-center justify-between border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-2xl bg-[#f5f8f5] items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="text-xl font-black text-[#1A1D3B] uppercase tracking-tight">Fleet Profile</Text>
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="w-10 h-10 bg-red-50 rounded-full items-center justify-center border border-red-100"
                    >
                        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 150 }}
            >
                {/* Profile Header */}
                <View className="items-center py-10 px-5">
                    <View className="w-32 h-32 rounded-[48px] border-4 border-white shadow-xl overflow-hidden bg-white mb-4">
                        <Image
                            source={{ uri: userInfo?.profileImage || "https://placehold.co/200x200?text=Driver" }}
                            className="w-full h-full"
                        />
                    </View>
                    <Text className="text-2xl font-black text-[#1A1D3B]">{userInfo?.fullName}</Text>
                    <Text className="text-gray-400 font-black uppercase tracking-[2px] text-xs">Standard Fleet Partner</Text>
                </View>

                {/* Stats Row */}
                <View className="px-5 flex-row gap-4 mb-10">
                    <View className="flex-1 bg-white p-5 rounded-[32px] shadow-sm items-center border border-gray-50">
                        <Text className="text-2xl font-black text-[#1A1D3B]">4.9</Text>
                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest mt-1">Rating</Text>
                    </View>
                    <View className="flex-1 bg-[#1A1D3B] p-5 rounded-[32px] shadow-xl items-center">
                        <Text className="text-2xl font-black text-[#FF6B6B]">1,240</Text>
                        <Text className="text-[#FF6B6B]/60 text-[8px] font-black uppercase tracking-widest mt-1">Gigs Done</Text>
                    </View>
                    <View className="flex-1 bg-white p-5 rounded-[32px] shadow-sm items-center border border-gray-50">
                        <Text className="text-2xl font-black text-[#1A1D3B]">2y</Text>
                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest mt-1">Exp.</Text>
                    </View>
                </View>

                {/* Compliance & Background Check */}
                <View className="px-5 mb-10">
                    <Text className="text-[#1A1D3B] text-[10px] font-black uppercase tracking-[4px] mb-4 ml-2">Compliance Status</Text>
                    <View className="bg-[#1A1D3B] p-6 rounded-[32px] shadow-xl relative overflow-hidden">
                        <View className="flex-row items-center justify-between z-10">
                            <View>
                                <Text className="text-[#FF6B6B] text-[10px] font-black uppercase tracking-widest mb-1">Background Check</Text>
                                <Text className="text-white text-xl font-black">FULLY VERIFIED</Text>
                                <Text className="text-white/40 text-[9px] font-bold mt-1">Valid until Oct 2026</Text>
                            </View>
                            <View className="w-12 h-12 bg-[#FF6B6B]/20 rounded-2xl items-center justify-center border border-[#FF6B6B]/30">
                                <Ionicons name="shield-checkmark" size={24} color="#FF6B6B" />
                            </View>
                        </View>
                        {/* Decorative Circle */}
                        <View className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#FF6B6B]/5 rounded-full" />
                    </View>
                </View>

                {/* Account Settings */}
                <View className="px-5 gap-4">
                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest ml-2 mb-2">Fleet Management</Text>

                    {[
                        { icon: 'car-sport', label: 'Vehicle Details', color: '#FF6B6B', status: 'Active', route: '/driver/vehicle' },
                        { icon: 'document-text', label: 'KYC Documents', color: '#3b82f6', status: 'Updated', route: '/driver/kyc' },
                        { icon: 'wallet', label: 'Payout Settings', color: '#8b5cf6', status: 'Weekly', route: '/driver/payout' },
                        { icon: 'shield-checkmark', label: 'Insurance Policy', color: '#ef4444', status: 'Expiring Soon', route: '/driver/insurance' }
                    ].map((item, idx) => (
                        <TouchableOpacity
                            key={idx}
                            onPress={() => router.push(item.route as any)}
                            className="bg-white p-5 rounded-[28px] shadow-sm border border-gray-50 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center gap-4">
                                <View className="w-12 h-12 rounded-2xl items-center justify-center bg-[#f5f8f5]">
                                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                                </View>
                                <View>
                                    <Text className="font-black text-[#1A1D3B] text-base">{item.label}</Text>
                                    <Text className={`text-[8px] font-black uppercase tracking-widest ${item.status === 'Expiring Soon' ? 'text-red-500' : 'text-gray-400'}`}>{item.status}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
                        </TouchableOpacity>
                    ))}

                    <View className="items-center opacity-10 py-10">
                        <Text className="text-[#1A1D3B] text-[10px] font-black tracking-widest uppercase text-center">Foodie Express • Driver Build</Text>
                    </View>
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
