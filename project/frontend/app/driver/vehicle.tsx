import { View, Text, TouchableOpacity, ScrollView, TextInput, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { router } from 'expo-router';
import api from '../../utils/api';

export default function VehicleDetailsScreen() {
    const { userInfo } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);

    const [vehicleData, setVehicleData] = useState({
        type: 'Motorcycle',
        make: 'Honda',
        model: 'Activa 6G',
        year: '2023',
        color: 'Black',
        plateNumber: 'DL 01 AB 1234',
        fuelType: 'Petrol',
        insuranceExpiry: '2025-12-31',
        rcExpiry: '2028-03-15',
    });

    const vehicleTypes = ['Motorcycle', 'Scooter', 'Bicycle', 'Electric Bike'];

    const handleSave = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            Alert.alert('Success', 'Vehicle details updated successfully!');
            setEditing(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update vehicle details');
        } finally {
            setLoading(false);
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
                    <Text className="text-lg font-black text-[#1A1D3B] uppercase tracking-tight">Vehicle Details</Text>
                    <TouchableOpacity onPress={() => setEditing(!editing)} className="w-10 h-10 rounded-2xl bg-[#FF6B6B]/10 items-center justify-center">
                        <MaterialIcons name={editing ? "close" : "edit"} size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
                {/* Vehicle Image Card */}
                <View className="bg-[#1A1D3B] rounded-[32px] p-6 mb-6 relative overflow-hidden">
                    <View className="flex-row items-center gap-4">
                        <View className="w-20 h-20 bg-white/10 rounded-2xl items-center justify-center">
                            <MaterialIcons name="two-wheeler" size={40} color="#FF6B6B" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white text-xl font-black">{vehicleData.make} {vehicleData.model}</Text>
                            <Text className="text-[#FF6B6B] font-bold mt-1">{vehicleData.plateNumber}</Text>
                            <View className="flex-row items-center gap-2 mt-2">
                                <View className="bg-[#FF6B6B]/20 px-3 py-1 rounded-full">
                                    <Text className="text-[#FF6B6B] text-xs font-bold">{vehicleData.type}</Text>
                                </View>
                                <View className="bg-white/10 px-3 py-1 rounded-full">
                                    <Text className="text-white/70 text-xs font-bold">{vehicleData.year}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#FF6B6B]/5 rounded-full" />
                </View>

                {/* Vehicle Type Selection */}
                {editing && (
                    <View className="mb-6">
                        <Text className="text-[#1A1D3B] text-xs font-black uppercase tracking-widest mb-3 ml-2">Vehicle Type</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {vehicleTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => setVehicleData({ ...vehicleData, type })}
                                    className={`px-4 py-3 rounded-xl ${vehicleData.type === type ? 'bg-[#FF6B6B]' : 'bg-white border border-gray-100'}`}
                                >
                                    <Text className={`font-bold ${vehicleData.type === type ? 'text-white' : 'text-gray-600'}`}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Form Fields */}
                <View className="gap-4">
                    <Text className="text-[#1A1D3B] text-xs font-black uppercase tracking-widest mb-1 ml-2">Vehicle Information</Text>

                    {[
                        { label: 'Make', key: 'make', icon: 'business' },
                        { label: 'Model', key: 'model', icon: 'directions-car' },
                        { label: 'Year', key: 'year', icon: 'event' },
                        { label: 'Color', key: 'color', icon: 'palette' },
                        { label: 'Plate Number', key: 'plateNumber', icon: 'confirmation-number' },
                        { label: 'Fuel Type', key: 'fuelType', icon: 'local-gas-station' },
                    ].map((field) => (
                        <View key={field.key} className="bg-white rounded-2xl p-4 border border-gray-100">
                            <Text className="text-gray-400 text-xs font-bold mb-1">{field.label}</Text>
                            {editing ? (
                                <TextInput
                                    value={vehicleData[field.key as keyof typeof vehicleData]}
                                    onChangeText={(text) => setVehicleData({ ...vehicleData, [field.key]: text })}
                                    className="text-[#1A1D3B] font-bold text-base"
                                    placeholder={field.label}
                                />
                            ) : (
                                <View className="flex-row items-center gap-2">
                                    <MaterialIcons name={field.icon as any} size={18} color="#FF6B6B" />
                                    <Text className="text-[#1A1D3B] font-bold text-base">{vehicleData[field.key as keyof typeof vehicleData]}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Document Expiry */}
                <View className="mt-6 gap-3">
                    <Text className="text-[#1A1D3B] text-xs font-black uppercase tracking-widest mb-1 ml-2">Document Status</Text>

                    <View className="bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-green-50 rounded-xl items-center justify-center">
                                <MaterialIcons name="verified" size={20} color="#22c55e" />
                            </View>
                            <View>
                                <Text className="text-[#1A1D3B] font-bold">Insurance</Text>
                                <Text className="text-gray-400 text-xs">Expires: {vehicleData.insuranceExpiry}</Text>
                            </View>
                        </View>
                        <View className="bg-green-100 px-3 py-1 rounded-full">
                            <Text className="text-green-600 text-xs font-bold">Active</Text>
                        </View>
                    </View>

                    <View className="bg-white rounded-2xl p-4 border border-gray-100 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center">
                                <MaterialIcons name="description" size={20} color="#3b82f6" />
                            </View>
                            <View>
                                <Text className="text-[#1A1D3B] font-bold">RC Book</Text>
                                <Text className="text-gray-400 text-xs">Expires: {vehicleData.rcExpiry}</Text>
                            </View>
                        </View>
                        <View className="bg-blue-100 px-3 py-1 rounded-full">
                            <Text className="text-blue-600 text-xs font-bold">Valid</Text>
                        </View>
                    </View>
                </View>

                {/* Save Button */}
                {editing && (
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={loading}
                        className="bg-[#FF6B6B] h-14 rounded-2xl items-center justify-center mt-6 mb-10"
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-black text-base">Save Changes</Text>
                        )}
                    </TouchableOpacity>
                )}

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
