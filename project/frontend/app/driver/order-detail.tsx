import { View, Text, TouchableOpacity, ActivityIndicator, Linking, Alert, Platform, StatusBar, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useContext, useRef } from 'react';
import * as Location from 'expo-location';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
// Platform-specific MapView import
import MapViewComponent, { Marker, Polyline, PROVIDER_GOOGLE } from '../../utils/MapView';

const MapView = MapViewComponent;

const { width, height } = Dimensions.get('window');

export default function DriverOrderDetailScreen() {
    const params = useLocalSearchParams();
    const id = params.id || params.orderId;
    const { userInfo } = useContext(AuthContext);
    const { socket } = useSocket();
    const mapRef = useRef<any>(null);

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [driverLocation, setDriverLocation] = useState<any>(null);
    const [watchId, setWatchId] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetchOrder();
        }
        if (Platform.OS !== 'web') {
            startLocationTracking();
        }

        return () => {
            if (watchId) {
                watchId.remove();
            }
        };
    }, [id]);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/orders/${id}`);
            setOrder(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const startLocationTracking = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Location permission is required for navigation');
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setDriverLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });

        // Watch location changes
        const subscription = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 10 },
            (location) => {
                const newLocation = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                };
                setDriverLocation(newLocation);

                // Emit location to socket for customer tracking
                if (socket && order?._id) {
                    (socket as any).emit('driver:location', {
                        orderId: order._id,
                        driverId: userInfo?._id,
                        location: newLocation,
                    });
                }
            }
        );
        setWatchId(subscription);
    };

    const getDestination = () => {
        if (order?.status === 'preparing') {
            // Going to restaurant
            return {
                latitude: order?.restaurantId?.location?.coordinates?.[1] || 28.6139,
                longitude: order?.restaurantId?.location?.coordinates?.[0] || 77.2090,
                title: order?.restaurantId?.name || 'Restaurant',
                type: 'restaurant'
            };
        } else {
            // Going to customer
            return {
                latitude: order?.deliveryAddress?.coordinates?.lat || 28.6200,
                longitude: order?.deliveryAddress?.coordinates?.lng || 77.2100,
                title: order?.userId?.fullName || 'Customer',
                type: 'customer'
            };
        }
    };

    const openGoogleMaps = () => {
        const dest = getDestination();
        const url = Platform.select({
            ios: `maps://app?daddr=${dest.latitude},${dest.longitude}`,
            android: `google.navigation:q=${dest.latitude},${dest.longitude}`,
            web: `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}`
        });
        Linking.openURL(url as string);
    };

    const updateOrderStatus = async (status: string) => {
        setUpdating(true);
        try {
            if (status === 'out_for_delivery') {
                await api.put(`/driver/pickup/${id}`, { driverId: userInfo?._id });
            } else if (status === 'delivered') {
                // TODO: Add OTP verification
                await api.put(`/driver/status/${id}`, { driverId: userInfo?._id, status: 'delivered' });
            }
            await fetchOrder();
            if (status === 'delivered') {
                Alert.alert('✅ Delivered!', 'Order completed successfully!');
                router.back();
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#1A1D3B]">
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    const destination = getDestination();
    const isPickup = order?.status === 'preparing';

    // Web fallback for map
    const renderMap = () => {
        if (Platform.OS === 'web' || !MapView) {
            return (
                <View className="flex-1 bg-gray-800 items-center justify-center">
                    <MaterialIcons name="map" size={80} color="#4B5563" />
                    <Text className="text-gray-400 font-bold mt-4">Map available on mobile app</Text>
                    <TouchableOpacity
                        onPress={openGoogleMaps}
                        className="mt-4 bg-[#4ECDC4] px-6 py-3 rounded-xl flex-row items-center gap-2"
                    >
                        <MaterialIcons name="navigation" size={20} color="white" />
                        <Text className="text-white font-bold">Open in Google Maps</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: driverLocation?.latitude || 28.6139,
                    longitude: driverLocation?.longitude || 77.2090,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }}
                showsUserLocation={false}
                showsMyLocationButton={false}
            >
                {/* Driver Marker */}
                {driverLocation && (
                    <Marker coordinate={driverLocation}>
                        <View className="bg-[#1A1D3B] p-2 rounded-full">
                            <MaterialIcons name="delivery-dining" size={24} color="#FF6B6B" />
                        </View>
                    </Marker>
                )}

                {/* Destination Marker */}
                <Marker
                    coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
                >
                    <View className={`p-2 rounded-full ${isPickup ? 'bg-[#FF6B6B]' : 'bg-[#4ECDC4]'}`}>
                        <Ionicons
                            name={isPickup ? 'restaurant' : 'home'}
                            size={20}
                            color="white"
                        />
                    </View>
                </Marker>

                {/* Route Line */}
                {driverLocation && (
                    <Polyline
                        coordinates={[
                            driverLocation,
                            { latitude: destination.latitude, longitude: destination.longitude }
                        ]}
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
            <StatusBar barStyle="light-content" />

            {/* Map View */}
            <View className="flex-1">
                {renderMap()}

                {/* Back Button */}
                <SafeAreaView className="absolute top-0 left-0 right-0">
                    <TouchableOpacity
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(driver-tabs)/')}
                        className="ml-4 mt-2 w-12 h-12 bg-white rounded-xl items-center justify-center shadow-lg"
                    >
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                </SafeAreaView>

                {/* Navigate Button */}
                <TouchableOpacity
                    onPress={openGoogleMaps}
                    className="absolute right-4 top-20 bg-white p-3 rounded-xl shadow-lg"
                >
                    <MaterialIcons name="navigation" size={24} color="#4ECDC4" />
                </TouchableOpacity>
            </View>

            {/* Bottom Card */}
            <View className="bg-white rounded-t-[32px] p-6 pb-10">
                {/* Order Info */}
                <View className="flex-row items-center gap-4 mb-4">
                    <View className={`w-14 h-14 rounded-2xl items-center justify-center ${isPickup ? 'bg-[#FF6B6B]/10' : 'bg-[#4ECDC4]/10'}`}>
                        <Ionicons
                            name={isPickup ? 'restaurant' : 'home'}
                            size={24}
                            color={isPickup ? '#FF6B6B' : '#4ECDC4'}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-gray-400 uppercase">
                            {isPickup ? 'Pickup From' : 'Deliver To'}
                        </Text>
                        <Text className="text-lg font-black text-[#1A1D3B]">{destination.title}</Text>
                        <Text className="text-sm text-gray-500" numberOfLines={1}>
                            {isPickup
                                ? order?.restaurantId?.address?.street || (typeof order?.restaurantId?.address === 'string' ? order?.restaurantId?.address : 'Restaurant Address')
                                : `${order?.deliveryAddress?.street || ''}, ${order?.deliveryAddress?.city || ''}`
                            }
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => Linking.openURL(`tel:${isPickup ? order?.restaurantId?.phone : order?.userId?.phone}`)}
                        className="w-12 h-12 bg-[#4ECDC4] rounded-xl items-center justify-center"
                    >
                        <Ionicons name="call" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Order Summary */}
                <View className="bg-gray-50 p-4 rounded-2xl mb-4">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-gray-500 text-sm">Order #{id?.toString().slice(-6).toUpperCase()}</Text>
                        <Text className="text-[#FF6B6B] font-black text-lg">₹{order?.totalAmount?.toFixed(0)}</Text>
                    </View>
                    <Text className="text-gray-400 text-xs mt-1">
                        {order?.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                    </Text>
                </View>

                {/* Action Button */}
                {isPickup ? (
                    <TouchableOpacity
                        onPress={() => updateOrderStatus('out_for_delivery')}
                        disabled={updating}
                        className="h-14 bg-[#FF6B6B] rounded-2xl items-center justify-center flex-row gap-2"
                    >
                        {updating ? <ActivityIndicator color="white" /> : (
                            <>
                                <MaterialIcons name="check-circle" size={22} color="white" />
                                <Text className="text-white font-bold text-base">Picked Up - Start Delivery</Text>
                            </>
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => updateOrderStatus('delivered')}
                        disabled={updating}
                        className="h-14 bg-[#4ECDC4] rounded-2xl items-center justify-center flex-row gap-2"
                    >
                        {updating ? <ActivityIndicator color="white" /> : (
                            <>
                                <MaterialIcons name="check-circle" size={22} color="white" />
                                <Text className="text-white font-bold text-base">Mark as Delivered</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
