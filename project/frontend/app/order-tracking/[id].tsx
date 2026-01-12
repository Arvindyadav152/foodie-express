import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Switch, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
// Platform-specific MapView import (uses .web.js or .native.js automatically)
import MapViewComponent, { Marker, Polyline, PROVIDER_GOOGLE } from '../../utils/MapView';

const MapView = MapViewComponent;

const { width, height } = Dimensions.get('window');

// Voice Messages
const voiceMessages: { [key: string]: string } = {
    'confirmed': 'Aapka order confirm ho gaya hai!',
    'preparing': 'Aapka khana ban raha hai.',
    'out_for_delivery': 'Delivery partner aapke paas aa raha hai!',
    'delivered': 'Order deliver ho gaya! Enjoy!'
};

export default function OrderTrackingScreen() {
    const { id } = useLocalSearchParams();
    const { socket, trackOrder } = useSocket();
    const mapRef = useRef<any>(null);

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [driverLocation, setDriverLocation] = useState<any>(null);
    const lastSpokenStatus = useRef<string | null>(null);

    // Customer location (mock - in real app use user's saved address coordinates)
    const customerLocation = {
        latitude: 28.6200,
        longitude: 77.2100,
    };

    useEffect(() => {
        fetchOrder();
        trackOrder(id as string);

        // Listen for driver location updates
        if (socket) {
            (socket as any).on('driver:location', (data: any) => {
                if (data.orderId === id) {
                    setDriverLocation(data.location);
                }
            });

            (socket as any).on('order:status_changed', (data: any) => {
                if (data.orderId === id) {
                    fetchOrder();
                }
            });

            (socket as any).on('driver:assigned', (data: any) => {
                if (data.orderId === id) {
                    fetchOrder();
                }
            });
        }

        const interval = setInterval(fetchOrder, 15000);
        return () => {
            clearInterval(interval);
            (socket as any)?.off('driver:location');
            (socket as any)?.off('order:status_changed');
            (socket as any)?.off('driver:assigned');
        };
    }, [id, socket]);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/orders/${id}`);
            setOrder(data);
            if (data?.status && voiceEnabled && lastSpokenStatus.current !== data.status) {
                speakStatus(data.status);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const speakStatus = (status: string) => {
        const message = voiceMessages[status];
        if (message) {
            lastSpokenStatus.current = status;
            Speech.speak(message, { language: 'hi-IN', rate: 0.9 });
        }
    };

    const callDriver = () => {
        if (order?.driverId?.phone) {
            Linking.openURL(`tel:${order.driverId.phone}`);
        }
    };

    const getStatusStep = () => {
        const statusMap: { [key: string]: number } = {
            'confirmed': 0, 'preparing': 1, 'out_for_delivery': 2, 'delivered': 3
        };
        return statusMap[order?.status] ?? 0;
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#1A1D3B]">
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    const currentStep = getStatusStep();
    const isOutForDelivery = order?.status === 'out_for_delivery';
    const restaurantLocation = {
        latitude: order?.restaurantId?.location?.coordinates?.[1] || 28.6139,
        longitude: order?.restaurantId?.location?.coordinates?.[0] || 77.2090,
    };

    // Render map or web fallback
    const renderMap = () => {
        if (Platform.OS === 'web' || !MapView) {
            return (
                <View className="flex-1 bg-gray-800 items-center justify-center">
                    <MaterialIcons name="map" size={60} color="#4B5563" />
                    <Text className="text-gray-400 font-bold mt-4">Live tracking on mobile app</Text>
                    <View className="mt-4 bg-white/10 px-4 py-2 rounded-xl">
                        <Text className="text-[#FF6B6B] font-bold">Status: {order?.status?.replace('_', ' ')}</Text>
                    </View>
                </View>
            );
        }

        return (
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: customerLocation.latitude,
                    longitude: customerLocation.longitude,
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                }}
                customMapStyle={mapStyle}
            >
                {/* Customer Location */}
                <Marker coordinate={customerLocation}>
                    <View className="bg-[#4ECDC4] p-2 rounded-full">
                        <Ionicons name="home" size={18} color="white" />
                    </View>
                </Marker>

                {/* Restaurant Location */}
                <Marker coordinate={restaurantLocation}>
                    <View className="bg-[#FF6B6B] p-2 rounded-full">
                        <Ionicons name="restaurant" size={18} color="white" />
                    </View>
                </Marker>

                {/* Driver Location (if out for delivery) */}
                {isOutForDelivery && driverLocation && (
                    <Marker coordinate={driverLocation}>
                        <View className="bg-[#1A1D3B] p-2 rounded-full border-2 border-white">
                            <MaterialIcons name="delivery-dining" size={22} color="#FF6B6B" />
                        </View>
                    </Marker>
                )}

                {/* Route Line */}
                {isOutForDelivery && driverLocation && (
                    <Polyline
                        coordinates={[driverLocation, customerLocation]}
                        strokeColor="#FF6B6B"
                        strokeWidth={3}
                        lineDashPattern={[1]}
                    />
                )}
            </MapView>
        );
    };

    return (
        <View className="flex-1 bg-[#1A1D3B]">
            {/* Map Section */}
            <View style={{ height: height * 0.45 }}>
                {renderMap()}

                {/* Back Button */}
                <SafeAreaView className="absolute top-0 left-0 right-0 p-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white rounded-xl items-center justify-center shadow-lg"
                    >
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                </SafeAreaView>

                {/* ETA Badge */}
                <View className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-lg p-4 rounded-2xl flex-row items-center justify-between">
                    <View>
                        <Text className="text-gray-400 text-xs font-bold">Estimated Arrival</Text>
                        <Text className="text-[#1A1D3B] text-2xl font-black">15-20 MIN</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="volume-high" size={18} color={voiceEnabled ? '#FF6B6B' : '#ccc'} />
                        <Switch
                            value={voiceEnabled}
                            onValueChange={setVoiceEnabled}
                            trackColor={{ true: '#FF6B6B', false: '#e5e7eb' }}
                            thumbColor="white"
                        />
                    </View>
                </View>
            </View>

            {/* Bottom Sheet */}
            <View className="flex-1 bg-white rounded-t-[32px] -mt-6 p-6">
                {/* Status Steps */}
                <View className="flex-row items-center justify-between mb-6">
                    {['Confirmed', 'Preparing', 'On Way', 'Delivered'].map((label, idx) => (
                        <View key={idx} className="items-center flex-1">
                            <View className={`w-10 h-10 rounded-full items-center justify-center ${idx <= currentStep ? 'bg-[#FF6B6B]' : 'bg-gray-100'}`}>
                                <MaterialIcons
                                    name={idx === 0 ? 'receipt' : idx === 1 ? 'restaurant' : idx === 2 ? 'delivery-dining' : 'check'}
                                    size={18}
                                    color={idx <= currentStep ? 'white' : '#ccc'}
                                />
                            </View>
                            <Text className={`text-[9px] font-bold mt-1 ${idx <= currentStep ? 'text-[#1A1D3B]' : 'text-gray-300'}`}>
                                {label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Progress Line */}
                <View className="h-1 bg-gray-100 rounded-full mx-5 -mt-10 mb-6">
                    <View className="h-full bg-[#FF6B6B] rounded-full" style={{ width: `${(currentStep / 3) * 100}%` }} />
                </View>

                {/* Driver Card */}
                {order?.driverId && isOutForDelivery && (
                    <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center gap-4 mb-4">
                        <View className="w-14 h-14 bg-[#1A1D3B] rounded-2xl items-center justify-center">
                            <Text className="text-white text-lg font-black">
                                {order.driverId.fullName?.charAt(0) || 'D'}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="font-black text-[#1A1D3B] text-base">{order.driverId.fullName || 'Delivery Partner'}</Text>
                            <Text className="text-gray-400 text-xs font-bold">On the way to you</Text>
                        </View>
                        <TouchableOpacity onPress={callDriver} className="w-12 h-12 bg-[#4ECDC4] rounded-xl items-center justify-center">
                            <Ionicons name="call" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Restaurant Info */}
                <View className="border-t border-gray-100 pt-4">
                    <Text className="text-gray-400 text-xs font-bold uppercase mb-2">From</Text>
                    <Text className="text-[#1A1D3B] font-bold">{order?.restaurantId?.name || 'Restaurant'}</Text>
                </View>

                {/* Order Summary */}
                <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
                    <View className="flex-row items-center justify-between border-t border-gray-100 pt-4">
                        <Text className="text-gray-500">Order #{id?.toString().slice(-6).toUpperCase()}</Text>
                        <Text className="text-[#FF6B6B] font-black text-lg">₹{order?.totalAmount?.toFixed(0)}</Text>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

// Dark map style for premium look
const mapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
];
