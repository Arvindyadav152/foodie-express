import React, { useState, useRef, useContext, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
    Vibration,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth } from '../../config/firebase';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import { BlurView } from 'expo-blur';

const PhoneLoginScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ role?: string }>();
    const { login } = useContext(AuthContext);

    // Map 'customer' to 'user' for backend consistency
    const selectedRole = params.role === 'customer' ? 'user' : (params.role || 'user');

    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const recaptchaVerifier = useRef(null);

    // Dynamic UI states
    const [focused, setFocused] = useState(false);

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length !== 10) {
            Vibration.vibrate(100);
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number to proceed.');
            return;
        }

        setIsLoading(true);
        try {
            const phoneProvider = new PhoneAuthProvider(auth);
            const id = await phoneProvider.verifyPhoneNumber(
                `+91${phoneNumber}`,
                recaptchaVerifier.current
            );
            setVerificationId(id);
            Vibration.vibrate(50);
        } catch (error: any) {
            console.error('Send OTP Error:', error);
            Alert.alert('Verification Failed', error.code === 'auth/invalid-phone-number' ? 'This phone number format is invalid.' : 'We couldn\'t send the OTP. Please check your internet and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            Vibration.vibrate(100);
            Alert.alert('Invalid OTP', 'Please enter the 6-digit code sent to your phone.');
            return;
        }

        setIsLoading(true);
        try {
            const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
            const userCredential = await signInWithCredential(auth, credential);

            const idToken = await userCredential.user.getIdToken();

            const response = await api.post('/auth/phone-login', {
                idToken,
                role: selectedRole
            });

            if (response.data && response.data.token) {
                await login(response.data.token, response.data);
                Vibration.vibrate(100);

                const userRole = response.data.role;
                if (userRole === 'vendor') router.replace('/(vendor-tabs)');
                else if (userRole === 'driver') router.replace('/(driver-tabs)');
                else router.replace('/(tabs)');
            } else {
                throw new Error('Server authentication failed');
            }

        } catch (error: any) {
            console.error('Verify OTP Error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={auth.app.options}
                attemptInvisibleVerification={true}
            />

            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <View className="px-6 py-4 flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-12 h-12 rounded-2xl bg-gray-50 items-center justify-center border border-gray-100"
                        >
                            <Ionicons name="arrow-back" size={24} color="#1A1D3B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        className="px-8"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="mt-8 mb-12">
                            <View className="w-16 h-16 bg-[#FF6B6B]/10 rounded-3xl items-center justify-center mb-6">
                                <MaterialIcons name={!verificationId ? "smartphone" : "message"} size={32} color="#FF6B6B" />
                            </View>
                            <Text className="text-4xl font-black text-[#1A1D3B] tracking-tight leading-[44px]">
                                {!verificationId ? "Sign in with\nMobile" : "Verify your\nNumber"}
                            </Text>
                            <Text className="text-gray-500 mt-4 text-lg leading-6 font-medium">
                                {!verificationId
                                    ? "Enter your details to access your account securely."
                                    : `We've sent a 6-digit code to +91 ${phoneNumber}`}
                            </Text>
                        </View>

                        <View className="gap-6">
                            {!verificationId ? (
                                <View>
                                    <Text className="text-[#1A1D3B] text-sm font-bold mb-3 ml-1">Phone Number</Text>
                                    <View
                                        className={`flex-row items-center bg-gray-50 rounded-[24px] px-6 h-18 border-2 transition-all ${focused ? 'border-[#FF6B6B] bg-white' : 'border-transparent'}`}
                                        style={{ height: 72 }}
                                    >
                                        <View className="flex-row items-center border-r border-gray-200 pr-4 mr-4">
                                            <Text className="text-lg font-black text-[#1A1D3B]">+91</Text>
                                        </View>
                                        <TextInput
                                            placeholder="98765 43210"
                                            keyboardType="phone-pad"
                                            value={phoneNumber}
                                            onChangeText={setPhoneNumber}
                                            onFocus={() => setFocused(true)}
                                            onBlur={() => setFocused(false)}
                                            className="flex-1 text-xl font-bold text-[#1A1D3B]"
                                            maxLength={10}
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleSendOTP}
                                        disabled={isLoading}
                                        className={`mt-10 h-18 bg-[#FF6B6B] rounded-[24px] items-center justify-center shadow-2xl shadow-[#FF6B6B]/40 flex-row gap-3 ${isLoading ? 'opacity-70' : ''}`}
                                        style={{ height: 68 }}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <>
                                                <Text className="text-white font-black text-xl">Continue</Text>
                                                <MaterialIcons name="arrow-forward" size={24} color="white" />
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View>
                                    <Text className="text-[#1A1D3B] text-sm font-bold mb-3 ml-1">One-Time Password</Text>
                                    <View
                                        className="bg-gray-50 rounded-[24px] px-6 h-18 border-2 border-transparent focus:border-[#2ECC71]"
                                        style={{ height: 72, justifyContent: 'center' }}
                                    >
                                        <TextInput
                                            placeholder="0 0 0 0 0 0"
                                            keyboardType="number-pad"
                                            value={verificationCode}
                                            onChangeText={setVerificationCode}
                                            className="text-3xl font-black text-[#1A1D3B] text-center tracking-[12px]"
                                            maxLength={6}
                                            placeholderTextColor="#d1d5db"
                                            autoFocus
                                        />
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleVerifyOTP}
                                        disabled={isLoading}
                                        className={`mt-10 h-18 bg-[#1A1D3B] rounded-[24px] items-center justify-center shadow-2xl shadow-gray-400 ${isLoading ? 'opacity-70' : ''}`}
                                        style={{ height: 68 }}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <Text className="text-white font-black text-xl">Verify & Sign In</Text>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setVerificationId('')}
                                        className="mt-8 self-center"
                                    >
                                        <Text className="text-gray-400 font-bold">Entered wrong number? <Text className="text-[#FF6B6B]">Change</Text></Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View className="mt-auto pt-10 pb-6">
                            <Text className="text-gray-400 text-sm text-center font-medium leading-5 px-6">
                                By continuing, you agree to our{' '}
                                <Text className="text-[#1A1D3B] font-bold">Terms</Text> &{' '}
                                <Text className="text-[#1A1D3B] font-bold">Privacy Policy</Text>.
                            </Text>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

export default PhoneLoginScreen;
