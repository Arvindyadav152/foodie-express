import { View, Text, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const roleConfig = {
    customer: { title: 'Customer', color: '#FF6B6B', icon: 'person', apiRole: 'user' },
    vendor: { title: 'Restaurant Partner', color: '#1A1D3B', icon: 'storefront', apiRole: 'vendor' },
    driver: { title: 'Delivery Partner', color: '#3b82f6', icon: 'delivery-dining', apiRole: 'driver' },
};

export default function SignupScreen() {
    const { role = 'customer' } = useLocalSearchParams<{ role?: string }>();
    const currentRole = roleConfig[role as keyof typeof roleConfig] || roleConfig.customer;
    const { login } = useContext(AuthContext);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    const handleSignup = async () => {
        if (!fullName || !email || !password) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', {
                fullName,
                email,
                password,
                role: currentRole.apiRole
            });
            await login(data.token, data);
            // Navigation is handled by _layout.tsx based on role
        } catch (error: any) {
            console.log(error);
            alert(error.response?.data?.message || 'Registration Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            {/* Background Mesh */}
            <View className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden">
                <View className="absolute -top-20 -left-20 w-64 h-64 bg-[#FF6B6B]/10 rounded-full blur-3xl" />
                <View className="absolute bottom-0 right-0 w-64 h-64 bg-[#FF6B6B]/5 rounded-full blur-3xl" />
            </View>

            <SafeAreaView className="flex-1 px-4 justify-center items-center">
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
                            {currentRole.title} Sign Up
                        </Text>

                        <View className="flex-row h-14 w-full bg-[#f5f8f5] p-1.5 rounded-xl shadow-inner">
                            <TouchableOpacity
                                onPress={() => router.replace({ pathname: '/auth/login', params: { role } })}
                                className="flex-1 rounded-lg items-center justify-center"
                            >
                                <Text className="text-[#608a60] text-sm font-medium">Login</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-white rounded-lg items-center justify-center shadow-sm"
                                activeOpacity={1}
                            >
                                <Text className="text-[#1A1D3B] text-sm font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Headline */}
                    <View className="z-10 mt-2 mb-4 items-center">
                        <Text className="text-[#1A1D3B] text-3xl font-extrabold">Create Account</Text>
                        <Text className="text-[#608a60] text-sm mt-1">Start your tasty journey</Text>
                    </View>

                    {/* Form */}
                    <View className="gap-4 mt-2 z-10">
                        <View className="gap-2">
                            <Text className="text-[#1A1D3B] text-sm font-bold ml-2">Full Name</Text>
                            <View className="relative justify-center">
                                <TextInput
                                    value={fullName}
                                    onChangeText={setFullName}
                                    className="w-full h-14 bg-[#f5f8f5] rounded-xl px-12 text-[#1A1D3B] shadow-sm"
                                    placeholder="John Doe"
                                    placeholderTextColor="#608a6080"
                                />
                                <MaterialIcons name="person" size={20} color="#608a60" style={{ position: 'absolute', left: 16 }} />
                            </View>
                        </View>

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
                                    secureTextEntry
                                />
                                <MaterialIcons name="lock" size={20} color="#608a60" style={{ position: 'absolute', left: 16 }} />
                            </View>
                        </View>
                    </View>

                    {/* Terms & Privacy Checkbox */}
                    <TouchableOpacity
                        onPress={() => setAgreeToTerms(!agreeToTerms)}
                        className="flex-row items-start gap-3 mt-4 z-10"
                    >
                        <View className={`w-5 h-5 rounded-md border-2 items-center justify-center ${agreeToTerms ? 'bg-[#FF6B6B] border-[#FF6B6B]' : 'border-gray-300'}`}>
                            {agreeToTerms && <MaterialIcons name="check" size={14} color="white" />}
                        </View>
                        <Text className="text-gray-500 text-xs flex-1 leading-5">
                            I agree to FoodieExpress{' '}
                            <Text onPress={() => router.push('/terms')} className="text-[#FF6B6B] font-bold">Terms of Service</Text>
                            {' '}and{' '}
                            <Text onPress={() => router.push('/privacy')} className="text-[#FF6B6B] font-bold">Privacy Policy</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Action Button */}
                    <TouchableOpacity
                        onPress={handleSignup}
                        disabled={loading || !agreeToTerms}
                        className={`mt-4 w-full h-14 rounded-xl shadow-md items-center justify-center flex-row gap-2 z-10 ${!agreeToTerms ? 'opacity-50' : ''}`}
                        style={{ backgroundColor: currentRole.color }}
                    >
                        <Text className="text-white font-extrabold text-lg">{loading ? 'Creating Account...' : 'Sign Up'}</Text>
                        {!loading && <MaterialIcons name="arrow-forward" size={20} color="white" />}
                    </TouchableOpacity>

                    <View className="z-10 mt-6 items-center flex-row justify-center">
                        <Text className="text-[#608a60] text-sm">Have an account? </Text>
                        <TouchableOpacity onPress={() => router.replace({ pathname: '/auth/login', params: { role } })}>
                            <Text style={{ color: currentRole.color }} className="font-bold">Sign In</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </SafeAreaView>
        </View>
    );
}
