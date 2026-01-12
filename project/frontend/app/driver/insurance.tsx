import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

interface InsurancePolicy {
    id: string;
    type: string;
    provider: string;
    policyNumber: string;
    coverage: string;
    premium: string;
    startDate: string;
    expiryDate: string;
    status: 'active' | 'expiring' | 'expired';
}

export default function InsuranceScreen() {
    const [loading, setLoading] = useState<string | null>(null);

    const [policies, setPolicies] = useState<InsurancePolicy[]>([
        {
            id: '1',
            type: 'Vehicle Insurance',
            provider: 'ICICI Lombard',
            policyNumber: 'VEH-2024-123456',
            coverage: 'Comprehensive',
            premium: '₹3,500/year',
            startDate: '2024-01-15',
            expiryDate: '2025-01-14',
            status: 'active',
        },
        {
            id: '2',
            type: 'Personal Accident',
            provider: 'HDFC Ergo',
            policyNumber: 'PA-2024-789012',
            coverage: '₹5,00,000',
            premium: '₹1,200/year',
            startDate: '2024-03-01',
            expiryDate: '2024-12-31',
            status: 'expiring',
        },
    ]);

    const getStatusStyle = (status: InsurancePolicy['status']) => {
        switch (status) {
            case 'active': return { bg: 'bg-green-100', text: 'text-green-600', label: 'Active' };
            case 'expiring': return { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Expiring Soon' };
            case 'expired': return { bg: 'bg-red-100', text: 'text-red-600', label: 'Expired' };
        }
    };

    const getDaysRemaining = (expiryDate: string) => {
        const expiry = new Date(expiryDate);
        const today = new Date();
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleRenew = (policyId: string) => {
        Alert.alert(
            'Renew Policy',
            'You will be redirected to our insurance partner to renew your policy.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Continue', onPress: () => Alert.alert('Success', 'Redirecting to insurance partner...') }
            ]
        );
    };

    const handleUploadPolicy = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow camera roll access to upload documents');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                setLoading('upload');
                await new Promise(resolve => setTimeout(resolve, 1500));
                Alert.alert('Success', 'Policy document uploaded successfully!');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to upload document');
        } finally {
            setLoading(null);
        }
    };

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-5 py-3 flex-row items-center justify-between border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-2xl bg-[#f5f8f5] items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="text-lg font-black text-[#1A1D3B] uppercase tracking-tight">Insurance</Text>
                    <View className="w-10" />
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Coverage Summary */}
                <View className="mx-5 mt-6 bg-[#1A1D3B] rounded-[32px] p-6 relative overflow-hidden">
                    <View className="flex-row items-center gap-4">
                        <View className="w-16 h-16 bg-[#FF6B6B]/20 rounded-2xl items-center justify-center">
                            <MaterialIcons name="security" size={32} color="#FF6B6B" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Total Coverage</Text>
                            <Text className="text-white text-2xl font-black mt-1">₹5,50,000</Text>
                            <Text className="text-[#FF6B6B] text-xs font-bold mt-1">2 Active Policies</Text>
                        </View>
                    </View>
                    <View className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#FF6B6B]/5 rounded-full" />
                </View>

                {/* Quick Actions */}
                <View className="flex-row mx-5 mt-4 gap-3">
                    <TouchableOpacity
                        onPress={handleUploadPolicy}
                        className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center"
                    >
                        {loading === 'upload' ? (
                            <ActivityIndicator size="small" color="#FF6B6B" />
                        ) : (
                            <>
                                <MaterialIcons name="cloud-upload" size={24} color="#FF6B6B" />
                                <Text className="text-[#1A1D3B] font-bold text-xs mt-2">Upload Policy</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center"
                    >
                        <MaterialIcons name="add-circle" size={24} color="#3b82f6" />
                        <Text className="text-[#1A1D3B] font-bold text-xs mt-2">Add New</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center"
                    >
                        <MaterialIcons name="support-agent" size={24} color="#8b5cf6" />
                        <Text className="text-[#1A1D3B] font-bold text-xs mt-2">Get Help</Text>
                    </TouchableOpacity>
                </View>

                {/* Policies List */}
                <View className="px-5 mt-6 gap-4 pb-20">
                    <Text className="text-[#1A1D3B] text-xs font-black uppercase tracking-widest ml-2">Your Policies</Text>

                    {policies.map((policy) => {
                        const statusStyle = getStatusStyle(policy.status);
                        const daysRemaining = getDaysRemaining(policy.expiryDate);

                        return (
                            <View key={policy.id} className="bg-white rounded-[24px] p-5 border border-gray-100">
                                {/* Header */}
                                <View className="flex-row items-start justify-between mb-4">
                                    <View className="flex-row items-center gap-3">
                                        <View className={`w-12 h-12 rounded-xl items-center justify-center ${policy.status === 'active' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                            <MaterialIcons
                                                name={policy.type === 'Vehicle Insurance' ? 'two-wheeler' : 'person'}
                                                size={24}
                                                color={policy.status === 'active' ? '#22c55e' : '#eab308'}
                                            />
                                        </View>
                                        <View>
                                            <Text className="text-[#1A1D3B] font-black text-base">{policy.type}</Text>
                                            <Text className="text-gray-400 text-xs">{policy.provider}</Text>
                                        </View>
                                    </View>
                                    <View className={`px-3 py-1.5 rounded-full ${statusStyle.bg}`}>
                                        <Text className={`text-xs font-bold ${statusStyle.text}`}>{statusStyle.label}</Text>
                                    </View>
                                </View>

                                {/* Details */}
                                <View className="bg-gray-50 rounded-xl p-3 gap-2 mb-4">
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-400 text-xs">Policy Number</Text>
                                        <Text className="text-[#1A1D3B] text-xs font-bold">{policy.policyNumber}</Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-400 text-xs">Coverage</Text>
                                        <Text className="text-[#1A1D3B] text-xs font-bold">{policy.coverage}</Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-400 text-xs">Premium</Text>
                                        <Text className="text-[#1A1D3B] text-xs font-bold">{policy.premium}</Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-400 text-xs">Valid Until</Text>
                                        <Text className={`text-xs font-bold ${daysRemaining < 30 ? 'text-red-500' : 'text-[#1A1D3B]'}`}>
                                            {policy.expiryDate} ({daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'})
                                        </Text>
                                    </View>
                                </View>

                                {/* Actions */}
                                {policy.status !== 'active' && (
                                    <TouchableOpacity
                                        onPress={() => handleRenew(policy.id)}
                                        className="bg-[#FF6B6B] h-11 rounded-xl items-center justify-center flex-row gap-2"
                                    >
                                        <MaterialIcons name="autorenew" size={18} color="white" />
                                        <Text className="text-white font-bold">Renew Now</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}

                    {/* Add Policy Card */}
                    <TouchableOpacity className="bg-white rounded-[24px] p-6 border-2 border-dashed border-gray-200 items-center justify-center">
                        <MaterialIcons name="add" size={32} color="#9ca3af" />
                        <Text className="text-gray-400 font-bold mt-2">Add New Policy</Text>
                        <Text className="text-gray-300 text-xs mt-1">Health, Life, or Additional Coverage</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
