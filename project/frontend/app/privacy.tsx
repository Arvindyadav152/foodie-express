import { View, Text, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                        <MaterialIcons name="chevron-left" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-[#1A1D3B]">Privacy Policy</Text>
                    <View className="w-10" />
                </View>

                <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
                    {/* Last Updated */}
                    <Text className="text-gray-400 text-xs mb-6">Last updated: January 2026</Text>

                    {/* Introduction */}
                    <Text className="text-2xl font-black text-[#1A1D3B] mb-3">Your Privacy Matters</Text>
                    <Text className="text-gray-600 leading-6 mb-6">
                        At FoodieExpress, we are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data.
                    </Text>

                    {/* Section 1 */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-[#1A1D3B] mb-2">1. Information We Collect</Text>
                        <Text className="text-gray-600 leading-6">
                            • <Text className="font-bold">Personal Information:</Text> Name, email, phone number, address{'\n'}
                            • <Text className="font-bold">Payment Information:</Text> UPI ID, card details (securely encrypted){'\n'}
                            • <Text className="font-bold">Location Data:</Text> For delivery and restaurant recommendations{'\n'}
                            • <Text className="font-bold">Order History:</Text> Your past orders and preferences
                        </Text>
                    </View>

                    {/* Section 2 */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-[#1A1D3B] mb-2">2. How We Use Your Data</Text>
                        <Text className="text-gray-600 leading-6">
                            • Process and deliver your food orders{'\n'}
                            • Send order updates and notifications{'\n'}
                            • Personalize your food recommendations{'\n'}
                            • Improve our services and user experience{'\n'}
                            • Prevent fraud and ensure platform security
                        </Text>
                    </View>

                    {/* Section 3 */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-[#1A1D3B] mb-2">3. Data Sharing</Text>
                        <Text className="text-gray-600 leading-6">
                            We share your information only with:{'\n\n'}
                            • <Text className="font-bold">Restaurants:</Text> To prepare your order{'\n'}
                            • <Text className="font-bold">Delivery Partners:</Text> To deliver your food{'\n'}
                            • <Text className="font-bold">Payment Processors:</Text> To process transactions{'\n'}
                            • <Text className="font-bold">Legal Authorities:</Text> When required by law
                        </Text>
                    </View>

                    {/* Section 4 */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-[#1A1D3B] mb-2">4. Data Security</Text>
                        <Text className="text-gray-600 leading-6">
                            • All data is encrypted using industry-standard SSL/TLS{'\n'}
                            • Payment information is PCI-DSS compliant{'\n'}
                            • Regular security audits are conducted{'\n'}
                            • Access to data is restricted to authorized personnel only
                        </Text>
                    </View>

                    {/* Section 5 */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-[#1A1D3B] mb-2">5. Your Rights</Text>
                        <Text className="text-gray-600 leading-6">
                            You have the right to:{'\n\n'}
                            • Access your personal data{'\n'}
                            • Correct inaccurate information{'\n'}
                            • Delete your account and data{'\n'}
                            • Opt-out of marketing communications{'\n'}
                            • Request data portability
                        </Text>
                    </View>

                    {/* Section 6 */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-[#1A1D3B] mb-2">6. Cookies & Tracking</Text>
                        <Text className="text-gray-600 leading-6">
                            We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver personalized content. You can manage cookie preferences in your device settings.
                        </Text>
                    </View>

                    {/* Section 7 */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-[#1A1D3B] mb-2">7. Children's Privacy</Text>
                        <Text className="text-gray-600 leading-6">
                            Our services are not intended for users under 18 years of age. We do not knowingly collect personal information from children.
                        </Text>
                    </View>

                    {/* Contact */}
                    <View className="bg-[#3b82f6]/10 p-4 rounded-2xl mb-10">
                        <Text className="text-[#1A1D3B] font-bold mb-1">Privacy Concerns?</Text>
                        <Text className="text-gray-600 text-sm">Contact our Data Protection Officer at privacy@foodieexpress.com</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
