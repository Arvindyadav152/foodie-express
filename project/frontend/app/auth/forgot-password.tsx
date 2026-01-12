import { View, Text, TouchableOpacity, TextInput, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import api from '../../utils/api';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSendOTP = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            // Simulating OTP send - In production, call actual API
            await new Promise(resolve => setTimeout(resolve, 1500));
            // await api.post('/auth/forgot-password', { email });
            Alert.alert('OTP Sent!', `A 6-digit code has been sent to ${email}`);
            setStep('otp');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            // Simulating OTP verification
            await new Promise(resolve => setTimeout(resolve, 1000));
            // await api.post('/auth/verify-otp', { email, otp });
            setStep('reset');
        } catch (error: any) {
            Alert.alert('Error', 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            // Simulating password reset
            await new Promise(resolve => setTimeout(resolve, 1500));
            // await api.post('/auth/reset-password', { email, otp, newPassword });
            Alert.alert('Success!', 'Password has been reset successfully!', [
                { text: 'Login Now', onPress: () => router.replace('/auth/login') }
            ]);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            {/* Background */}
            <View className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden">
                <View className="absolute -top-20 -right-20 w-64 h-64 bg-[#FF6B6B]/10 rounded-full blur-3xl" />
                <View className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF6B6B]/5 rounded-full blur-3xl" />
            </View>

            <SafeAreaView className="flex-1 px-4 justify-center items-center">
                <View className="w-full max-w-[420px] bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl overflow-hidden">
                    <View className="absolute inset-0">
                        <BlurView intensity={20} style={{ flex: 1 }} />
                    </View>

                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6 z-10">
                        <TouchableOpacity
                            onPress={() => step === 'email' ? router.back() : setStep('email')}
                            className="w-10 h-10 bg-[#f5f8f5] rounded-full items-center justify-center shadow-sm"
                        >
                            <MaterialIcons name="chevron-left" size={24} color="#1A1D3B" />
                        </TouchableOpacity>
                        <Text className="text-[#1A1D3B] text-lg font-extrabold tracking-tight">Reset Password</Text>
                        <View className="w-10 h-10 bg-[#FF6B6B]/10 rounded-full items-center justify-center">
                            <MaterialIcons name="lock-reset" size={20} color="#FF6B6B" />
                        </View>
                    </View>

                    {/* Progress Indicator */}
                    <View className="flex-row gap-2 mb-6 z-10">
                        <View className={`flex-1 h-1.5 rounded-full ${step === 'email' || step === 'otp' || step === 'reset' ? 'bg-[#FF6B6B]' : 'bg-gray-200'}`} />
                        <View className={`flex-1 h-1.5 rounded-full ${step === 'otp' || step === 'reset' ? 'bg-[#FF6B6B]' : 'bg-gray-200'}`} />
                        <View className={`flex-1 h-1.5 rounded-full ${step === 'reset' ? 'bg-[#FF6B6B]' : 'bg-gray-200'}`} />
                    </View>

                    {/* Step 1: Email */}
                    {step === 'email' && (
                        <View className="z-10">
                            <View className="items-center mb-6">
                                <View className="w-20 h-20 bg-[#FF6B6B]/10 rounded-full items-center justify-center mb-4">
                                    <MaterialIcons name="mail-outline" size={40} color="#FF6B6B" />
                                </View>
                                <Text className="text-[#1A1D3B] text-2xl font-extrabold">Forgot Password?</Text>
                                <Text className="text-[#608a60] text-sm mt-1 text-center">
                                    Enter your email and we'll send you a code to reset your password
                                </Text>
                            </View>

                            <View className="gap-2 mb-6">
                                <Text className="text-[#1A1D3B] text-sm font-bold ml-2">Email Address</Text>
                                <View className="relative justify-center">
                                    <TextInput
                                        value={email}
                                        onChangeText={setEmail}
                                        className="w-full h-14 bg-[#f5f8f5] rounded-xl px-12 text-[#1A1D3B] shadow-sm"
                                        placeholder="your@email.com"
                                        placeholderTextColor="#608a6080"
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                    <MaterialIcons name="mail" size={20} color="#608a60" style={{ position: 'absolute', left: 16 }} />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleSendOTP}
                                disabled={loading}
                                className={`w-full h-14 rounded-xl items-center justify-center flex-row gap-2 ${loading ? 'bg-gray-300' : 'bg-[#FF6B6B]'}`}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text className="text-white font-extrabold text-lg">Send OTP</Text>
                                        <MaterialIcons name="arrow-forward" size={20} color="white" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 'otp' && (
                        <View className="z-10">
                            <View className="items-center mb-6">
                                <View className="w-20 h-20 bg-[#FF6B6B]/10 rounded-full items-center justify-center mb-4">
                                    <MaterialIcons name="sms" size={40} color="#FF6B6B" />
                                </View>
                                <Text className="text-[#1A1D3B] text-2xl font-extrabold">Verify OTP</Text>
                                <Text className="text-[#608a60] text-sm mt-1 text-center">
                                    Enter the 6-digit code sent to {email}
                                </Text>
                            </View>

                            <View className="gap-2 mb-6">
                                <Text className="text-[#1A1D3B] text-sm font-bold ml-2">OTP Code</Text>
                                <TextInput
                                    value={otp}
                                    onChangeText={setOtp}
                                    className="w-full h-16 bg-[#f5f8f5] rounded-xl text-center text-[#1A1D3B] text-2xl font-black tracking-[8px] shadow-sm"
                                    placeholder="000000"
                                    placeholderTextColor="#608a6080"
                                    maxLength={6}
                                    keyboardType="number-pad"
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleVerifyOTP}
                                disabled={loading}
                                className={`w-full h-14 rounded-xl items-center justify-center flex-row gap-2 ${loading ? 'bg-gray-300' : 'bg-[#FF6B6B]'}`}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text className="text-white font-extrabold text-lg">Verify</Text>
                                        <MaterialIcons name="check" size={20} color="white" />
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleSendOTP} className="mt-4 items-center">
                                <Text className="text-[#FF6B6B] text-sm font-bold">Resend OTP</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Step 3: Reset Password */}
                    {step === 'reset' && (
                        <View className="z-10">
                            <View className="items-center mb-6">
                                <View className="w-20 h-20 bg-[#FF6B6B]/10 rounded-full items-center justify-center mb-4">
                                    <MaterialIcons name="vpn-key" size={40} color="#FF6B6B" />
                                </View>
                                <Text className="text-[#1A1D3B] text-2xl font-extrabold">New Password</Text>
                                <Text className="text-[#608a60] text-sm mt-1 text-center">
                                    Create a strong password for your account
                                </Text>
                            </View>

                            <View className="gap-4 mb-6">
                                <View className="gap-2">
                                    <Text className="text-[#1A1D3B] text-sm font-bold ml-2">New Password</Text>
                                    <View className="relative justify-center">
                                        <TextInput
                                            value={newPassword}
                                            onChangeText={setNewPassword}
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
                                </View>

                                <View className="gap-2">
                                    <Text className="text-[#1A1D3B] text-sm font-bold ml-2">Confirm Password</Text>
                                    <View className="relative justify-center">
                                        <TextInput
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            className="w-full h-14 bg-[#f5f8f5] rounded-xl px-12 text-[#1A1D3B] shadow-sm"
                                            placeholder="••••••••"
                                            placeholderTextColor="#608a6080"
                                            secureTextEntry={!showPassword}
                                        />
                                        <MaterialIcons name="lock" size={20} color="#608a60" style={{ position: 'absolute', left: 16 }} />
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleResetPassword}
                                disabled={loading}
                                className={`w-full h-14 rounded-xl items-center justify-center flex-row gap-2 ${loading ? 'bg-gray-300' : 'bg-[#FF6B6B]'}`}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text className="text-white font-extrabold text-lg">Reset Password</Text>
                                        <MaterialIcons name="check-circle" size={20} color="white" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Back to Login */}
                    <TouchableOpacity onPress={() => router.replace('/auth/login')} className="mt-6 items-center z-10">
                        <Text className="text-[#608a60] text-sm">
                            Remember your password? <Text className="text-[#FF6B6B] font-bold">Login</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
