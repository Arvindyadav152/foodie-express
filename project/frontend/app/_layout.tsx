import { Stack, useSegments, useRouter } from "expo-router";
import { AuthProvider, AuthContext } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { SocketProvider } from '../context/SocketContext';
import { LanguageProvider } from '../context/LanguageContext';
import { useEffect, useContext, useRef } from 'react';
import "../global.css";
import { View, ActivityIndicator } from 'react-native';

function RootLayoutNav() {
    const { userToken, userInfo, isLoading } = useContext(AuthContext);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const role = userInfo?.role || 'user';
        const rootSegment = segments[0];

        // Define route categories
        const inAuthGroup = rootSegment === 'auth';
        const inVendorGroup = rootSegment === 'vendor' || rootSegment === '(vendor-tabs)';
        const inDriverGroup = rootSegment === 'driver' || rootSegment === '(driver-tabs)';
        const inOnboarding = rootSegment === 'onboarding';
        const inSplash = rootSegment === 'splash' || rootSegment === 'index' || !rootSegment;

        if (!userToken) {
            // If not logged in and not in a allowed public route, go to splash
            if (!inAuthGroup && !inOnboarding && !inSplash) {
                router.replace('/splash');
            }
        } else {
            // If logged in, ensure user is in the right area for their role
            if (role === 'vendor') {
                if (!inVendorGroup) {
                    router.replace('/(vendor-tabs)/');
                }
            } else if (role === 'driver') {
                if (!inDriverGroup) {
                    router.replace('/(driver-tabs)/');
                }
            } else {
                // Regular User / Customer
                // Redirect if in worker groups or landing pages
                if (inVendorGroup || inDriverGroup || inAuthGroup || inSplash) {
                    router.replace('/(tabs)/home');
                }
            }
        }
    }, [userToken, userInfo?.role, segments[0], isLoading]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(driver-tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(vendor-tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/signup" />
            <Stack.Screen name="vendor" options={{ headerShown: false }} />
            <Stack.Screen name="driver" options={{ headerShown: false }} />
            <Stack.Screen name="checkout" options={{ presentation: 'card', animation: 'slide_from_right' }} />
            <Stack.Screen name="order-success" options={{ gestureEnabled: false }} />
            <Stack.Screen name="order-tracking/[id]" />
            <Stack.Screen name="manage-addresses" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="order-history" />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <SocketProvider>
                    <CartProvider>
                        <RootLayoutNav />
                    </CartProvider>
                </SocketProvider>
            </AuthProvider>
        </LanguageProvider>
    );
}
