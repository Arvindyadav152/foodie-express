import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import api from '../../utils/api';
import { useRequireAuth } from '../../hooks/useRequireAuth';

export default function FavoritesScreen() {
    const { userId, isLoading: authLoading } = useRequireAuth('user');

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (userId) fetchFavorites();
    }, [userId]);

    const fetchFavorites = async () => {
        try {
            const { data } = await api.get(`/users/${userId}/favorites`);
            setFavorites(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const toggleFavorite = async (restaurantId: string) => {
        try {
            await api.put(`/users/${userId}/favorites/${restaurantId}`);
            fetchFavorites(); // Refresh list
        } catch (error) {
            console.error(error);
        }
    };

    const renderRestaurant = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/restaurant/${item._id}`)}
            className="bg-white mx-5 mb-5 rounded-[40px] overflow-hidden shadow-sm border border-gray-50 flex-row p-4"
        >
            <View className="relative">
                <Image
                    source={{ uri: item.image || 'https://placehold.co/200' }}
                    className="w-28 h-28 rounded-[32px] bg-[#f5f8f5]"
                />
                <TouchableOpacity
                    onPress={() => toggleFavorite(item._id)}
                    className="absolute top-2 right-2 bg-white/90 w-8 h-8 rounded-full items-center justify-center shadow-sm"
                >
                    <Ionicons name="heart" size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <View className="flex-1 ml-4 justify-center py-1">
                <Text className="font-black text-[#1A1D3B] text-lg uppercase tracking-tight" numberOfLines={1}>{item.name}</Text>
                <View className="flex-row items-center gap-1 mt-1">
                    <Ionicons name="star" size={14} color="#f59e0b" />
                    <Text className="text-[#1A1D3B] text-xs font-black">{item.rating || '4.5'}</Text>
                    <Text className="text-gray-400 text-xs font-bold ml-1">• {item.cuisine?.[0] || 'Fast Food'}</Text>
                </View>

                <View className="flex-row items-center mt-3 bg-[#FF6B6B]/5 self-start px-3 py-1.5 rounded-xl border border-[#FF6B6B]/10">
                    <MaterialIcons name="delivery-dining" size={16} color="#FF6B6B" />
                    <Text className="text-[10px] text-[#FF6B6B] font-black uppercase tracking-widest ml-1">{item.deliveryTime || '25-30'} MIN • FREE</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView edges={['top']} className="bg-white/80 z-50">
                <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
                <View className="px-5 py-3 flex-row items-center gap-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-2xl bg-[#1A1D3B] items-center justify-center shadow-lg">
                        <Ionicons name="chevron-back" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-black text-[#1A1D3B] uppercase tracking-tighter">Crave List</Text>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Your absolute favorites</Text>
                    </View>
                </View>
            </SafeAreaView>

            {loading && !refreshing ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#FF6B6B" />
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item: any) => item._id}
                    renderItem={renderRestaurant}
                    contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); fetchFavorites(); }}
                    ListEmptyComponent={
                        <View className="items-center py-20 px-10">
                            <View className="w-24 h-24 bg-white rounded-[40px] items-center justify-center mb-6 shadow-sm">
                                <Ionicons name="heart-outline" size={48} color="#d1d5db" />
                            </View>
                            <Text className="text-[#1A1D3B] text-2xl font-black text-center uppercase tracking-tight">Empty Hearts?</Text>
                            <Text className="text-gray-500 text-center mt-2 font-medium">Add some restaurants to your crave list to find them easily!</Text>
                            <TouchableOpacity
                                onPress={() => router.replace('/(tabs)/home')}
                                className="mt-8 bg-[#1A1D3B] px-8 py-4 rounded-[20px] shadow-xl shadow-black/20"
                            >
                                <Text className="text-[#FF6B6B] font-black uppercase tracking-widest text-xs">Start Exploring</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
