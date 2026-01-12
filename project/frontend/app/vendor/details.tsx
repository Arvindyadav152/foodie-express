import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, StatusBar, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useContext } from 'react';
import { router } from 'expo-router';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { DEMO_IDS } from '../../constants/DemoIds';

export default function RestaurantDetailsScreen() {
    const { userInfo } = useContext(AuthContext);
    const vendorId = userInfo?.vendorId || DEMO_IDS.VENDOR;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [restaurant, setRestaurant] = useState<any>(null);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [minOrder, setMinOrder] = useState('');
    const [deliveryFee, setDeliveryFee] = useState('');

    useEffect(() => {
        fetchRestaurant();
    }, []);

    const fetchRestaurant = async () => {
        try {
            const { data } = await api.get(`/vendor/restaurant/${vendorId}`);
            setRestaurant(data);
            setName(data.name || '');
            setDescription(data.description || '');
            setCuisine(data.cuisineType?.join(', ') || '');
            setAddress(data.address || '');
            setPhone(data.phone || '');
            setDeliveryTime(data.deliveryTime || '25-35 mins');
            setMinOrder(data.minOrder?.toString() || '100');
            setDeliveryFee(data.deliveryFee?.toString() || '30');
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!restaurant) return;
        setSaving(true);
        try {
            await api.put(`/vendor/restaurant/${restaurant._id}`, {
                name, description, address, phone, deliveryTime,
                cuisineType: cuisine.split(',').map(c => c.trim()),
                minOrder: parseFloat(minOrder),
                deliveryFee: parseFloat(deliveryFee)
            });
            Alert.alert("✅ Saved", "Restaurant details updated!");
            router.back();
        } catch (error) {
            Alert.alert("Error", "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#FEFEFE]">
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#FEFEFE]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-5 py-4 flex-row items-center justify-between border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="text-xl font-black text-[#1A1D3B]">Restaurant Details</Text>
                    <TouchableOpacity onPress={handleSave} disabled={saving} className="bg-[#FF6B6B] px-4 py-2 rounded-xl">
                        <Text className="text-white font-bold text-sm">{saving ? 'Saving...' : 'Save'}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {/* Restaurant Image */}
                <TouchableOpacity className="h-40 bg-gray-100 rounded-2xl mb-6 items-center justify-center overflow-hidden">
                    {restaurant?.image ? (
                        <Image source={{ uri: restaurant.image }} className="w-full h-full" />
                    ) : (
                        <View className="items-center">
                            <MaterialIcons name="add-a-photo" size={32} color="#9ca3af" />
                            <Text className="text-gray-400 text-sm font-medium mt-2">Upload Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Form Fields */}
                <View className="gap-4">
                    <View>
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-2">Restaurant Name</Text>
                        <TextInput
                            className="bg-white px-4 h-14 rounded-xl text-[#1A1D3B] font-bold border border-gray-100"
                            value={name} onChangeText={setName} placeholder="Enter name"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-2">Cuisine Type</Text>
                        <TextInput
                            className="bg-white px-4 h-14 rounded-xl text-[#1A1D3B] font-bold border border-gray-100"
                            value={cuisine} onChangeText={setCuisine} placeholder="e.g. Indian, Chinese, Italian"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-2">Description</Text>
                        <TextInput
                            className="bg-white p-4 h-24 rounded-xl text-[#1A1D3B] border border-gray-100"
                            value={description} onChangeText={setDescription} placeholder="Describe your restaurant" multiline textAlignVertical="top"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-2">Address</Text>
                        <TextInput
                            className="bg-white px-4 h-14 rounded-xl text-[#1A1D3B] border border-gray-100"
                            value={address} onChangeText={setAddress} placeholder="Full address"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-2">Contact Phone</Text>
                        <TextInput
                            className="bg-white px-4 h-14 rounded-xl text-[#1A1D3B] font-bold border border-gray-100"
                            value={phone} onChangeText={setPhone} placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad"
                        />
                    </View>

                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-2">Delivery Time</Text>
                            <TextInput
                                className="bg-white px-4 h-14 rounded-xl text-[#1A1D3B] font-bold border border-gray-100"
                                value={deliveryTime} onChangeText={setDeliveryTime} placeholder="25-35 mins"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-2">Min Order (₹)</Text>
                            <TextInput
                                className="bg-white px-4 h-14 rounded-xl text-[#1A1D3B] font-bold border border-gray-100"
                                value={minOrder} onChangeText={setMinOrder} keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View>
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-2">Delivery Fee (₹)</Text>
                        <TextInput
                            className="bg-white px-4 h-14 rounded-xl text-[#1A1D3B] font-bold border border-gray-100"
                            value={deliveryFee} onChangeText={setDeliveryFee} keyboardType="numeric"
                        />
                    </View>
                </View>

                <View className="h-32" />
            </ScrollView>
        </View>
    );
}
