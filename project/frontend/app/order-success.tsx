import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function OrderSuccessScreen() {
    const { orderId, otp } = useLocalSearchParams();

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView className="absolute top-0 left-0 right-0 z-50">
                <TouchableOpacity
                    onPress={() => router.replace('/(tabs)/home')}
                    className="ml-6 mt-2 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
                >
                    <Ionicons name="close" size={24} color="#1A1D3B" />
                </TouchableOpacity>
            </SafeAreaView>

            <SafeAreaView className="flex-1 items-center justify-center px-10">
                {/* Success Animation */}
                <View className="w-40 h-40 bg-[#FF6B6B]/10 rounded-full items-center justify-center mb-10 overflow-hidden">
                    <View className="w-28 h-28 bg-[#1A1D3B] rounded-[48px] items-center justify-center shadow-2xl shadow-black/30">
                        <Ionicons name="checkmark-done" size={60} color="#FF6B6B" />
                    </View>
                    {/* Decorative Ring */}
                    <View className="absolute inset-0 border-4 border-[#FF6B6B]/20 rounded-full scale-90" />
                </View>

                <View className="items-center">
                    <Text className="text-4xl font-black text-[#1A1D3B] text-center uppercase tracking-tighter">Hunger Tamed!</Text>
                    <Text className="text-gray-400 text-center font-bold uppercase tracking-widest text-[10px] mt-2 mb-6">
                        Your culinary journey has begun
                    </Text>
                </View>

                <View className="bg-white px-8 py-6 rounded-[32px] border border-gray-100 shadow-sm flex-row items-center gap-4 mb-6">
                    <View className="w-10 h-10 bg-[#f5f8f5] rounded-xl items-center justify-center">
                        <MaterialIcons name="receipt" size={20} color="#FF6B6B" />
                    </View>
                    <View>
                        <Text className="text-gray-300 text-[8px] font-black uppercase tracking-[3px]">Order Reference</Text>
                        <Text className="text-[#1A1D3B] font-black text-lg">#{orderId?.toString().slice(-6).toUpperCase() || 'FD7701'}</Text>
                    </View>
                </View>

                {/* Delivery PIN Card */}
                <View className="bg-[#1A1D3B] w-full p-6 rounded-[32px] mb-16 flex-row items-center justify-between border border-[#FF6B6B]/20 shadow-2xl">
                    <View>
                        <Text className="text-[#FF6B6B] text-[8px] font-black uppercase tracking-[4px] mb-1">Delivery PIN</Text>
                        <Text className="text-white text-4xl font-black tracking-[8px]">{otp || '1234'}</Text>
                        <Text className="text-white/40 text-[7px] font-bold uppercase mt-2">Give this to the driver at delivery</Text>
                    </View>
                    <View className="bg-[#FF6B6B]/10 p-4 rounded-[20px]">
                        <Ionicons name="shield-checkmark" size={32} color="#FF6B6B" />
                    </View>
                </View>

                <View className="w-full gap-4">
                    <TouchableOpacity
                        onPress={() => router.push(`/order-tracking/${orderId}`)}
                        className="w-full h-18 bg-[#1A1D3B] rounded-[24px] items-center justify-center flex-row gap-4 shadow-2xl shadow-black/40"
                    >
                        <MaterialIcons name="track-changes" size={24} color="#FF6B6B" />
                        <Text className="text-[#FF6B6B] font-black uppercase tracking-widest text-sm">Track the Delivery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.replace('/(tabs)/home')}
                        className="w-full h-18 bg-white rounded-[24px] items-center justify-center border border-gray-100 shadow-sm"
                    >
                        <Text className="text-gray-400 font-black uppercase tracking-widest text-sm">Back to Kitchens</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Bottom Decoration */}
            <View className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none opacity-20">
                <View className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#FF6B6B] rounded-full blur-[100px]" />
                <View className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#FF6B6B] rounded-full blur-[100px]" />
            </View>
        </View>
    );
}
