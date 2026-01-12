import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from "expo-blur";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";

export default function TabLayout() {
    const { cartCount } = useContext(CartContext);

    return (
        <View style={{ flex: 1 }}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: Platform.OS === 'ios' ? 25 : 15,
                        left: 20,
                        right: 20,
                        height: 70,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', // High-quality gloss
                        borderRadius: 35,
                        borderTopWidth: 0,
                        paddingBottom: 0,
                        paddingTop: 0,
                        elevation: 10,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        ...Platform.select({
                            ios: {
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 10 },
                                shadowOpacity: 0.1,
                                shadowRadius: 15,
                            },
                            web: {
                                boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
                            } as any,
                            android: {
                                elevation: 8,
                            }
                        }),
                    },
                    tabBarBackground: () => (
                        <BlurView intensity={95} style={[StyleSheet.absoluteFill, { borderRadius: 36, overflow: 'hidden' }]} tint="light" />
                    ),
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: "#FF6B6B",
                    tabBarInactiveTintColor: "#1A1D3B",
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <View className="items-center justify-center">
                                <View className="items-center justify-center w-10 h-10">
                                    <Ionicons name={focused ? "home" : "home-outline"} size={26} color={focused ? "#1A1D3B" : "#9ca3af"} />
                                    {focused && <View className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#FF6B6B]" />}
                                </View>
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="favorites"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <View className="items-center justify-center">
                                <View className="items-center justify-center w-10 h-10">
                                    <Ionicons name={focused ? "heart" : "heart-outline"} size={26} color={focused ? "#1A1D3B" : "#9ca3af"} />
                                    {focused && <View className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#FF6B6B]" />}
                                </View>
                            </View>
                        ),
                    }}
                />

                {/* Middle Cart Button */}
                <Tabs.Screen
                    name="cart"
                    options={{
                        tabBarButton: (props: any) => (
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={props.onPress}
                                className="items-center justify-center"
                                style={{ transform: [{ translateY: -15 }] }}
                            >
                                <View className="w-16 h-16 bg-[#1A1D3B] rounded-full items-center justify-center shadow-xl border-4 border-[#f5f8f5]">
                                    <Ionicons name="cart" size={28} color="#FF6B6B" />
                                    {cartCount > 0 && (
                                        <View className="absolute top-0 right-0 bg-red-500 min-w-[20px] h-5 rounded-full items-center justify-center border-2 border-[#1A1D3B] px-1">
                                            <Text className="text-white text-[9px] font-black">{cartCount}</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="notifications"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <View className="items-center justify-center">
                                <View className="items-center justify-center w-10 h-10">
                                    <Ionicons name={focused ? "notifications" : "notifications-outline"} size={26} color={focused ? "#1A1D3B" : "#9ca3af"} />
                                    {focused && <View className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#FF6B6B]" />}
                                </View>
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <View className="items-center justify-center">
                                <View className="items-center justify-center w-10 h-10">
                                    <Ionicons name={focused ? "person" : "person-outline"} size={26} color={focused ? "#1A1D3B" : "#9ca3af"} />
                                    {focused && <View className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#FF6B6B]" />}
                                </View>
                            </View>
                        ),
                    }}
                />

                <Tabs.Screen name="search" options={{ href: null }} />
            </Tabs>
        </View>
    );
}
