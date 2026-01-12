import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, StatusBar, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useContext } from 'react';
import { BlurView } from 'expo-blur';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { RestaurantSkeleton } from '../../components/SkeletonLoader';
import { useSocket } from '../../context/SocketContext';

export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams();
    const { userInfo } = useContext(AuthContext);
    const cartContext = useContext<any>(CartContext);
    const socketContext = useSocket() as any;

    const { addToCart, cartCount, cart: cartData } = cartContext || {};
    const { joinCart, syncCartUpdate, activeCartId } = socketContext || {};

    const [restaurant, setRestaurant] = useState<any>(null);
    const [menu, setMenu] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [restRes, menuRes] = await Promise.all([
                api.get(`/restaurants/${id}`),
                api.get(`/menu/${id}`)
            ]);
            setRestaurant(restRes.data);
            setMenu(menuRes.data);
        } catch (error) {
            console.error('Error fetching restaurant data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (item: any) => {
        setAddingToCart(item._id);
        const result = await addToCart(item._id);
        if (result.success && activeCartId) {
            syncCartUpdate(activeCartId, result.cart);
        }
        setAddingToCart(null);
    };

    const toggleFavorite = async () => {
        if (!userInfo?._id) {
            Alert.alert("Login Required", "Please login to add favorites.");
            return;
        }
        try {
            await api.put(`/users/${userInfo._id}/favorites/${id}`);
            // Optimistically update if local state was used, or just refresh data
            // For now, simple refresh or alert suffices as the heart state itself isn't tracked in this local 'restaurant' object yet easily
            Alert.alert("Crave List Updated!", "This restaurant is now in your favorites.");
        } catch (error) {
            console.error('Toggle favorite error:', error);
        }
    };

    const startGroupOrder = () => {
        if (!cartData?._id) {
            Alert.alert("Empty Basket", "Add an item first to start a group order!");
            return;
        }
        joinCart(cartData._id);
        Alert.alert("Group Order Started!", "Share your session ID with friends to order together.");
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="light-content" />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View className="h-80 relative">
                    <Image
                        source={{ uri: restaurant?.image || "https://placehold.co/600x400?text=Restaurant" }}
                        className="w-full h-full"
                    />
                    <SafeAreaView className="absolute top-0 left-0 right-0">
                        <View className="flex-row justify-between items-center px-4 py-2">
                            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-md">
                                <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={toggleFavorite}
                                className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-md"
                            >
                                <Ionicons name="heart-outline" size={24} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                    <BlurView intensity={50} className="absolute bottom-0 left-0 right-0 p-4">
                        <Text className="text-white text-3xl font-black">{restaurant?.name}</Text>
                        <View className="flex-row items-center gap-2 mt-1">
                            <MaterialIcons name="star" size={18} color="#f59e0b" />
                            <Text className="text-white text-base font-semibold">{restaurant?.rating || '4.5'} ({restaurant?.reviewCount || '0'}+ reviews)</Text>
                        </View>
                    </BlurView>
                </View>

                {/* Content Section */}
                <View className="px-5 -mt-6 bg-[#f5f8f5] rounded-t-[32px] pt-8">
                    {/* Stats */}
                    <View className="flex-row justify-between bg-white p-6 rounded-[24px] shadow-sm mb-8 border border-gray-50">
                        <View className="items-center flex-1 border-r border-gray-100">
                            <View className="flex-row items-center gap-1 mb-1">
                                <MaterialIcons name="star" size={20} color="#f59e0b" />
                                <Text className="text-[#1A1D3B] font-black text-lg">{restaurant?.rating || '4.5'}</Text>
                            </View>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Ratings</Text>
                        </View>
                        <View className="items-center flex-1 border-r border-gray-100">
                            <View className="flex-row items-center gap-1 mb-1">
                                <Ionicons name="location-outline" size={18} color="#FF6B6B" />
                                <Text className="text-[#1A1D3B] font-black text-lg">{restaurant?.distance ? `${restaurant.distance}km` : '---'}</Text>
                            </View>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Distance</Text>
                        </View>
                        <View className="items-center flex-1">
                            <View className="flex-row items-center gap-1 mb-1">
                                <Ionicons name="wallet-outline" size={18} color="#FF6B6B" />
                                <Text className="text-[#1A1D3B] font-black text-lg">{restaurant?.deliveryFee === 0 || restaurant?.isFreeDelivery ? 'FREE' : `$${restaurant?.deliveryFee}`}</Text>
                            </View>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Delivery</Text>
                        </View>
                    </View>

                    {/* Menu Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-[#1A1D3B] text-2xl font-black">Menu Items</Text>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={startGroupOrder}
                                className={`flex-row items-center gap-2 px-4 h-10 rounded-xl border ${activeCartId ? 'bg-[#FF6B6B] border-[#FF6B6B]' : 'bg-white border-gray-100'}`}
                            >
                                <Ionicons name="people" size={18} color={activeCartId ? "white" : "#1A1D3B"} />
                                <Text className={`text-[10px] font-black uppercase tracking-widest ${activeCartId ? 'text-white' : 'text-[#1A1D3B]'}`}>
                                    {activeCartId ? 'Live' : 'Group'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="w-10 h-10 rounded-xl bg-white items-center justify-center border border-gray-100">
                                <Ionicons name="search-outline" size={20} color="#1A1D3B" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Menu List */}
                    <View className="gap-4 pb-32">
                        {menu.map((item) => (
                            <TouchableOpacity key={item._id} className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-50 flex-row gap-4">
                                <Image
                                    source={{ uri: item.image || "https://placehold.co/200x200?text=Food" }}
                                    className="w-24 h-24 rounded-2xl"
                                />
                                <View className="flex-1 justify-between py-1">
                                    <View>
                                        <Text className="text-[#1A1D3B] font-bold text-lg mb-1">{item.name}</Text>
                                        <Text className="text-gray-400 text-xs font-medium" numberOfLines={2}>{item.description}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-[#FF6B6B] text-xl font-black">${item.price}</Text>
                                        <TouchableOpacity
                                            onPress={() => handleAddToCart(item)}
                                            disabled={addingToCart === item._id}
                                            className="w-10 h-10 bg-[#1A1D3B] rounded-xl items-center justify-center shadow-lg"
                                        >
                                            {addingToCart === item._id ? (
                                                <ActivityIndicator size="small" color="#FF6B6B" />
                                            ) : (
                                                <Ionicons name="add" size={24} color="white" />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Floating Cart (Link to Cart) */}
            {cartCount > 0 && (
                <View className="absolute bottom-10 left-6 right-6 z-50">
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => router.push('/(tabs)/cart')}
                        className="rounded-[28px] overflow-hidden shadow-2xl bg-[#1A1D3B] border border-white/10"
                    >
                        <BlurView intensity={20} tint="dark" style={{ padding: 12, paddingLeft: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View className="flex-row items-center gap-4">
                                <View className="relative">
                                    <View className="w-12 h-12 bg-[#FF6B6B] rounded-2xl items-center justify-center">
                                        <MaterialIcons name="shopping-bag" size={24} color="#1A1D3B" />
                                    </View>
                                    <View className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center border-2 border-[#1A1D3B]">
                                        <Text className="text-[10px] text-white font-black">{cartCount}</Text>
                                    </View>
                                </View>
                                <View>
                                    <Text className="text-[#FF6B6B] text-[10px] font-black uppercase tracking-[3px]">Your Basket</Text>
                                    <Text className="font-black text-lg text-white">${cartData?.totalAmount.toFixed(2)}</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center gap-2 pr-2">
                                <Text className="text-white font-black uppercase tracking-widest text-[10px]">View Cart</Text>
                                <View className="w-8 h-8 bg-white/10 rounded-xl items-center justify-center">
                                    <MaterialIcons name="arrow-forward" size={18} color="#FF6B6B" />
                                </View>
                            </View>
                        </BlurView>
                    </TouchableOpacity>
                </View>
            )}
        </View >
    );
}

const styles = StyleSheet.create({
    absoluteFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    }
});
