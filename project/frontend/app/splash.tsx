import { View, Text, TouchableOpacity, StatusBar, Dimensions, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const [showContent, setShowContent] = useState(false);
    const [showButtons, setShowButtons] = useState(false);

    useEffect(() => {
        // Show content after initial load
        setTimeout(() => setShowContent(true), 300);
        setTimeout(() => setShowButtons(true), 800);
    }, []);

    return (
        <View className="flex-1 bg-[#1A1D3B]">
            <StatusBar barStyle="light-content" />

            {/* Animated Background Elements */}
            <View className="absolute inset-0 overflow-hidden">
                <View className="absolute -top-20 -left-20 w-80 h-80 bg-[#FF6B6B]/5 rounded-full" />
                <View className="absolute top-1/3 -right-20 w-60 h-60 bg-[#FF6B6B]/3 rounded-full" />
                <View className="absolute bottom-20 left-10 w-40 h-40 bg-[#FF6B6B]/5 rounded-full" />
            </View>

            <SafeAreaView className="flex-1 justify-between px-6 py-8">
                {/* Top Section - Logo */}
                <View className="flex-1 items-center justify-center">
                    <View className={`items-center ${showContent ? 'opacity-100' : 'opacity-0'}`}>
                        <View className="w-32 h-32 bg-[#FF6B6B] rounded-[40px] items-center justify-center mb-6">
                            <MaterialIcons name="restaurant-menu" size={64} color="#1A1D3B" />
                        </View>
                        <Text className="text-5xl font-black text-white tracking-tight">FoodieExpress</Text>
                    </View>

                    <View className={`items-center mt-6 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
                        <Text className="text-white/60 text-lg text-center leading-7">
                            Fresh food delivered to your{'\n'}doorstep in minutes
                        </Text>
                    </View>
                </View>

                {/* Middle Section - Features */}
                <View className={`mb-10 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
                    <View className="flex-row justify-around">
                        <View className="items-center">
                            <View className="w-14 h-14 bg-white/10 rounded-2xl items-center justify-center mb-2">
                                <MaterialIcons name="speed" size={24} color="#FF6B6B" />
                            </View>
                            <Text className="text-white/80 text-xs font-bold">30 Min</Text>
                            <Text className="text-white/40 text-[10px]">Delivery</Text>
                        </View>
                        <View className="items-center">
                            <View className="w-14 h-14 bg-white/10 rounded-2xl items-center justify-center mb-2">
                                <MaterialIcons name="restaurant" size={24} color="#FF6B6B" />
                            </View>
                            <Text className="text-white/80 text-xs font-bold">500+</Text>
                            <Text className="text-white/40 text-[10px]">Restaurants</Text>
                        </View>
                        <View className="items-center">
                            <View className="w-14 h-14 bg-white/10 rounded-2xl items-center justify-center mb-2">
                                <MaterialIcons name="star" size={24} color="#FF6B6B" />
                            </View>
                            <Text className="text-white/80 text-xs font-bold">4.8★</Text>
                            <Text className="text-white/40 text-[10px]">Rating</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Section - CTAs */}
                <View className={`gap-4 ${showButtons ? 'opacity-100' : 'opacity-0'}`}>
                    <TouchableOpacity
                        onPress={() => router.push('/onboarding')}
                        className="w-full h-16 bg-[#FF6B6B] rounded-2xl items-center justify-center flex-row gap-2"
                    >
                        <Text className="text-[#1A1D3B] font-black text-lg">Get Started</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="#1A1D3B" />
                    </TouchableOpacity>

                    <View className="flex-row justify-center items-center gap-1">
                        <Text className="text-white/40 text-xs">Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.push('/auth/login')}>
                            <Text className="text-[#FF6B6B] text-xs font-bold">Sign In</Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-white/20 text-[10px] text-center mt-4">
                        By continuing, you agree to our Terms of Service & Privacy Policy
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
}
