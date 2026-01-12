import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, StatusBar, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect, useContext } from 'react';
import { router } from 'expo-router';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { DEMO_IDS } from '../constants/DemoIds';
import { BlurView } from 'expo-blur';

export default function ManageAddressesScreen() {
    const { userInfo } = useContext(AuthContext);
    const userId = userInfo?._id || DEMO_IDS.CUSTOMER;

    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newAddress, setNewAddress] = useState({ label: 'Home', street: '', city: '', zip: '' });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const { data } = await api.get(`/users/${userId}/addresses`);
            setAddresses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addAddress = async () => {
        try {
            if (!newAddress.street || !newAddress.city) return;
            const addressPayload = {
                ...newAddress,
                coordinates: { lat: 0, lng: 0 } // Fixed for current backend model expectation
            };
            const { data } = await api.post(`/users/${userId}/addresses`, addressPayload);
            setAddresses(data);
            setModalVisible(false);
            setNewAddress({ label: 'Home', street: '', city: '', zip: '' });
        } catch (error) {
            console.error(error);
        }
    };

    const renderAddress = ({ item }: { item: any }) => (
        <View className="bg-white mx-5 mb-4 p-5 rounded-[32px] shadow-sm border border-gray-50 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
                <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 shadow-sm ${item.label === 'Home' ? 'bg-blue-50' : item.label === 'Work' ? 'bg-purple-50' : 'bg-orange-50'}`}>
                    <MaterialCommunityIcons
                        name={item.label === 'Home' ? 'home-variant' : item.label === 'Work' ? 'office-building' : 'map-marker-radius'}
                        size={28}
                        color={item.label === 'Home' ? '#3b82f6' : item.label === 'Work' ? '#a855f7' : '#f97316'}
                    />
                </View>
                <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                        <Text className="font-black text-[#1A1D3B] text-lg tracking-tighter uppercase">{item.label}</Text>
                        {item.isDefault && (
                            <View className="bg-[#FF6B6B]/10 px-2 py-0.5 rounded-md border border-[#FF6B6B]/20">
                                <Text className="text-[#FF6B6B] text-[8px] font-black uppercase tracking-widest">Active</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-gray-400 text-xs font-bold mt-0.5" numberOfLines={1}>{item.street}, {item.city}</Text>
                </View>
            </View>
            <TouchableOpacity className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center">
                <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView edges={['top']} className="bg-white/80 z-50">
                <View className="px-5 py-3 flex-row items-center gap-4 border-b border-gray-100">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-2xl bg-[#f5f8f5] items-center justify-center"
                    >
                        <Ionicons name="chevron-back" size={20} color="#1A1D3B" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-black text-[#1A1D3B] uppercase tracking-tighter">Saved Places</Text>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Manage your delivery spots</Text>
                    </View>
                </View>
            </SafeAreaView>

            <FlatList
                data={addresses}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderAddress}
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 150 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center py-24 px-10">
                        <View className="w-24 h-24 bg-white rounded-[40px] items-center justify-center mb-6 shadow-sm border border-gray-50">
                            <MaterialIcons name="location-off" size={48} color="#d1d5db" />
                        </View>
                        <Text className="text-[#1A1D3B] text-2xl font-black text-center uppercase tracking-tighter">Where are you?</Text>
                        <Text className="text-gray-400 text-center mt-2 font-bold px-4">Add an address to start ordering deliciious food!</Text>
                    </View>
                }
            />

            <View className="absolute bottom-10 left-0 right-0 px-5">
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="bg-[#1A1D3B] py-6 rounded-[32px] items-center shadow-xl shadow-black/30 active:scale-95"
                >
                    <Text className="text-[#FF6B6B] font-black uppercase tracking-[3px] text-xs">Add New Address</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[48px] p-8 pt-10">
                        <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-8" />
                        <Text className="text-2xl font-black text-[#1A1D3B] uppercase tracking-tighter mb-8">New Drop Spot</Text>

                        <ScrollView className="mb-6" showsVerticalScrollIndicator={false}>
                            <View className="gap-6">
                                <View>
                                    <Text className="text-[#1A1D3B] text-[10px] font-black uppercase tracking-widest mb-3 ml-2">Category</Text>
                                    <View className="flex-row gap-3">
                                        {['Home', 'Work', 'Other'].map(label => (
                                            <TouchableOpacity
                                                key={label}
                                                onPress={() => setNewAddress({ ...newAddress, label })}
                                                className={`px-6 py-3.5 rounded-2xl border-2 ${newAddress.label === label ? 'bg-[#1A1D3B] border-[#1A1D3B]' : 'bg-[#f5f8f5] border-transparent'}`}
                                            >
                                                <Text className={`font-black uppercase text-[10px] tracking-widest ${newAddress.label === label ? 'text-[#FF6B6B]' : 'text-gray-400'}`}>{label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View>
                                    <View className="flex-row items-center justify-between mb-3 ml-2">
                                        <Text className="text-[#1A1D3B] text-[10px] font-black uppercase tracking-widest">Street Address</Text>
                                        <Ionicons name="map" size={12} color="#FF6B6B" />
                                    </View>
                                    <TextInput
                                        value={newAddress.street}
                                        onChangeText={t => setNewAddress({ ...newAddress, street: t })}
                                        className="bg-[#f5f8f5] p-5 rounded-3xl text-[#1A1D3B] font-bold"
                                        placeholder="123 Main St, Apartment 4B"
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>

                                <View className="flex-row gap-4">
                                    <View className="flex-1">
                                        <Text className="text-[#1A1D3B] text-[10px] font-black uppercase tracking-widest mb-3 ml-2">City</Text>
                                        <TextInput
                                            value={newAddress.city}
                                            onChangeText={t => setNewAddress({ ...newAddress, city: t })}
                                            className="bg-[#f5f8f5] p-5 rounded-3xl text-[#1A1D3B] font-bold"
                                            placeholder="City"
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[#1A1D3B] text-[10px] font-black uppercase tracking-widest mb-3 ml-2">ZIP</Text>
                                        <TextInput
                                            value={newAddress.zip}
                                            onChangeText={t => setNewAddress({ ...newAddress, zip: t })}
                                            className="bg-[#f5f8f5] p-5 rounded-3xl text-[#1A1D3B] font-bold"
                                            placeholder="Zip"
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </View>
                                </View>
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            onPress={addAddress}
                            className="bg-[#1A1D3B] py-6 rounded-[32px] items-center mb-4 shadow-xl shadow-black/20 active:scale-95"
                        >
                            <Text className="text-[#FF6B6B] font-black uppercase tracking-[3px] text-xs">Confirm Address</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="py-2 items-center mb-6"
                        >
                            <Text className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Go Back</Text>
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
