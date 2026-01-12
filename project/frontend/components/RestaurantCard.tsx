import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Link, router } from 'expo-router';

interface Restaurant {
    _id: string;
    name: string;
    description: string;
    image: string;
    rating: number;
    deliveryTime: string;
    priceRange: string;
    isFreeDelivery?: boolean;
    distance?: number;
}

interface RestaurantCardProps {
    restaurant: Restaurant;
    onPress?: () => void;
}

export default function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.push(`/restaurant/${restaurant._id}` as any);
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
        >
            <View className="rounded-2xl overflow-hidden bg-white/40 border border-white/50 shadow-xl">
                <View className="h-48 w-full relative">
                    <Image
                        source={{ uri: restaurant.image }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    <View className="absolute top-3 right-3 overflow-hidden rounded-lg">
                        <View className="px-2 py-1 flex-row items-center gap-1 bg-white/60">
                            <MaterialIcons name="star" size={12} color="#f59e0b" />
                            <Text className="text-[12px] font-bold text-[#1A1D3B]">{restaurant.rating}</Text>
                        </View>
                    </View>
                </View>
                <View className="p-4">
                    <View className="flex-row justify-between items-start mb-2">
                        <View>
                            <Text className="text-[#1A1D3B] text-lg font-bold">{restaurant.name}</Text>
                            <Text className="text-gray-500 text-xs font-medium">{restaurant.description}</Text>
                        </View>
                        {restaurant.isFreeDelivery && (
                            <View className="bg-[#FF6B6B]/20 px-2 py-1 rounded-lg">
                                <Text className="text-green-700 text-[10px] font-bold">FREE DELIVERY</Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-row items-center justify-between mt-4">
                        <View className="flex-row items-center gap-4">
                            <View className="flex-row items-center gap-1">
                                <MaterialIcons name="schedule" size={14} color="#4b5563" />
                                <Text className="text-xs font-bold text-gray-600">{restaurant.deliveryTime}</Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <MaterialIcons name="payments" size={14} color="#4b5563" />
                                <Text className="text-xs font-bold text-gray-600">{restaurant.priceRange}</Text>
                            </View>
                            {restaurant.distance !== undefined && (
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="location" size={14} color="#FF6B6B" />
                                    <Text className="text-xs font-black text-[#FF6B6B]">{restaurant.distance} km</Text>
                                </View>
                            )}
                        </View>
                        <View className="bg-[#FF6B6B] px-5 py-2 rounded-xl shadow-md shadow-[#FF6B6B]/20">
                            <Text className="text-[#1A1D3B] text-sm font-bold">Order Now</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
