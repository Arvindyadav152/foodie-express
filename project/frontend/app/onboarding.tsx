import { View, Text, TouchableOpacity, StatusBar, ScrollView, Dimensions, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type RoleType = 'customer' | 'vendor' | 'driver';

export default function LandingScreen() {
    const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);

    const roles = [
        {
            id: 'customer' as RoleType,
            title: 'Customer',
            subtitle: 'Order delicious food from top restaurants',
            icon: 'person',
            color: '#FF6B6B',
            bgColor: '#f0fdf0',
            loginRoute: '/auth/login',
            signupRoute: '/auth/signup',
            dashboardRoute: '/(tabs)/home',
        },
        {
            id: 'vendor' as RoleType,
            title: 'Restaurant Partner',
            subtitle: 'Manage menu, orders & grow your business',
            icon: 'storefront',
            color: '#1A1D3B',
            bgColor: '#f5f5f5',
            loginRoute: '/auth/vendor-login',
            signupRoute: '/auth/vendor-signup',
            dashboardRoute: '/vendor/dashboard',
        },
        {
            id: 'driver' as RoleType,
            title: 'Delivery Partner',
            subtitle: 'Earn money by delivering orders',
            icon: 'delivery-dining',
            color: '#3b82f6',
            bgColor: '#eff6ff',
            loginRoute: '/auth/driver-login',
            signupRoute: '/auth/driver-signup',
            dashboardRoute: '/driver/dashboard',
        },
    ];

    const handleLogin = (role: RoleType) => {
        const roleConfig = roles.find(r => r.id === role);
        if (roleConfig) {
            router.push({ pathname: '/auth/login', params: { role: role } });
        }
    };

    const handleSignup = (role: RoleType) => {
        const roleConfig = roles.find(r => r.id === role);
        if (roleConfig) {
            router.push({ pathname: '/auth/signup', params: { role: role } });
        }
    };

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            {/* Background Decorations */}
            <View className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden" style={{ pointerEvents: 'none' }}>
                <View className="absolute -top-32 -left-32 w-64 h-64 bg-[#FF6B6B]/5 rounded-full" />
                <View className="absolute top-1/2 -right-20 w-40 h-40 bg-[#3b82f6]/5 rounded-full" />
                <View className="absolute bottom-20 left-10 w-32 h-32 bg-[#f59e0b]/5 rounded-full" />
            </View>

            <SafeAreaView className="flex-1">
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Header */}
                    <View className="items-center pt-8 pb-6 px-6">
                        <View className="w-20 h-20 bg-white rounded-3xl items-center justify-center mb-4 border border-gray-100">
                            <MaterialIcons name="restaurant-menu" size={40} color="#FF6B6B" />
                        </View>
                        <Text className="text-4xl font-black text-[#1A1D3B] tracking-tight">FoodieExpress</Text>
                        <Text className="text-gray-500 text-center mt-2 text-base">
                            Choose how you want to use our platform
                        </Text>
                    </View>

                    {/* Role Cards */}
                    <View className="px-5 gap-5 mt-4">
                        {roles.map((role) => (
                            <View
                                key={role.id}
                                className="bg-white rounded-[32px] overflow-hidden border border-gray-100"
                                style={{
                                    elevation: 8,
                                    ...Platform.select({
                                        ios: {
                                            shadowColor: role.color,
                                            shadowOffset: { width: 0, height: 8 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 24,
                                        },
                                        web: {
                                            // @ts-ignore
                                            boxShadow: `0px 8px 24px ${role.color}1A`, // 0.1 hex is roughly 1A
                                        }
                                    })
                                }}
                            >
                                {/* Card Header */}
                                <View className="p-6 pb-4">
                                    <View className="flex-row items-start justify-between">
                                        <View
                                            className="w-14 h-14 rounded-2xl items-center justify-center"
                                            style={{ backgroundColor: role.bgColor }}
                                        >
                                            <MaterialIcons name={role.icon as any} size={28} color={role.color} />
                                        </View>
                                        <View
                                            className="px-3 py-1.5 rounded-full"
                                            style={{ backgroundColor: `${role.color}15` }}
                                        >
                                            <Text style={{ color: role.color }} className="text-xs font-bold uppercase tracking-wider">
                                                {role.id === 'customer' ? 'For You' : role.id === 'vendor' ? 'Business' : 'Earn'}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text className="text-2xl font-black text-[#1A1D3B] mt-4 tracking-tight">
                                        {role.title}
                                    </Text>
                                    <Text className="text-gray-500 mt-1 text-sm leading-5">
                                        {role.subtitle}
                                    </Text>
                                </View>

                                {/* Card Actions */}
                                <View className="flex-row gap-3 px-6 pb-6">
                                    <TouchableOpacity
                                        onPress={() => handleLogin(role.id)}
                                        className="flex-1 h-12 rounded-xl items-center justify-center"
                                        style={{ backgroundColor: role.color }}
                                    >
                                        <Text className="text-white font-bold">Login</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleSignup(role.id)}
                                        className="flex-1 h-12 rounded-xl items-center justify-center border-2"
                                        style={{ borderColor: role.color }}
                                    >
                                        <Text style={{ color: role.color }} className="font-bold">Sign Up</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Footer */}
                    <View className="items-center mt-10 px-6">
                        <Text className="text-gray-400 text-xs text-center">
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </Text>
                        <Text className="text-gray-300 text-[10px] mt-4 font-bold tracking-widest uppercase">
                            FoodieExpress v2.0
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
