import { View, Text, TouchableOpacity, TextInput, Image, StatusBar } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import api from '../../utils/api';

import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const roleConfig = {
    customer: { title: 'Customer', color: '#FF6B6B', icon: 'person' },
    vendor: { title: 'Restaurant Partner', color: '#1A1D3B', icon: 'storefront' },
    driver: { title: 'Delivery Partner', color: '#3b82f6', icon: 'delivery-dining' },
};

export default function LoginScreen() {
    const { role = 'customer' } = useLocalSearchParams<{ role?: string }>();
    const currentRole = roleConfig[role as keyof typeof roleConfig] || roleConfig.customer;

    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });

            // ENFORCE ROLE-BASED ACCESS
            // Map the screen role to the API role
            const expectedRole = role === 'customer' ? 'user' : role;

            if (data.role !== expectedRole) {
                // Special case: Vendor/Driver might need to access customer app
                // but Customer should NEVER access Vendor/Driver apps.
                if (expectedRole !== 'user') {
                    alert(`Unauthorized: This account is registered as a ${data.role}. Please use the correct login portal.`);
                    setLoading(false);
                    return;
                }
            }

            // Use context to log in globally
            await login(data.token, data);

            // Navigation is handled automatically by _layout.tsx AuthGuard
        } catch (error: any) {
            console.log(error);
            alert(error.response?.data?.message || 'Login Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            {/* Background Mesh Gradient Simulation */}
            <View className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden">
                <View className="absolute -top-20 -left-20 w-64 h-64 bg-[#FF6B6B]/10 rounded-full blur-3xl" />
                <View className="absolute bottom-0 right-0 w-64 h-64 bg-[#FF6B6B]/5 rounded-full blur-3xl" />
            </View>

            <SafeAreaView className="flex-1 px-4 justify-center items-center">

                {/* Main Glass Container */}
                <View className="w-full max-w-[420px] bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl overflow-hidden">
                    <View className="absolute inset-0">
                        <BlurView intensity={20} style={{ flex: 1 }} />
                    </View>

                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6 z-10">
                        <TouchableOpacity onPress={() => router.push('/onboarding')} className="w-10 h-10 bg-[#f5f8f5] rounded-full items-center justify-center shadow-sm">
                            <MaterialIcons name="chevron-left" size={24} color="#1A1D3B" />
                        </TouchableOpacity>
                        <Text className="text-[#1A1D3B] text-lg font-extrabold tracking-tight">FoodieExpress</Text>
                        <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: `${currentRole.color}15` }}>
                            <MaterialIcons name={currentRole.icon as any} size={20} color={currentRole.color} />
                        </View>
                    </View>

                    {/* Role & Tabs */}
                    <View className="items-center mb-2 z-10">
                        <Text style={{ color: currentRole.color }} className="text-xs font-bold uppercase tracking-widest mb-2">
                            {currentRole.title} Login
                        </Text>

                        <View className="flex-row h-14 w-full bg-[#f5f8f5] p-1.5 rounded-xl shadow-inner">
                            <TouchableOpacity
                                className="flex-1 bg-white rounded-lg items-center justify-center shadow-sm"
                                activeOpacity={1}
                            >
                                <Text className="text-[#1A1D3B] text-sm font-bold">Login</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.replace({ pathname: '/auth/signup', params: { role } })}
                                className="flex-1 rounded-lg items-center justify-center"
                            >
                                <Text className="text-[#608a60] text-sm font-medium">Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Headline */}
                    <View className="z-10 mt-2 mb-4 items-center">
                        <Text className="text-[#1A1D3B] text-3xl font-extrabold">Welcome Back</Text>
                        <Text className="text-[#608a60] text-sm mt-1">Fresh meals are just a few taps away</Text>
                    </View>

                    {/* Form */}
                    <View className="gap-5 mt-2 z-10">
                        <View className="gap-2">
                            <Text className="text-[#1A1D3B] text-sm font-bold ml-2">Email Address</Text>
                            <View className="relative justify-center">
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    className="w-full h-14 bg-[#f5f8f5] rounded-xl px-12 text-[#1A1D3B] shadow-sm"
                                    placeholder="hello@delivery.com"
                                    placeholderTextColor="#608a6080"
                                    autoCapitalize="none"
                                />
                                <MaterialIcons name="mail" size={20} color="#608a60" style={{ position: 'absolute', left: 16 }} />
                            </View>
                        </View>

                        <View className="gap-2">
                            <Text className="text-[#1A1D3B] text-sm font-bold ml-2">Password</Text>
                            <View className="relative justify-center">
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    className="w-full h-14 bg-[#f5f8f5] rounded-xl px-12 text-[#1A1D3B] shadow-sm"
                                    placeholder="••••••••"
                                    placeholderTextColor="#608a6080"
                                    secureTextEntry={!showPassword}
                                />
                                <MaterialIcons name="lock" size={20} color="#608a60" style={{ position: 'absolute', left: 16 }} />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 16 }}>
                                    <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#608a60" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={() => router.push('/auth/forgot-password')} className="self-end pr-2">
                                <Text className="text-xs font-bold text-[#FF6B6B]">Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loading}
                        className="mt-6 w-full h-14 bg-[#FF6B6B] rounded-xl shadow-md items-center justify-center flex-row gap-2 z-10"
                    >
                        <Text className="text-white font-extrabold text-lg">{loading ? 'Signing In...' : 'Sign In'}</Text>
                        {!loading && <MaterialIcons name="arrow-forward" size={20} color="white" />}
                    </TouchableOpacity>

                    {/* Social */}
                    <View className="z-10">
                        <View className="flex-row items-center gap-4 my-6">
                            <View className="flex-1 h-[1px] bg-[#dbe6db]" />
                            <Text className="text-[10px] font-bold text-[#608a60] uppercase tracking-widest">Or Continue With</Text>
                            <View className="flex-1 h-[1px] bg-[#dbe6db]" />
                        </View>

                        <View className="flex-row justify-center gap-6">
                            {/* Placeholders for Social Icons */}
                            <TouchableOpacity className="w-14 h-14 rounded-full bg-[#f5f8f5] shadow-sm items-center justify-center">
                                <MaterialIcons name="apple" size={24} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity className="w-14 h-14 rounded-full bg-[#f5f8f5] shadow-sm items-center justify-center">
                                <MaterialIcons name="g-translate" size={24} color="black" />
                                {/* Using g-translate as google placeholder if material icons doesn't have google-colored logo */}
                            </TouchableOpacity>
                        </View>

                        <View className="mt-6 items-center flex-row justify-center">
                            <Text className="text-[#608a60] text-sm">Are you a vendor? </Text>
                            <TouchableOpacity onPress={() => router.push('/vendor/dashboard')}>
                                <Text className="text-[#FF6B6B] font-bold">Switch to Partner App</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </SafeAreaView>
        </View>
    );
}
