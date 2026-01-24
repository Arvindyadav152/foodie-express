import { View, Text, TouchableOpacity, Image, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LandingScreen() {
    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView className="flex-1">
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Header */}
                    <View className="items-center mt-10 mb-8 px-6">
                        <View className="w-20 h-20 bg-[#f5f8f5] rounded-full items-center justify-center mb-4 shadow-sm">
                            <MaterialIcons name="restaurant-menu" size={40} color="#FF6B6B" />
                        </View>
                        <Text className="text-4xl font-extrabold text-[#1A1D3B] text-center">FoodieHub</Text>
                        <Text className="text-gray-500 text-center mt-2 px-8">
                            The complete food delivery ecosystem. Select your role to get started.
                        </Text>
                    </View>

                    {/* Role Cards */}
                    <View className="px-6 gap-6">

                        {/* Customer */}
                        <Link href="/onboarding" asChild>
                            <TouchableOpacity
                                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden"
                                style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 }}
                            >
                                <View className="absolute top-0 right-0 p-4 opacity-10">
                                    <MaterialIcons name="person" size={100} color="#1A1D3B" />
                                </View>
                                <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mb-4">
                                    <MaterialIcons name="person" size={24} color="#FF6B6B" />
                                </View>
                                <Text className="text-xl font-bold text-[#1A1D3B] mb-1">Customer App</Text>
                                <Text className="text-gray-500 mb-4 text-sm">Browse restaurants, place orders, and track deliveries in real-time.</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-[#FF6B6B] font-bold mr-2">Login as Customer</Text>
                                    <MaterialIcons name="arrow-forward" size={16} color="#FF6B6B" />
                                </View>
                            </TouchableOpacity>
                        </Link>

                        {/* Vendor */}
                        <Link href="/auth/login?role=vendor" asChild>
                            <TouchableOpacity
                                className="bg-[#1A1D3B] p-6 rounded-3xl shadow-md border border-gray-800 relative overflow-hidden"
                            >
                                <View className="absolute top-0 right-0 p-4 opacity-10">
                                    <MaterialIcons name="storefront" size={100} color="white" />
                                </View>
                                <View className="w-12 h-12 bg-white/10 rounded-full items-center justify-center mb-4">
                                    <MaterialIcons name="storefront" size={24} color="#FF6B6B" />
                                </View>
                                <Text className="text-xl font-bold text-white mb-1">Vendor Dashboard</Text>
                                <Text className="text-gray-400 mb-4 text-sm">Manage menu items, view real-time stats, and process incoming orders.</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-[#FF6B6B] font-bold mr-2">Login as Vendor</Text>
                                    <MaterialIcons name="arrow-forward" size={16} color="#FF6B6B" />
                                </View>
                            </TouchableOpacity>
                        </Link>

                        {/* Driver */}
                        <Link href="/auth/login?role=driver" asChild>
                            <TouchableOpacity
                                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden"
                                style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 }}
                            >
                                <View className="absolute top-0 right-0 p-4 opacity-10">
                                    <MaterialIcons name="delivery-dining" size={100} color="#1A1D3B" />
                                </View>
                                <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-4">
                                    <MaterialIcons name="delivery-dining" size={24} color="#3b82f6" />
                                </View>
                                <Text className="text-xl font-bold text-[#1A1D3B] mb-1">Driver App</Text>
                                <Text className="text-gray-500 mb-4 text-sm">Accept delivery jobs, view routes, and manage earnings.</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-blue-500 font-bold mr-2">Login as Driver</Text>
                                    <MaterialIcons name="arrow-forward" size={16} color="#3b82f6" />
                                </View>
                            </TouchableOpacity>
                        </Link>

                    </View>

                    <Text className="text-center text-gray-400 text-xs mt-10">FoodiesHub v1.0.1 • Built with React Native</Text>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
