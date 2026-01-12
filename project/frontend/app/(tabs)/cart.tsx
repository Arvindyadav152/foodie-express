import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect, useCallback, useContext } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { BlurView } from 'expo-blur';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

import { CartContext } from '../../context/CartContext';

export default function CartScreen() {
    const { userInfo } = useContext(AuthContext);
    const userId = userInfo?._id;

    const { cart, isLoading, fetchCart, clearCart } = useContext(CartContext);

    useFocusEffect(
        useCallback(() => {
            fetchCart();
        }, [fetchCart])
    );

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#f5f8f5]">
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    if (!userId) {
        return (
            <View className="flex-1 items-center justify-center bg-[#f5f8f5] px-8">
                <MaterialIcons name="lock" size={64} color="#ccc" />
                <Text className="text-[#1A1D3B] text-xl font-bold mt-4">Please Login</Text>
                <Text className="text-gray-500 text-center mt-2">You need to be logged in to view your cart.</Text>
                <TouchableOpacity
                    onPress={() => router.push('/auth/login')}
                    className="mt-6 bg-[#FF6B6B] px-8 py-3 rounded-xl shadow-lg shadow-[#FF6B6B]/30"
                >
                    <Text className="text-[#1A1D3B] font-bold">Login Now</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-[#f5f8f5] px-8">
                <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
                    <MaterialIcons name="shopping-basket" size={48} color="#9ca3af" />
                </View>
                <Text className="text-[#1A1D3B] text-2xl font-bold text-center">Your cart is empty</Text>
                <Text className="text-gray-500 text-center mt-2 mb-8">Looks like you haven't added anything to your cart yet.</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/home')}
                    className="bg-[#FF6B6B] px-8 py-3 rounded-xl shadow-lg shadow-[#FF6B6B]/30"
                >
                    <Text className="text-[#1A1D3B] font-bold">Start Exploring</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <SafeAreaView edges={['top']} className="bg-white/80 z-50">
                <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
                    <Text className="text-2xl font-bold text-[#1A1D3B]">Your Cart</Text>
                    <TouchableOpacity onPress={clearCart} className="bg-red-50 px-3 py-1.5 rounded-lg">
                        <Text className="text-red-500 text-xs font-bold">Clear All</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 150 }}>
                {/* Restaurant Info */}
                {cart.restaurantId && (
                    <View className="mb-6 flex-row items-center gap-4 bg-white/40 p-4 rounded-2xl border border-white/50">
                        <View className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden shadow-sm">
                            {cart.restaurantId.image && <Image source={{ uri: cart.restaurantId.image }} className="w-full h-full" />}
                        </View>
                        <View className="flex-1">
                            <Text className="text-[#1A1D3B] font-bold text-lg">{cart.restaurantId.name}</Text>
                            <Text className="text-gray-500 text-xs">Serving your fresh meal</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
                    </View>
                )}

                {/* Items */}
                <View className="gap-4">
                    {cart.items.map((item: any, index: number) => (
                        <View key={index} className="flex-row items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                            <View className="flex-row items-center gap-4 flex-1">
                                <View className="w-16 h-16 rounded-xl bg-[#f5f8f5] overflow-hidden">
                                    {item.image && <Image source={{ uri: item.image }} className="w-full h-full" />}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[#1A1D3B] font-bold text-base">{item.name}</Text>
                                    <View className="flex-row items-center gap-2 mt-1">
                                        <Text className="text-gray-400 text-xs font-medium">x{item.quantity}</Text>
                                        <View className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <Text className="text-[#FF6B6B] font-bold text-sm">${item.price}</Text>
                                    </View>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="font-extrabold text-[#1A1D3B] text-lg">${(item.price * item.quantity).toFixed(2)}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Glass Footer */}
            <View className="absolute bottom-0 left-0 right-0 rounded-t-[32px] overflow-hidden border-t border-white/30" style={{ height: 260 }}>
                <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
                <View className="flex-1 p-6">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500 font-medium">Subtotal</Text>
                        <Text className="font-bold text-[#1A1D3B]">${cart.totalAmount.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-500 font-medium">Delivery Fee</Text>
                        <Text className="font-bold text-[#1A1D3B]">$1.99</Text>
                    </View>

                    <View className="flex-row justify-between mb-6 pt-4 border-t border-gray-100/50">
                        <View>
                            <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Amount</Text>
                            <Text className="text-2xl font-extrabold text-[#1A1D3B]">${(cart.totalAmount + 1.99).toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/checkout')}
                            className="bg-[#FF6B6B] px-10 py-4 rounded-2xl shadow-lg shadow-[#FF6B6B]/40 items-center justify-center flex-row gap-2"
                        >
                            <Text className="text-[#1A1D3B] text-base font-bold">Checkout</Text>
                            <MaterialIcons name="arrow-forward" size={20} color="#1A1D3B" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    absoluteFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    }
});
