import { View, Text, TouchableOpacity, ScrollView, StatusBar, Linking, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function ContactManagerScreen() {
    const { userInfo } = useContext(AuthContext);

    // Mock fleet manager data (in production, this would come from API based on driver's zone)
    const manager = {
        name: 'Vikram Sharma',
        role: 'Fleet Operations Manager',
        zone: 'North Delhi Zone',
        phone: '+91 98765 12345',
        whatsapp: '+919876512345',
        email: 'vikram.sharma@foodies.com',
        image: 'https://ui-avatars.com/api/?name=Vikram+Sharma&background=0df20d&color=111811&size=200',
        availability: 'Mon-Sat, 9 AM - 9 PM',
        responseTime: 'Usually responds within 15 mins',
    };

    const handleCall = () => {
        Linking.openURL(`tel:${manager.phone}`);
    };

    const handleWhatsApp = () => {
        const message = encodeURIComponent(`Hi ${manager.name}, I'm ${userInfo?.fullName}, Driver ID: ${userInfo?._id?.slice(-6)}`);
        Linking.openURL(`https://wa.me/${manager.whatsapp}?text=${message}`);
    };

    const handleEmail = () => {
        const subject = encodeURIComponent(`Support Request - Driver ${userInfo?.fullName}`);
        const body = encodeURIComponent(`\n\nDriver Name: ${userInfo?.fullName}\nDriver ID: ${userInfo?._id}\n`);
        Linking.openURL(`mailto:${manager.email}?subject=${subject}&body=${body}`);
    };

    const commonIssues = [
        { icon: 'cash-outline', label: 'Payment Issue', color: '#22c55e' },
        { icon: 'car-outline', label: 'Vehicle Problem', color: '#3b82f6' },
        { icon: 'document-outline', label: 'Document Update', color: '#8b5cf6' },
        { icon: 'alert-circle-outline', label: 'Customer Complaint', color: '#f97316' },
        { icon: 'map-outline', label: 'Zone Change', color: '#06b6d4' },
        { icon: 'time-outline', label: 'Schedule Issue', color: '#ec4899' },
    ];

    const handleQuickIssue = (issue: string) => {
        const message = encodeURIComponent(`Hi ${manager.name}, I need help with: ${issue}\n\nDriver: ${userInfo?.fullName}\nID: ${userInfo?._id?.slice(-6)}`);
        Linking.openURL(`https://wa.me/${manager.whatsapp}?text=${message}`);
    };

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-5 py-4 flex-row items-center gap-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-black text-[#1A1D3B]">Contact Manager</Text>
                        <Text className="text-gray-400 text-xs">Your fleet operations support</Text>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Manager Card */}
                <View className="mx-5 mt-6 bg-[#1A1D3B] rounded-[28px] p-6 relative overflow-hidden">
                    <View className="flex-row items-center gap-4">
                        <Image
                            source={{ uri: manager.image }}
                            className="w-20 h-20 rounded-full border-2 border-[#FF6B6B]"
                        />
                        <View className="flex-1">
                            <Text className="text-white text-xl font-black">{manager.name}</Text>
                            <Text className="text-[#FF6B6B] text-xs font-bold mt-1">{manager.role}</Text>
                            <Text className="text-white/50 text-xs mt-1">{manager.zone}</Text>
                        </View>
                    </View>

                    <View className="flex-row mt-5 gap-3">
                        <TouchableOpacity
                            onPress={handleCall}
                            className="flex-1 bg-[#FF6B6B] py-3 rounded-xl items-center flex-row justify-center gap-2"
                        >
                            <Ionicons name="call" size={18} color="#1A1D3B" />
                            <Text className="text-[#1A1D3B] font-bold">Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleWhatsApp}
                            className="flex-1 bg-[#25D366] py-3 rounded-xl items-center flex-row justify-center gap-2"
                        >
                            <Ionicons name="logo-whatsapp" size={18} color="white" />
                            <Text className="text-white font-bold">WhatsApp</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleEmail}
                            className="w-12 bg-white/10 py-3 rounded-xl items-center justify-center"
                        >
                            <Ionicons name="mail" size={18} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Decorative */}
                    <View className="absolute -right-10 -top-10 w-32 h-32 bg-[#FF6B6B]/10 rounded-full" />
                </View>

                {/* Availability */}
                <View className="mx-5 mt-4 bg-white p-5 rounded-2xl border border-gray-100">
                    <View className="flex-row items-center gap-3 mb-3">
                        <View className="w-10 h-10 bg-green-50 rounded-xl items-center justify-center">
                            <Ionicons name="time" size={20} color="#22c55e" />
                        </View>
                        <View>
                            <Text className="text-[#1A1D3B] font-bold">Availability</Text>
                            <Text className="text-gray-400 text-xs">{manager.availability}</Text>
                        </View>
                    </View>
                    <View className="bg-green-50 p-3 rounded-xl flex-row items-center gap-2">
                        <View className="w-2 h-2 bg-green-500 rounded-full" />
                        <Text className="text-green-600 text-xs font-medium">{manager.responseTime}</Text>
                    </View>
                </View>

                {/* Quick Issue Select */}
                <View className="mx-5 mt-6">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 ml-2">Quick Issue Report</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {commonIssues.map((issue, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => handleQuickIssue(issue.label)}
                                className="bg-white px-4 py-3 rounded-xl flex-row items-center gap-2 border border-gray-100"
                            >
                                <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: `${issue.color}15` }}>
                                    <Ionicons name={issue.icon as any} size={16} color={issue.color} />
                                </View>
                                <Text className="text-[#1A1D3B] font-medium text-sm">{issue.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Emergency Contact */}
                <View className="mx-5 mt-6 mb-8">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 ml-2">Emergency</Text>
                    <TouchableOpacity
                        onPress={() => Linking.openURL('tel:112')}
                        className="bg-red-50 p-5 rounded-2xl flex-row items-center justify-between border border-red-100"
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="w-12 h-12 bg-red-100 rounded-xl items-center justify-center">
                                <Ionicons name="warning" size={24} color="#ef4444" />
                            </View>
                            <View>
                                <Text className="text-red-600 font-bold">Emergency SOS</Text>
                                <Text className="text-red-400 text-xs">Call 112 for immediate help</Text>
                            </View>
                        </View>
                        <Ionicons name="call" size={24} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
