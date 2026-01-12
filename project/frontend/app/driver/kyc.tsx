import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

interface Document {
    id: string;
    name: string;
    type: string;
    status: 'verified' | 'pending' | 'rejected' | 'expired' | 'required';
    uploadedAt?: string;
    expiresAt?: string;
    image?: string;
}

export default function KYCDocumentsScreen() {
    const [loading, setLoading] = useState<string | null>(null);

    const [documents, setDocuments] = useState<Document[]>([
        { id: '1', name: 'Aadhaar Card', type: 'identity', status: 'verified', uploadedAt: '2024-01-15', image: undefined },
        { id: '2', name: 'PAN Card', type: 'identity', status: 'verified', uploadedAt: '2024-01-15', image: undefined },
        { id: '3', name: 'Driving License', type: 'license', status: 'verified', uploadedAt: '2024-01-15', expiresAt: '2028-05-20', image: undefined },
        { id: '4', name: 'Vehicle RC', type: 'vehicle', status: 'pending', uploadedAt: '2024-12-01', image: undefined },
        { id: '5', name: 'Insurance Policy', type: 'vehicle', status: 'expired', expiresAt: '2024-12-31', image: undefined },
        { id: '6', name: 'Address Proof', type: 'address', status: 'required', image: undefined },
    ]);

    const getStatusColor = (status: Document['status']) => {
        switch (status) {
            case 'verified': return { bg: 'bg-green-100', text: 'text-green-600', icon: 'check-circle', iconColor: '#22c55e' };
            case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: 'schedule', iconColor: '#eab308' };
            case 'rejected': return { bg: 'bg-red-100', text: 'text-red-600', icon: 'cancel', iconColor: '#ef4444' };
            case 'expired': return { bg: 'bg-red-100', text: 'text-red-600', icon: 'error', iconColor: '#ef4444' };
            case 'required': return { bg: 'bg-gray-100', text: 'text-gray-600', icon: 'upload-file', iconColor: '#6b7280' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-600', icon: 'help', iconColor: '#6b7280' };
        }
    };

    const handleUpload = async (docId: string) => {
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
                setLoading(docId);
                // Simulate upload
                await new Promise(resolve => setTimeout(resolve, 1500));

                setDocuments(docs => docs.map(doc =>
                    doc.id === docId
                        ? { ...doc, status: 'pending' as const, uploadedAt: new Date().toISOString().split('T')[0], image: result.assets[0].uri }
                        : doc
                ));
                Alert.alert('Success', 'Document uploaded successfully! Verification in progress.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to upload document');
        } finally {
            setLoading(null);
        }
    };

    const verifiedCount = documents.filter(d => d.status === 'verified').length;
    const totalCount = documents.length;

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-5 py-3 flex-row items-center justify-between border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-2xl bg-[#f5f8f5] items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="text-lg font-black text-[#1A1D3B] uppercase tracking-tight">KYC Documents</Text>
                    <View className="w-10" />
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Progress Card */}
                <View className="mx-5 mt-6 bg-[#1A1D3B] rounded-[32px] p-6 relative overflow-hidden">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Verification Status</Text>
                            <Text className="text-white text-3xl font-black mt-1">{verifiedCount}/{totalCount}</Text>
                            <Text className="text-[#FF6B6B] text-xs font-bold mt-1">Documents Verified</Text>
                        </View>
                        <View className="w-20 h-20 items-center justify-center">
                            <View className="w-16 h-16 rounded-full border-4 border-[#FF6B6B]/30 items-center justify-center">
                                <Text className="text-[#FF6B6B] font-black text-lg">{Math.round((verifiedCount / totalCount) * 100)}%</Text>
                            </View>
                        </View>
                    </View>
                    <View className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-[#FF6B6B] rounded-full"
                            style={{ width: `${(verifiedCount / totalCount) * 100}%` }}
                        />
                    </View>
                    <View className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#FF6B6B]/5 rounded-full" />
                </View>

                {/* Documents List */}
                <View className="px-5 mt-6 gap-3 pb-20">
                    <Text className="text-[#1A1D3B] text-xs font-black uppercase tracking-widest mb-2 ml-2">Your Documents</Text>

                    {documents.map((doc) => {
                        const statusStyle = getStatusColor(doc.status);
                        return (
                            <View key={doc.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-3 flex-1">
                                        <View className={`w-12 h-12 rounded-xl items-center justify-center ${statusStyle.bg}`}>
                                            <MaterialIcons name={statusStyle.icon as any} size={24} color={statusStyle.iconColor} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-[#1A1D3B] font-bold text-base">{doc.name}</Text>
                                            {doc.uploadedAt && (
                                                <Text className="text-gray-400 text-xs">Uploaded: {doc.uploadedAt}</Text>
                                            )}
                                            {doc.expiresAt && (
                                                <Text className={`text-xs ${doc.status === 'expired' ? 'text-red-500' : 'text-gray-400'}`}>
                                                    {doc.status === 'expired' ? 'Expired: ' : 'Expires: '}{doc.expiresAt}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    <View className={`px-3 py-1.5 rounded-full ${statusStyle.bg}`}>
                                        <Text className={`text-xs font-bold capitalize ${statusStyle.text}`}>{doc.status}</Text>
                                    </View>
                                </View>

                                {/* Upload/Re-upload Button */}
                                {(doc.status === 'required' || doc.status === 'rejected' || doc.status === 'expired') && (
                                    <TouchableOpacity
                                        onPress={() => handleUpload(doc.id)}
                                        disabled={loading === doc.id}
                                        className="mt-3 bg-[#FF6B6B]/10 h-11 rounded-xl items-center justify-center flex-row gap-2"
                                    >
                                        {loading === doc.id ? (
                                            <ActivityIndicator size="small" color="#FF6B6B" />
                                        ) : (
                                            <>
                                                <MaterialIcons name="cloud-upload" size={18} color="#FF6B6B" />
                                                <Text className="text-[#FF6B6B] font-bold text-sm">
                                                    {doc.status === 'required' ? 'Upload Document' : 'Re-upload Document'}
                                                </Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}
