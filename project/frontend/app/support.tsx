import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';

export default function SupportScreen() {
    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <SafeAreaView edges={['top']} className="bg-white/80 z-50">
                <View className="px-5 py-4 flex-row items-center justify-between border-b border-gray-100">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center rounded-2xl bg-[#f6f8f6]"
                    >
                        <MaterialIcons name="arrow-back-ios-new" size={18} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="text-xl font-black text-[#1A1D3B] uppercase tracking-tighter">Support</Text>
                    <View className="w-10 h-10" />
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="mb-8 items-center">
                    <View className="w-20 h-20 bg-[#1A1D3B] rounded-[32px] items-center justify-center mb-4 shadow-xl">
                        <Ionicons name="chatbubbles" size={32} color="#FF6B6B" />
                    </View>
                    <Text className="text-2xl font-black text-[#1A1D3B] uppercase tracking-tighter">How can we help?</Text>
                    <Text className="text-gray-400 font-bold mt-1">Our team is active 24/7 for you</Text>
                </View>

                <View className="gap-4 mb-10">
                    {[
                        { title: 'Issue with an order', icon: 'fastfood', color: '#f59e0b' },
                        { title: 'Payment & Refund', icon: 'account-balance-wallet', color: '#3b82f6' },
                        { title: 'App Feedback', icon: 'bug-report', color: '#ef4444' },
                        { title: 'Terms of Service', icon: 'description', color: '#6b7280' },
                    ].map((item, idx) => (
                        <TouchableOpacity key={idx} className="bg-white p-5 rounded-[28px] shadow-sm border border-gray-50 flex-row justify-between items-center">
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center">
                                    <MaterialIcons name={item.icon as any} size={20} color={item.color} />
                                </View>
                                <Text className="font-bold text-[#1A1D3B] text-base">{item.title}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-50">
                    <Text className="text-[#1A1D3B] text-[10px] font-black uppercase tracking-[4px] ml-2 mb-4">Direct Message</Text>
                    <TextInput
                        className="bg-[#f5f8f5] p-5 rounded-3xl text-[#1A1D3B] font-bold h-32"
                        multiline
                        textAlignVertical="top"
                        placeholder="Explain your situation..."
                        placeholderTextColor="#9ca3af"
                    />
                    <TouchableOpacity className="bg-[#1A1D3B] py-5 rounded-[24px] items-center mt-6 shadow-xl shadow-black/20">
                        <Text className="text-[#FF6B6B] font-black uppercase tracking-[3px] text-xs">Send Ticket</Text>
                    </TouchableOpacity>
                </View>

                <View className="mt-10 items-center">
                    <TouchableOpacity className="flex-row items-center gap-2">
                        <Ionicons name="call" size={16} color="#FF6B6B" />
                        <Text className="text-[#1A1D3B] font-black uppercase tracking-widest text-[10px]">Call Support Line</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
