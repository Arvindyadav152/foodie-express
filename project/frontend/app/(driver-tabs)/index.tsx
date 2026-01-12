import { View, Text, FlatList, TouchableOpacity, Image, Alert, RefreshControl, ActivityIndicator, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import api from '../../utils/api';

export default function DriverHomeScreen() {
    const { userInfo } = useContext(AuthContext);
    const { joinAsDriver, broadcastDriverLocation, socket } = useSocket();
    const driverId = userInfo?._id || userInfo?.driverId;
    const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [isOnline, setIsOnline] = useState(true);
    const [stats, setStats] = useState({
        todayEarnings: 0,
        todayTrips: 0,
        rating: 5.0,
        weeklyEarnings: 0,
    });
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        setupLocation();

        if (driverId) {
            joinAsDriver(driverId);
        }

        return () => {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
            }
        };
    }, [driverId]);

    const fetchStats = async () => {
        try {
            // Fetch real driver stats
            const { data } = await api.get(`/driver/stats/${driverId}`);
            setStats({
                todayEarnings: data.todayEarnings || userInfo?.driverStats?.totalEarnings || 0,
                todayTrips: data.todayTrips || userInfo?.driverStats?.completedTrips || 0,
                rating: data.rating || userInfo?.driverStats?.rating || 5.0,
                weeklyEarnings: data.weeklyEarnings || 0,
            });
        } catch (error) {
            // Use cached stats from userInfo
            setStats({
                todayEarnings: userInfo?.driverStats?.totalEarnings || 0,
                todayTrips: userInfo?.driverStats?.completedTrips || 0,
                rating: userInfo?.driverStats?.rating || 5.0,
                weeklyEarnings: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const setupLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                setCurrentLocation({
                    lat: location.coords.latitude,
                    lng: location.coords.longitude,
                });

                // Broadcast location every 30 seconds when online
                locationIntervalRef.current = setInterval(async () => {
                    if (isOnline) {
                        const loc = await Location.getCurrentPositionAsync({});
                        setCurrentLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
                    }
                }, 30000);
            }
        } catch (error) {
            console.error('Location error:', error);
        }
    };

    const toggleOnline = () => {
        setIsOnline(!isOnline);
        Alert.alert(
            isOnline ? 'Going Offline' : 'Going Online',
            isOnline ? 'You will not receive new orders' : 'You are now available for orders'
        );
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#1A1D3B]">
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#1A1D3B]">
            <StatusBar barStyle="light-content" />

            <SafeAreaView edges={['top']} className="flex-1">
                {/* Header */}
                <View className="px-5 py-4 flex-row items-center justify-between">
                    <View>
                        <Text className="text-white/60 text-xs font-bold">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}</Text>
                        <Text className="text-white text-2xl font-black">{userInfo?.fullName?.split(' ')[0] || 'Driver'}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={toggleOnline}
                        className={`px-4 py-2 rounded-full flex-row items-center gap-2 ${isOnline ? 'bg-[#FF6B6B]' : 'bg-gray-600'}`}
                    >
                        <View className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#1A1D3B]' : 'bg-gray-400'}`} />
                        <Text className={`font-bold text-sm ${isOnline ? 'text-[#1A1D3B]' : 'text-white'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Main Stats Card */}
                <View className="mx-5 mt-4 bg-[#FF6B6B] rounded-[32px] p-6 relative overflow-hidden">
                    <Text className="text-[#1A1D3B]/60 text-xs font-bold uppercase tracking-widest">Today's Earnings</Text>
                    <Text className="text-[#1A1D3B] text-5xl font-black mt-2">₹{stats.todayEarnings.toLocaleString()}</Text>

                    <View className="flex-row mt-4 gap-6">
                        <View>
                            <Text className="text-[#1A1D3B]/60 text-xs font-bold">Trips</Text>
                            <Text className="text-[#1A1D3B] text-xl font-black">{stats.todayTrips}</Text>
                        </View>
                        <View>
                            <Text className="text-[#1A1D3B]/60 text-xs font-bold">Rating</Text>
                            <View className="flex-row items-center gap-1">
                                <Text className="text-[#1A1D3B] text-xl font-black">{stats.rating.toFixed(1)}</Text>
                                <Ionicons name="star" size={16} color="#1A1D3B" />
                            </View>
                        </View>
                    </View>

                    {/* Decorative */}
                    <View className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full" />
                    <View className="absolute right-16 -bottom-4 w-16 h-16 bg-white/10 rounded-full" />
                </View>

                {/* Quick Actions */}
                <View className="flex-row mx-5 mt-6 gap-3">
                    <TouchableOpacity
                        onPress={() => router.push('/(driver-tabs)/orders')}
                        className="flex-1 bg-white/10 p-5 rounded-2xl items-center"
                    >
                        <View className="w-12 h-12 bg-[#FF6B6B]/20 rounded-xl items-center justify-center mb-2">
                            <MaterialIcons name="pending-actions" size={24} color="#FF6B6B" />
                        </View>
                        <Text className="text-white font-bold">New Orders</Text>
                        <Text className="text-[#FF6B6B] text-xs font-bold mt-1">Check Available</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/(driver-tabs)/earnings')}
                        className="flex-1 bg-white/10 p-5 rounded-2xl items-center"
                    >
                        <View className="w-12 h-12 bg-blue-500/20 rounded-xl items-center justify-center mb-2">
                            <MaterialIcons name="account-balance-wallet" size={24} color="#3b82f6" />
                        </View>
                        <Text className="text-white font-bold">Withdraw</Text>
                        <Text className="text-blue-400 text-xs font-bold mt-1">₹{stats.weeklyEarnings}</Text>
                    </TouchableOpacity>
                </View>

                {/* Location Status */}
                <View className="mx-5 mt-6 bg-white/5 p-5 rounded-2xl flex-row items-center gap-4">
                    <View className="w-12 h-12 bg-[#FF6B6B]/10 rounded-xl items-center justify-center">
                        <Ionicons name="location" size={24} color="#FF6B6B" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-bold">Location Tracking</Text>
                        <Text className="text-white/40 text-xs">
                            {currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Fetching location...'}
                        </Text>
                    </View>
                    <View className={`w-3 h-3 rounded-full ${isOnline ? 'bg-[#FF6B6B]' : 'bg-gray-500'}`} />
                </View>

                {/* Tips Section */}
                <View className="mx-5 mt-6 mb-24">
                    <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Quick Tips</Text>
                    <View className="bg-white/5 p-4 rounded-2xl">
                        <View className="flex-row items-center gap-3">
                            <Text className="text-2xl">💡</Text>
                            <Text className="text-white/70 text-sm flex-1">
                                Stay online during peak hours (12-2 PM, 7-10 PM) to earn more!
                            </Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}
