import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, StatusBar, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useContext } from 'react';
import { router } from 'expo-router';
import api from '../../utils/api'; // Fix path to utils/api
import { AuthContext } from '../../context/AuthContext'; // Fix path to context
import { DEMO_IDS } from '../../constants/DemoIds'; // Fix path to constants

export default function VendorProfileScreen() {
    const { logout, userInfo } = useContext(AuthContext);
    const vendorId = userInfo?.vendorId || DEMO_IDS.VENDOR;

    const [loading, setLoading] = useState(true);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [image, setImage] = useState('');

    useEffect(() => {
        if (vendorId) fetchRestaurant();
    }, [vendorId]);

    const fetchRestaurant = async () => {
        try {
            const { data } = await api.get(`/vendor/restaurant/${vendorId}`);
            setRestaurant(data);
            setIsAcceptingOrders(data.isActive);
            setName(data.name);
            setDescription(data.description);
            setDeliveryTime(data.deliveryTime);
            setPriceRange(data.priceRange);
            setImage(data.image);
        } catch (error) {
            console.error("Error fetching restaurant:", error);
            Alert.alert("Error", "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!restaurant) return;
        try {
            await api.put(`/vendor/restaurant/${restaurant._id}`, {
                name,
                description,
                deliveryTime,
                priceRange,
                image,
                isActive: isAcceptingOrders
            });
            Alert.alert("Success", "Operational settings saved!");
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to update profile");
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Sign out of partner portal?",
            [
                { text: "Stay", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        router.replace('/auth/login');
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#f5f8f5]">
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} className="bg-white/80 z-50">
                <View className="px-5 py-3 flex-row items-center justify-between border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-2xl bg-[#f5f8f5] items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="font-black text-[#1A1D3B] text-xl uppercase tracking-tight">Business Hub</Text>
                    <TouchableOpacity onPress={handleSave} className="bg-[#1A1D3B] px-4 py-2 rounded-xl">
                        <Text className="text-[#FF6B6B] font-black text-xs uppercase tracking-widest">Done</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Operational Quick Switch */}
                <View className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 mb-8 items-center flex-row justify-between">
                    <View className="flex-row items-center gap-4">
                        <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isAcceptingOrders ? 'bg-[#FF6B6B]/10' : 'bg-gray-100'}`}>
                            <MaterialIcons name="power-settings-new" size={24} color={isAcceptingOrders ? '#FF6B6B' : '#9ca3af'} />
                        </View>
                        <View>
                            <Text className="text-[#1A1D3B] font-black text-base uppercase tracking-tight">Kitchen Status</Text>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{isAcceptingOrders ? 'Accepting Orders' : 'Paused / Closed'}</Text>
                        </View>
                    </View>
                    <Switch
                        value={isAcceptingOrders}
                        onValueChange={setIsAcceptingOrders}
                        trackColor={{ true: '#FF6B6B', false: '#d1d5db' }}
                        thumbColor="#fff"
                    />
                </View>

                {/* Section Header */}
                <Text className="text-[#1A1D3B] text-[10px] font-black uppercase tracking-[4px] mb-4 ml-4">Profile Identity</Text>

                <TouchableOpacity className="h-48 w-full bg-white rounded-[32px] overflow-hidden mb-6 shadow-sm border border-gray-50 flex-row">
                    {image ? (
                        <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <MaterialIcons name="add-a-photo" size={40} color="#d1d5db" />
                            <Text className="text-gray-400 font-bold mt-2">Upload Store Image</Text>
                        </View>
                    )}
                    <View className="absolute bottom-4 right-4 bg-[#1A1D3B]/60 px-3 py-1.5 rounded-xl border border-white/20">
                        <Text className="text-white text-[10px] font-black uppercase">Change Photo</Text>
                    </View>
                </TouchableOpacity>

                <View className="gap-5 mb-8">
                    <View>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-4">Restaurant Brand</Text>
                        <TextInput
                            className="bg-white px-6 h-16 rounded-2xl text-[#1A1D3B] font-black border border-gray-50 shadow-sm"
                            value={name} onChangeText={setName} placeholder="Business Name"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-4">Catchy Description</Text>
                        <TextInput
                            className="bg-white p-6 rounded-[28px] text-[#1A1D3B] h-32 border border-gray-50 shadow-sm font-medium"
                            value={description} onChangeText={setDescription} placeholder="Describe your kitchen..." multiline textAlignVertical="top"
                        />
                    </View>

                    {/* Business Hours Placeholder UI */}
                    <Text className="text-[#1A1D3B] text-[10px] font-black uppercase tracking-[4px] mb-4 mt-4 ml-4">Operational Hours</Text>
                    <View className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 gap-4">
                        <View className="flex-row justify-between items-center opacity-40">
                            <Text className="text-gray-400 font-black text-xs">MON - FRI</Text>
                            <Text className="text-[#1A1D3B] font-black text-xs uppercase tracking-widest">09:00 AM - 11:00 PM</Text>
                        </View>
                        <View className="flex-row justify-between items-center opacity-40">
                            <Text className="text-gray-400 font-black text-xs">SAT - SUN</Text>
                            <Text className="text-[#1A1D3B] font-black text-xs uppercase tracking-widest">10:00 AM - 12:00 AM</Text>
                        </View>
                        <TouchableOpacity className="mt-2 border border-dashed border-gray-200 py-3 rounded-2xl items-center">
                            <Text className="text-[#FF6B6B] font-black text-[10px] uppercase tracking-widest">Modify Schedule</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Account Actions */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center justify-between p-6 bg-red-50 rounded-[32px] border border-red-100 mb-10"
                >
                    <View className="flex-row items-center gap-4">
                        <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center">
                            <MaterialIcons name="logout" size={20} color="#ef4444" />
                        </View>
                        <Text className="text-red-500 font-black uppercase text-xs tracking-widest">Disconnect Hub</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ef4444" />
                </TouchableOpacity>
                <View className="items-center pb-10">
                    <Text className="text-gray-300 font-black text-[10px] uppercase tracking-[8px]">Foodie Partners v1.0</Text>
                </View>
            </ScrollView>
        </View>
    );
}
