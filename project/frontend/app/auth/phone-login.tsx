import React, { useState, useRef, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth } from '../../config/firebase';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import Constants from 'expo-constants';

const PhoneLoginScreen = () => {
    const router = useRouter();
    const { login } = useContext(AuthContext);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const recaptchaVerifier = useRef(null);

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length !== 10) {
            Alert.alert('Error', 'Please enter a valid 10-digit phone number');
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
            Alert.alert('Success', 'OTP sent successfully!');
        } catch (error) {
            console.error('Send OTP Error:', error);
            Alert.alert('Error', error.code === 'auth/invalid-phone-number' ? 'Invalid phone number format' : 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            Alert.alert('Error', 'Please enter the 6-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
            const userCredential = await signInWithCredential(auth, credential);

            // Get the ID token to verify with our backend
            const idToken = await userCredential.user.getIdToken();

            // Call our backend to verify token and log user in
            const response = await api.post('/auth/phone-login', {
                idToken,
                role: 'user' // Default to customer
            });

            if (response.data && response.data.token) {
                await login(response.data.token, response.data);
                router.replace('/(tabs)'); // Redirect to main app
            } else {
                throw new Error('Invalid server response');
            }

        } catch (error) {
            console.error('Verify OTP Error:', error);
            Alert.alert('Error', 'Verification failed. Please check the OTP and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={auth.app.options}
                attemptInvisibleVerification={true}
            />

            <View className="px-5 py-4 flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                    <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                </TouchableOpacity>
                <Text className="ml-4 text-xl font-bold text-[#1A1D3B]">Phone Login</Text>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-10">
                <View className="mb-10">
                    <Text className="text-3xl font-black text-[#1A1D3B]">Verify Identity</Text>
                    <Text className="text-gray-500 mt-2">Enter your mobile number to receive a 6-digit verification code.</Text>
                </View>

                {!verificationId ? (
                    <View>
                        <View className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100 flex-row items-center">
                            <Text className="text-lg font-bold text-gray-400 mr-2">+91</Text>
                            <TextInput
                                placeholder="9876543210"
                                keyboardType="phone-pad"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                className="flex-1 text-lg font-bold text-[#1A1D3B]"
                                maxLength={10}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={handleSendOTP}
                            disabled={isLoading}
                            className={`mt-6 bg-[#FF6B6B] h-14 rounded-2xl items-center justify-center shadow-lg shadow-red-200 ${isLoading ? 'opacity-70' : ''}`}
                        >
                            {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Send OTP</Text>}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <View className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100 items-center">
                            <TextInput
                                placeholder="0 0 0 0 0 0"
                                keyboardType="number-pad"
                                value={verificationCode}
                                onChangeText={setVerificationCode}
                                className="text-3xl font-black text-[#1A1D3B] text-center tracking-[10px]"
                                maxLength={6}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={handleVerifyOTP}
                            disabled={isLoading}
                            className={`mt-6 bg-[#2ECC71] h-14 rounded-2xl items-center justify-center shadow-lg shadow-green-200 ${isLoading ? 'opacity-70' : ''}`}
                        >
                            {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Verify & Login</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setVerificationId('')}
                            className="mt-4 items-center"
                        >
                            <Text className="text-[#FF6B6B] font-bold">Resend OTP / Change Number</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View className="mt-auto items-center">
                    <Text className="text-gray-400 text-xs text-center">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PhoneLoginScreen;
