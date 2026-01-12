import { View, Text, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsOfServiceScreen() {
    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                        <MaterialIcons name="chevron-left" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-[#1A1D3B]">Terms of Service</Text>
                    <View className="w-10" />
                </View>

                <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
                    {/* Last Updated */}
                    <Text className="text-gray-400 text-xs mb-6">Last updated: January 2026</Text>

                    {/* Introduction */}
                    <Text className="text-2xl font-black text-[#1A1D3B] mb-3">Welcome to FoodieExpress</Text>
                    <Text className="text-gray-600 leading-6 mb-6">
                        These Terms of Service govern your use of the FoodieExpress mobile application and website. By accessing or using our services, you agree to be bound by these terms.
                    </Text>

                    {/* Section 1 */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-[#1A1D3B] mb-2">1. Account Registration</Text>
                        <Text className="text-gray-600 leading-6">
                            • You must be at least 18 years old to create an account{'\n'}
                            • You are responsible for maintaining the security of your account{'\n'}
                            • One person may not maintain more than one account{'\n'}
                            • You must provide accurate and complete information
                        </Text>
                    </View>

                    {/* Section 2 */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-[#1A1D3B] mb-2">2. Ordering & Delivery</Text>
                        <Text className="text-gray-600 leading-6">
                            • All orders placed through FoodieExpress are subject to acceptance{'\n'}
                            • Delivery times are estimates and may vary{'\n'}
                            • You agree to be present at the delivery location{'\n'}
                            • Minimum order values may apply based on restaurant and location
                        </Text>
                    </View>

                    {/* Section 3 */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-[#1A1D3B] mb-2">3. Payments & Refunds</Text>
                        <Text className="text-gray-600 leading-6">
                            • We accept UPI, Credit/Debit Cards, and Wallet payments{'\n'}
                            • All prices include applicable taxes{'\n'}
                            • Refunds are processed within 5-7 business days{'\n'}
                            • Promotional codes are subject to terms and conditions
                        </Text>
                    </View>

                    {/* Section 4 */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-[#1A1D3B] mb-2">4. Cancellation Policy</Text>
                        <Text className="text-gray-600 leading-6">
                            • Orders can be cancelled within 60 seconds of placing{'\n'}
                            • Once the restaurant starts preparing, cancellation is not allowed{'\n'}
                            • Cancellation fees may apply in certain cases{'\n'}
                            • Repeated cancellations may result in account restrictions
                        </Text>
                    </View>

                    {/* Section 5 */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-[#1A1D3B] mb-2">5. User Conduct</Text>
                        <Text className="text-gray-600 leading-6">
                            • You agree not to misuse the platform{'\n'}
                            • Abusive behavior towards delivery partners is not tolerated{'\n'}
                            • Fraudulent activities will result in permanent ban{'\n'}
                            • Respect restaurant and partner ratings guidelines
                        </Text>
                    </View>

                    {/* Section 6 */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-[#1A1D3B] mb-2">6. Liability</Text>
                        <Text className="text-gray-600 leading-6">
                            FoodieExpress acts as an intermediary between customers and restaurants. We are not responsible for the quality, safety, or legality of food items. Any disputes regarding food quality should be addressed directly with the restaurant.
                        </Text>
                    </View>

                    {/* Contact */}
                    <View className="bg-[#FF6B6B]/10 p-4 rounded-2xl mb-10">
                        <Text className="text-[#1A1D3B] font-bold mb-1">Questions about our Terms?</Text>
                        <Text className="text-gray-600 text-sm">Contact us at legal@foodieexpress.com</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
