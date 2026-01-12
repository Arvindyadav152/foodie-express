import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { BlurView } from 'expo-blur';

export default function SettingsScreen() {
    const [notifications, setNotifications] = useState(true);
    const [location, setLocation] = useState(true);
    const [marketing, setMarketing] = useState(false);

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
                    <Text className="text-xl font-black text-[#1A1D3B] uppercase tracking-tighter">Settings</Text>
                    <View className="w-10 h-10" />
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Preferences Section */}
                <View className="mb-8">
                    <Text className="text-[#1A1D3B] text-[10px] font-black uppercase tracking-[4px] ml-4 mb-4">Preferences</Text>
                    <View className="bg-white rounded-[32px] p-2 shadow-sm border border-gray-50">
                        <View className="flex-row justify-between items-center p-4 border-b border-gray-50">
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center">
                                    <Ionicons name="notifications" size={20} color="#f59e0b" />
                                </View>
                                <Text className="text-base font-bold text-[#1A1D3B]">Push Notifications</Text>
                            </View>
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                trackColor={{ false: '#d1d5db', true: '#FF6B6B' }}
                                thumbColor="white"
                            />
                        </View>
                        <View className="flex-row justify-between items-center p-4 border-b border-gray-50">
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                                    <Ionicons name="location" size={20} color="#3b82f6" />
                                </View>
                                <Text className="text-base font-bold text-[#1A1D3B]">Location Services</Text>
                            </View>
                            <Switch
                                value={location}
                                onValueChange={setLocation}
                                trackColor={{ false: '#d1d5db', true: '#FF6B6B' }}
                                thumbColor="white"
                            />
                        </View>
                        <View className="flex-row justify-between items-center p-4">
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center">
                                    <Ionicons name="megaphone" size={20} color="#a855f7" />
                                </View>
                                <Text className="text-base font-bold text-[#1A1D3B]">Marketing Emails</Text>
                            </View>
                            <Switch
                                value={marketing}
                                onValueChange={setMarketing}
                                trackColor={{ false: '#d1d5db', true: '#FF6B6B' }}
                                thumbColor="white"
                            />
                        </View>
                    </View>
                </View>

                {/* Ingredient Lockdown Section */}
                <View className="mb-8">
                    <Text className="text-[#1A1D3B] text-[10px] font-black uppercase tracking-[4px] ml-4 mb-4">Ingredient Lockdown</Text>
                    <View className="bg-white rounded-[32px] p-2 shadow-sm border border-gray-50">
                        <View className="p-4 border-b border-gray-50">
                            <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-4">Auto-hide items containing:</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {['Peanuts', 'Dairy', 'Gluten', 'Seafood', 'Soy'].map(allergy => (
                                    <TouchableOpacity
                                        key={allergy}
                                        className="bg-[#f5f8f5] px-4 py-2.5 rounded-2xl border border-gray-100 flex-row items-center gap-2"
                                    >
                                        <MaterialCommunityIcons name="shield-alert" size={14} color="#ef4444" />
                                        <Text className="text-[#1A1D3B] text-[10px] font-black uppercase tracking-widest">{allergy}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <TouchableOpacity className="flex-row items-center justify-between p-4">
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center">
                                    <MaterialCommunityIcons name="shield-lock" size={20} color="#ef4444" />
                                </View>
                                <View>
                                    <Text className="text-base font-bold text-[#1A1D3B]">Strict Lockdown</Text>
                                    <Text className="text-gray-400 text-[8px] font-bold">Completely hide unsafe items</Text>
                                </View>
                            </View>
                            <Switch
                                value={true}
                                trackColor={{ false: '#d1d5db', true: '#ef4444' }}
                                thumbColor="white"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Account Section */}
                <View className="mb-8">
                    <Text className="text-[#1A1D3B] text-[10px] font-black uppercase tracking-[4px] ml-4 mb-4">Account Security</Text>
                    <View className="bg-white rounded-[32px] p-2 shadow-sm border border-gray-50">
                        <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-50">
                            <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center mr-4">
                                <MaterialIcons name="lock" size={20} color="#6b7280" />
                            </View>
                            <Text className="flex-1 text-base font-bold text-[#1A1D3B]">Change Password</Text>
                            <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center p-4">
                            <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center mr-4">
                                <MaterialIcons name="privacy-tip" size={20} color="#6b7280" />
                            </View>
                            <Text className="flex-1 text-base font-bold text-[#1A1D3B]">Privacy Policy</Text>
                            <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity className="mt-4 p-6 rounded-[24px] border border-red-100 bg-red-50/10 items-center justify-center">
                    <Text className="text-red-500 font-black uppercase tracking-[2px] text-xs">Delete Account</Text>
                </TouchableOpacity>

                <View className="items-center mt-10 opacity-20">
                    <Text className="text-[#1A1D3B] text-[10px] font-bold uppercase tracking-widest">Version 1.0.4 • Build 82</Text>
                </View>
            </ScrollView>
        </View>
    );
}
