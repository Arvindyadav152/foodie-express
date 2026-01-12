import { View, Text, ScrollView, TextInput, Image, TouchableOpacity, RefreshControl, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState, useEffect, useContext } from 'react';
import { router } from 'expo-router';
import RestaurantCard from '../../components/RestaurantCard';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const categories = [
    { id: '1', name: 'All', icon: 'apps' },
    { id: '2', name: 'Pizza', icon: 'local-pizza' },
    { id: '3', name: 'Burger', icon: 'lunch-dining' },
    { id: '4', name: 'Sushi', icon: 'set-meal' },
    { id: '5', name: 'Healthy', icon: 'eco' },
    { id: '6', name: 'Fast Food', icon: 'fastfood' },
];

import { HomeSkeleton } from '../../components/SkeletonLoader';

import * as Location from 'expo-location';

export default function HomeScreen() {
    const { userInfo } = useContext(AuthContext);
    const [restaurants, setRestaurants] = useState([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [flashDeals, setFlashDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [location, setLocation] = useState<any>(null);
    const [address, setAddress] = useState('Detecting location...');
    const [trends, setTrends] = useState([]);
    const [countdown, setCountdown] = useState('');

    const fetchRestaurants = async (lat?: number, lng?: number, category?: string) => {
        setLoading(true);
        try {
            let url = '/restaurants?';
            if (lat && lng) url += `lat=${lat}&lng=${lng}&`;
            if (category && category !== 'All') url += `category=${category}`;

            const { data } = await api.get(url);
            setRestaurants(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchTrends = async () => {
        try {
            const { data } = await api.get('/orders/trends');
            setTrends(data);
        } catch (error) {
            console.error(error);
        }
    };

    const getMyLocation = async () => {
        setLoadingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setAddress('Location Access Denied');
                fetchRestaurants();
                return;
            }

            let loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced
            });
            setLocation(loc);

            try {
                const { data } = await api.get(`/restaurants/reverse-geocode?lat=${loc.coords.latitude}&lng=${loc.coords.longitude}`);
                if (data && data.short) {
                    setAddress(data.short);
                }
            } catch (err) {
                let rev = await Location.reverseGeocodeAsync({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude
                });
                if (rev.length > 0) setAddress(`${rev[0].name || rev[0].street}, ${rev[0].city}`);
            }

            fetchRestaurants(loc.coords.latitude, loc.coords.longitude, activeCategory);
        } catch (error) {
            console.error('Error getting location:', error);
            setAddress('Location Unavailable');
            fetchRestaurants();
        } finally {
            setLoadingLocation(false);
        }
    };

    const fetchBanners = async () => {
        try {
            const { data } = await api.get('/banners');
            setBanners(data);
        } catch (err) {
            console.error('Error fetching banners:', err);
        }
    };

    const fetchFlashDeals = async () => {
        try {
            const { data } = await api.get('/flash-deals/active');
            setFlashDeals(data);
        } catch (err) {
            console.error('Error fetching flash deals:', err);
        }
    };

    // Countdown timer for flash deal
    useEffect(() => {
        if (flashDeals.length === 0) return;
        const deal = flashDeals[0];
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(deal.endTime).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setCountdown('EXPIRED');
                clearInterval(interval);
                fetchFlashDeals(); // Refresh to get next deal
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [flashDeals]);

    useEffect(() => {
        getMyLocation();
        fetchTrends();
        fetchBanners();
        fetchFlashDeals();
    }, []);

    useEffect(() => {
        if (location) {
            fetchRestaurants(location.coords.latitude, location.coords.longitude, activeCategory);
        } else {
            fetchRestaurants(undefined, undefined, activeCategory);
        }
    }, [activeCategory]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchRestaurants(location?.coords?.latitude, location?.coords?.longitude, activeCategory),
            fetchTrends(),
            fetchBanners()
        ]);
        setRefreshing(false);
    }, [location, activeCategory]);

    if (loading && !refreshing) {
        return (
            <View className="flex-1 bg-[#f5f8f5]">
                <SafeAreaView edges={['top']} />
                <HomeSkeleton />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView edges={['top']} className="bg-white/80 z-50">
                <View className="px-5 py-3 flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => setAddressModalVisible(true)}
                        className="flex-row items-center gap-3 bg-white p-1 pr-4 rounded-3xl border border-gray-50 shadow-sm"
                    >
                        <View className="w-10 h-10 rounded-2xl bg-[#FF6B6B] items-center justify-center shadow-lg shadow-[#FF6B6B]/40">
                            <Ionicons name="location" size={20} color="white" />
                        </View>
                        <View>
                            <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-0.5">Deliver to</Text>
                            <View className="flex-row items-center gap-1">
                                <Text className="text-[#1A1D3B] text-[14px] font-black w-[160px]" numberOfLines={1}>
                                    {loadingLocation ? "Locating..." : address}
                                </Text>
                                {loadingLocation ? (
                                    <ActivityIndicator size="small" color="#FF6B6B" />
                                ) : (
                                    <MaterialIcons name="keyboard-arrow-down" size={16} color="#1A1D3B" />
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/profile')}
                        className="flex-row items-center gap-2 bg-white pl-2 pr-3 py-1.5 rounded-full border border-gray-100 shadow-sm"
                    >
                        <Image
                            source={{ uri: userInfo?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo?.fullName || 'User')}&background=0df20d&color=fff&bold=true&size=64` }}
                            className="w-8 h-8 rounded-full"
                        />
                        <Text className="text-[#1A1D3B] text-xs font-black uppercase tracking-tight" numberOfLines={1}>
                            {userInfo?.fullName?.split(' ')[0] || 'Guest'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View className="px-5 pb-4">
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/search')}
                        className="h-14 bg-gray-50 rounded-2xl flex-row items-center px-4 border border-gray-100 shadow-sm"
                    >
                        <Ionicons name="search-outline" size={22} color="#9ca3af" />
                        <Text className="text-gray-400 ml-3 text-sm font-medium">Search for burgers, pizza, sushi...</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Flash Deal Banner */}
                {flashDeals.length > 0 && countdown !== 'EXPIRED' && (
                    <View className="px-5 mb-6">
                        <TouchableOpacity
                            className="overflow-hidden rounded-[32px] shadow-xl"
                            activeOpacity={0.9}
                        >
                            <View className="bg-[#1A1D3B] p-6 relative">
                                <View className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B6B]/10 rounded-full -translate-y-10 translate-x-10" />
                                <View className="absolute bottom-0 left-0 w-20 h-20 bg-[#FF6B6B]/5 rounded-full translate-y-10 -translate-x-10" />

                                <View className="flex-row items-center gap-2 mb-3">
                                    <MaterialIcons name="flash-on" size={20} color="#FF6B6B" />
                                    <Text className="text-[#FF6B6B] text-[10px] font-black uppercase tracking-[3px]">Flash Deal • Ends in</Text>
                                    <View className="bg-[#FF6B6B] px-3 py-1.5 rounded-lg ml-auto">
                                        <Text className="text-[#1A1D3B] text-xs font-black tracking-tight">{countdown}</Text>
                                    </View>
                                </View>

                                <Text className="text-white text-2xl font-black uppercase tracking-tighter mb-1">
                                    {flashDeals[0].discountPercent}% OFF
                                </Text>
                                <Text className="text-white/70 text-sm font-medium">
                                    {flashDeals[0].title}
                                </Text>

                                <View className="flex-row items-center mt-4">
                                    <Text className="text-[#FF6B6B] text-[10px] font-black uppercase tracking-widest">Grab Now →</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                <View className="mt-2 mb-6">
                    <View className="px-5 flex-row items-center gap-2 mb-4">
                        <View className="w-2 h-2 rounded-full bg-red-500" />
                        <Text className="text-[#1A1D3B] text-xs font-black uppercase tracking-[3px]">Live Neighborhood Buzz</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                        {trends.length > 0 ? trends.map((trend: any, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => router.push(`/(tabs)/search?q=${trend.dish}`)}
                                className="bg-white px-5 py-4 rounded-[28px] border border-gray-100 shadow-sm flex-row items-center gap-4"
                            >
                                <View className="w-12 h-12 rounded-3xl bg-[#FF6B6B] items-center justify-center">
                                    <Ionicons name="water" size={24} color="white" />
                                </View>
                                <View>
                                    <Text className="text-[#1A1D3B] font-black text-xs uppercase tracking-tighter">{trend.dish}</Text>
                                    <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Ordering Nearby Now</Text>
                                </View>
                                <View className="bg-gray-50 px-3 py-1.5 rounded-full ml-2">
                                    <Text className="text-[#FF6B6B] text-xs font-black">+{trend.count}</Text>
                                </View>
                            </TouchableOpacity>
                        )) : (
                            ['Spicy Ramen', 'Cheese Pizza', 'Sushi Roll'].map((item, idx) => (
                                <View key={idx} className="bg-white px-5 py-4 rounded-[28px] border border-gray-100 opacity-40 flex-row items-center gap-4">
                                    <Text className="text-gray-400 font-bold text-[10px] uppercase">{item}</Text>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>
                {/* Hero Promotion */}
                <View className="px-5 py-4">
                    {banners.length > 0 ? (
                        <View style={{ backgroundColor: banners[0].bgColor }} className="rounded-[44px] p-8 relative overflow-hidden shadow-2xl border border-white/10">
                            <View className="z-10">
                                <Text style={{ color: banners[0].textColor }} className="font-black text-[10px] uppercase tracking-[4px] mb-3">{banners[0].title}</Text>
                                <Text className="text-white text-4xl font-black mb-1 italic tracking-tighter">{banners[0].offerText}</Text>
                                <Text className="text-gray-400 text-xs font-bold mb-6 tracking-wide uppercase opacity-70">{banners[0].subtitle}</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        if (banners[0].actionType === 'search') {
                                            router.push(`/(tabs)/search?q=${banners[0].actionValue}`);
                                        } else if (banners[0].actionType === 'category') {
                                            setActiveCategory(banners[0].actionValue);
                                        }
                                    }}
                                    style={{ backgroundColor: banners[0].textColor }}
                                    className="self-start px-8 py-3.5 rounded-2xl shadow-lg"
                                >
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-[#1A1D3B] font-black text-sm uppercase tracking-wider">Grab Now</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={{ backgroundColor: banners[0].textColor }} className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" />
                            <View style={{ backgroundColor: banners[0].textColor }} className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-5" />
                            <View className="absolute top-10 right-10 opacity-20 transform rotate-12">
                                <Ionicons name="flash" size={80} color="white" />
                            </View>
                        </View>
                    ) : (
                        <View className="bg-[#1A1D3B] rounded-[44px] p-8 relative overflow-hidden shadow-2xl border border-white/10 h-[220px] items-center justify-center">
                            <ActivityIndicator color="#FF6B6B" />
                        </View>
                    )}
                </View>

                {/* Categories */}
                <View className="mb-6">
                    <View className="px-5 flex-row justify-between items-center mb-4">
                        <Text className="text-[#1A1D3B] text-xl font-black">Categories</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
                            <Text className="text-[#FF6B6B] font-bold text-sm">See All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                onPress={() => setActiveCategory(cat.name)}
                                className={`items-center justify-center px-5 py-3 rounded-2xl border ${activeCategory === cat.name ? 'bg-[#FF6B6B] border-[#FF6B6B] shadow-lg shadow-[#FF6B6B]/40' : 'bg-white border-gray-100 shadow-sm'}`}
                            >
                                <MaterialIcons
                                    name={cat.icon as any}
                                    size={24}
                                    color={activeCategory === cat.name ? 'white' : '#FF6B6B'}
                                />
                                <Text className={`mt-1 text-[10px] font-black uppercase tracking-wider ${activeCategory === cat.name ? 'text-white' : 'text-gray-500'}`}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Featured Restaurants */}
                <View className="px-5 mb-4 flex-row justify-between items-center">
                    <Text className="text-[#1A1D3B] text-xl font-black">Popular Nearby</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/search')}
                        className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center border border-gray-100"
                    >
                        <Ionicons name="options-outline" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                </View>

                <View className="px-5 gap-8">
                    {loading ? (
                        <View className="py-20">
                            <ActivityIndicator size="large" color="#FF6B6B" />
                        </View>
                    ) : (
                        restaurants.length > 0 ? (
                            restaurants.map((restaurant: any) => (
                                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                            ))
                        ) : (
                            <View className="items-center py-20 bg-white/50 rounded-[40px] border border-gray-50 mt-4 mx-2">
                                <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                                    <Ionicons name="restaurant-outline" size={32} color="#9ca3af" />
                                </View>
                                <Text className="text-[#1A1D3B] text-lg font-black uppercase tracking-tighter">Quiet in the Kitchen</Text>
                                <Text className="text-gray-400 text-center mt-1 px-10 font-medium text-xs">We couldn't find any {activeCategory !== 'All' ? activeCategory : ''} spots nearby. Try another craving!</Text>
                            </View>
                        )
                    )}
                </View>
            </ScrollView>
            {/* Address Details Modal */}
            {addressModalVisible && (
                <View className="absolute inset-0 z-[100] items-center justify-center p-6">
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setAddressModalVisible(false)}
                        className="absolute inset-0 bg-[#1A1D3B]/60"
                    />
                    <View className="bg-white w-full rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                        <View className="flex-row items-center gap-3 mb-6">
                            <View className="w-12 h-12 rounded-2xl bg-[#FF6B6B]/10 items-center justify-center">
                                <Ionicons name="location" size={24} color="#FF6B6B" />
                            </View>
                            <View>
                                <Text className="text-[#1A1D3B] text-xl font-black uppercase tracking-tighter">Current Location</Text>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Global GPS Precision</Text>
                            </View>
                        </View>

                        <View className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 mb-8">
                            <Text className="text-[#1A1D3B] text-sm font-medium leading-6">{address}</Text>
                        </View>

                        <View className="gap-3">
                            <TouchableOpacity
                                onPress={() => {
                                    setAddressModalVisible(false);
                                    getMyLocation();
                                }}
                                className="bg-[#1A1D3B] py-4 rounded-2xl items-center shadow-lg"
                            >
                                <Text className="text-white font-black text-sm uppercase tracking-widest">Recalibrate Location</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setAddressModalVisible(false)}
                                className="py-4 rounded-2xl items-center"
                            >
                                <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Close Discovery</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Decoration */}
                        <View className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FF6B6B] rounded-full opacity-5" />
                    </View>
                </View>
            )}
        </View>
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
