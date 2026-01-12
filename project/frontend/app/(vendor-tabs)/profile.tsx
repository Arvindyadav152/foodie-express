import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, StatusBar, Switch, Linking, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useContext } from 'react';
import { router } from 'expo-router';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { useRequireAuth } from '../../hooks/useRequireAuth';

export default function VendorProfileScreen() {
    const { logout } = useContext(AuthContext);
    const { vendorId, isLoading: authLoading } = useRequireAuth('vendor');

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
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!restaurant) return;
        try {
            await api.put(`/vendor/restaurant/${restaurant._id}`, {
                name, description, deliveryTime, priceRange, image, isActive: isAcceptingOrders
            });
            Alert.alert("✅ Success", "Settings saved successfully!");
        } catch (error) {
            Alert.alert("Error", "Failed to update profile");
        }
    };

    const toggleKitchenStatus = async (value: boolean) => {
        setIsAcceptingOrders(value);
        try {
            await api.post('/vendor/restaurant', {
                vendorId,
                isActive: value
            });
        } catch (error) {
            setIsAcceptingOrders(!value);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const menuItems = [
        { icon: 'storefront', label: 'Restaurant Details', route: '/vendor/details', color: '#FF6B6B' },
        { icon: 'account-balance-wallet', label: 'Bank & Payouts', route: '/vendor/payouts', color: '#4ECDC4' },
        { icon: 'receipt-long', label: 'Order History', route: '/vendor/history', color: '#FFE66D' },
        { icon: 'star', label: 'Reviews & Ratings', route: '/vendor/reviews', color: '#FF9F43' },
        { icon: 'bar-chart', label: 'Sales Reports', route: '/vendor/reports', color: '#8B5CF6' },
    ];

    const supportItems = [
        { icon: 'help-circle-outline', label: 'Help & Support', action: () => Linking.openURL('tel:+919876543210'), color: '#3B82F6' },
        { icon: 'chatbubbles-outline', label: 'Contact Manager', action: () => Linking.openURL('https://wa.me/919876543210'), color: '#25D366' },
        { icon: 'document-text-outline', label: 'Terms & Policies', action: () => router.push('/terms'), color: '#6B7280' },
    ];

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
                    <Text className="text-2xl font-black text-[#1A1D3B]">Profile</Text>
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="w-10 h-10 bg-red-50 rounded-full items-center justify-center border border-red-100"
                        >
                            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave} className="bg-[#FF6B6B] px-4 py-2 rounded-xl">
                            <Text className="text-white font-bold text-sm">Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Restaurant Card */}
                <View className="mx-5 mt-4 bg-[#1A1D3B] rounded-[28px] p-6 relative overflow-hidden">
                    <View className="flex-row items-center gap-4">
                        <View className="w-20 h-20 rounded-2xl border-2 border-[#FF6B6B] overflow-hidden bg-gray-800">
                            <Image
                                source={{ uri: image || 'https://placehold.co/200x200?text=Shop' }}
                                className="w-full h-full"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white text-xl font-black">{name || 'Your Restaurant'}</Text>
                            <Text className="text-[#FF6B6B] text-xs font-bold mt-1">Partner Restaurant</Text>
                            <View className="flex-row items-center gap-2 mt-2">
                                <View className={`w-2 h-2 rounded-full ${isAcceptingOrders ? 'bg-[#4ECDC4]' : 'bg-gray-500'}`} />
                                <Text className="text-white/60 text-xs font-bold">{isAcceptingOrders ? 'Open' : 'Closed'}</Text>
                            </View>
                        </View>
                    </View>
                    <View className="absolute -right-8 -bottom-8 w-28 h-28 bg-[#FF6B6B]/10 rounded-full" />
                </View>

                {/* Kitchen Status Toggle */}
                <View className="mx-5 mt-4 bg-white p-5 rounded-2xl border border-gray-100 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <View className={`w-12 h-12 rounded-xl items-center justify-center ${isAcceptingOrders ? 'bg-[#4ECDC4]/15' : 'bg-gray-100'}`}>
                            <MaterialIcons name="restaurant" size={24} color={isAcceptingOrders ? '#4ECDC4' : '#9ca3af'} />
                        </View>
                        <View>
                            <Text className="text-[#1A1D3B] font-bold">Kitchen Status</Text>
                            <Text className="text-gray-400 text-xs">{isAcceptingOrders ? 'Accepting orders' : 'Not accepting'}</Text>
                        </View>
                    </View>
                    <Switch
                        value={isAcceptingOrders}
                        onValueChange={toggleKitchenStatus}
                        trackColor={{ true: '#4ECDC4', false: '#d1d5db' }}
                        thumbColor="#fff"
                    />
                </View>

                {/* Quick Stats */}
                <View className="flex-row mx-5 mt-4 gap-3">
                    <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center">
                        <Text className="text-2xl font-black text-[#FF6B6B]">4.8</Text>
                        <Text className="text-gray-400 text-xs font-bold mt-1">Rating</Text>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center">
                        <Text className="text-2xl font-black text-[#1A1D3B]">234</Text>
                        <Text className="text-gray-400 text-xs font-bold mt-1">Orders</Text>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 items-center">
                        <Text className="text-2xl font-black text-[#4ECDC4]">98%</Text>
                        <Text className="text-gray-400 text-xs font-bold mt-1">Acceptance</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View className="mx-5 mt-6">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 ml-2">Business Settings</Text>
                    <View className="gap-3">
                        {menuItems.map((item, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => router.push(item.route as any)}
                                className="bg-white p-4 rounded-2xl flex-row items-center justify-between border border-gray-100"
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                                        <MaterialIcons name={item.icon as any} size={20} color={item.color} />
                                    </View>
                                    <Text className="text-[#1A1D3B] font-bold">{item.label}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Support Section */}
                <View className="mx-5 mt-6">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 ml-2">Support</Text>
                    <View className="gap-3">
                        {supportItems.map((item, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={item.action}
                                className="bg-white p-4 rounded-2xl flex-row items-center justify-between border border-gray-100"
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                                        <Ionicons name={item.icon as any} size={20} color={item.color} />
                                    </View>
                                    <Text className="text-[#1A1D3B] font-bold">{item.label}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* App Version */}
                <View className="items-center mt-10">
                    <Text className="text-gray-300 text-xs font-bold uppercase tracking-widest">Foodies Partner Build • Premium</Text>
                </View>

                {/* App Version */}
                <View className="items-center mt-6">
                    <Text className="text-gray-300 text-xs font-bold">Foodies Partner v1.0</Text>
                </View>
            </ScrollView>
        </View>
    );
}
