import { View, Text, ScrollView, TextInput, Image, TouchableOpacity, StatusBar, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useState, useEffect, useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../../utils/api';
import RestaurantCard from '../../components/RestaurantCard';
import { debounce } from 'lodash';

export default function SearchScreen() {
    const params = useLocalSearchParams();
    const [searchQuery, setSearchQuery] = useState((params.q as string) || '');
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeSort, setActiveSort] = useState('Popularity');
    const [searchFocused, setSearchFocused] = useState(false);

    const fetchResults = async (query: string, filter: string, sort: string) => {
        setLoading(true);
        try {
            const params: any = {};
            if (query) params.search = query;
            if (filter !== 'All') params.category = filter;
            params.sort = sort;

            const { data } = await api.get('/restaurants', { params });
            setRestaurants(data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search to avoid excessive API calls
    const debouncedSearch = useCallback(
        debounce((query: string, filter: string, sort: string) => {
            fetchResults(query, filter, sort);
        }, 500),
        []
    );

    useEffect(() => {
        debouncedSearch(searchQuery, activeFilter, activeSort);
    }, [searchQuery, activeFilter, activeSort]);

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView edges={['top']} className="bg-white/80 z-50">
                <View className="flex-row items-center px-4 py-2 justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-[#f6f8f6] shadow-sm">
                        <MaterialIcons name="arrow-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="text-[#1A1D3B] text-lg font-bold">Search</Text>
                    <View className="w-10 h-10" />
                </View>

                {/* Search Bar */}
                <View className="px-4 py-3">
                    <View className="flex-row items-center gap-3">
                        <View
                            className={`flex-1 h-14 bg-white/70 rounded-[22px] flex-row items-center px-5 border border-white/80 shadow-sm ${searchFocused ? 'transform scale-[1.02]' : ''}`}
                        >
                            <Ionicons name="search" size={20} color="#FF6B6B" />
                            <TextInput
                                placeholder="What are you craving?"
                                placeholderTextColor="#9ca3af"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                className="flex-1 ml-3 text-base font-bold text-[#1A1D3B]"
                                autoFocus={true}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setSearchQuery('')}
                                    className="w-6 h-6 items-center justify-center rounded-full bg-gray-100"
                                >
                                    <MaterialIcons name="close" size={14} color="#1A1D3B" />
                                </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={() => setFilterVisible(!filterVisible)}
                            activeOpacity={0.8}
                        >
                            <View
                                className={`w-14 h-14 items-center justify-center rounded-[22px] border ${filterVisible ? 'bg-[#1A1D3B] border-[#1A1D3B]' : 'bg-white border-white/80 shadow-sm'}`}
                            >
                                <Ionicons name="options" size={24} color={filterVisible ? "#FF6B6B" : "#1A1D3B"} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {/* Filter Chips */}
            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 10 }} className="pt-2">
                    {['All', 'Pizza', 'Burger', 'Sushi', 'Fast Food', 'Healthy'].map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            onPress={() => setActiveFilter(filter)}
                            className={`flex-row h-9 items-center justify-center gap-1 rounded-full px-4 border ${activeFilter === filter ? 'bg-[#FF6B6B] border-[#FF6B6B]' : 'bg-white border-gray-200'}`}
                        ><Text className={`text-xs font-bold ${activeFilter === filter ? 'text-white' : 'text-gray-600'}`}>{filter}</Text></TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 150, paddingTop: 10 }}>
                {loading ? (
                    <View className="py-20">
                        <ActivityIndicator size="large" color="#FF6B6B" />
                    </View>
                ) : restaurants.length > 0 ? (
                    <View className="gap-6">
                        {restaurants.map((restaurant: any) => (
                            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                        ))}
                    </View>
                ) : (
                    <View className="items-center py-20">
                        <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4 shadow-sm">
                            <MaterialIcons name="search-off" size={40} color="#9ca3af" />
                        </View>
                        <Text className="text-[#1A1D3B] font-black text-xl uppercase tracking-tighter">No Cravings Found</Text>
                        <Text className="text-gray-400 text-center mt-2 px-10 font-medium">We couldn't find any restaurants matching "{searchQuery}"</Text>
                    </View>
                )}
            </ScrollView>
            {filterVisible && (
                <View className="absolute inset-0 z-[100]">
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setFilterVisible(false)}
                        className="flex-1 bg-black/40"
                    />
                    <View className="absolute bottom-0 left-0 right-0 rounded-t-[48px] overflow-hidden bg-white shadow-2xl">
                        <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
                        <View className="p-8 pb-12">
                            <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-8" />
                            <Text className="text-2xl font-black text-[#1A1D3B] uppercase tracking-tighter mb-6">Refine Search</Text>

                            <View className="mb-8">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Sort By</Text>
                                <View className="flex-row flex-wrap gap-3">
                                    {['Popularity', 'Rating (4.0+)', 'Price: Low to High', 'Delivery Time'].map((sort) => (
                                        <TouchableOpacity
                                            key={sort}
                                            onPress={() => setActiveSort(sort)}
                                            className={`${activeSort === sort ? 'bg-[#FF6B6B] border-[#FF6B6B]' : 'bg-[#f5f8f5] border-gray-100'} px-4 py-3 rounded-2xl border`}
                                        >
                                            <Text className={`${activeSort === sort ? 'text-white' : 'text-[#1A1D3B]'} font-bold text-xs`}>{sort}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => {
                                    setFilterVisible(false);
                                    fetchResults(searchQuery, activeFilter, activeSort);
                                }}
                                className="bg-[#1A1D3B] w-full py-5 rounded-[24px] items-center shadow-xl shadow-black/20"
                            >
                                <Text className="text-[#FF6B6B] font-black uppercase tracking-widest">Apply Preferences</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const StyleSheet = {
    absoluteFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    }
} as any;
