import { View, Text, TouchableOpacity, ScrollView, StatusBar, Linking, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { router } from 'expo-router';
import api from '../../utils/api';

export default function HelpSupportScreen() {
    const { userInfo } = useContext(AuthContext);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [showContactForm, setShowContactForm] = useState(false);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const faqs = [
        {
            category: 'Orders',
            icon: 'receipt-outline',
            color: '#3b82f6',
            questions: [
                { q: 'How do I accept an order?', a: 'Go to Orders tab → Available section → Tap on order → Click "Accept Order" button.' },
                { q: 'What if customer is not available?', a: 'Try calling the customer. If unreachable for 5 mins, contact support to mark as undeliverable.' },
                { q: 'How to verify delivery?', a: 'Ask customer for the 4-digit PIN shown in their app. Enter it to complete delivery.' },
            ]
        },
        {
            category: 'Earnings',
            icon: 'wallet-outline',
            color: '#22c55e',
            questions: [
                { q: 'When do I get paid?', a: 'Earnings are settled weekly on Mondays. You can request instant withdrawal for a small fee.' },
                { q: 'How is my earning calculated?', a: 'You earn 15% of order value + tips. Surge pricing may apply during peak hours.' },
                { q: 'Why is my payout pending?', a: 'Payouts take 2-3 business days to reflect in your bank account after initiation.' },
            ]
        },
        {
            category: 'Account',
            icon: 'person-outline',
            color: '#8b5cf6',
            questions: [
                { q: 'How to update my documents?', a: 'Go to Profile → KYC Documents → Upload new documents for re-verification.' },
                { q: 'How to change my vehicle?', a: 'Profile → Vehicle Details → Edit and upload new RC. Changes require 24-48hrs for approval.' },
                { q: 'How to go offline?', a: 'Toggle the Online/Offline switch on the Home screen. You won\'t receive orders when offline.' },
            ]
        },
        {
            category: 'Safety',
            icon: 'shield-checkmark-outline',
            color: '#f97316',
            questions: [
                { q: 'What if I have an accident?', a: 'Your safety comes first! Call emergency services, then report via app. Your insurance covers accidents.' },
                { q: 'How to report unsafe customer?', a: 'Go to order history → Select order → Report Issue → Choose "Safety Concern".' },
                { q: 'Emergency SOS feature?', a: 'Long press the power button 5 times or use SOS in app menu to alert authorities and contacts.' },
            ]
        },
    ];

    const quickLinks = [
        { icon: 'call', label: 'Call Support', color: '#22c55e', action: () => Linking.openURL('tel:+919876543210') },
        { icon: 'logo-whatsapp', label: 'WhatsApp', color: '#25D366', action: () => Linking.openURL('https://wa.me/919876543210') },
        { icon: 'mail', label: 'Email Us', color: '#3b82f6', action: () => Linking.openURL('mailto:driver-support@foodies.com') },
    ];

    const handleSubmitQuery = async () => {
        if (!message.trim()) {
            Alert.alert('Error', 'Please enter your message');
            return;
        }

        setSending(true);
        try {
            await api.post('/support/query', {
                userId: userInfo?._id,
                userType: 'driver',
                message: message.trim(),
            });
            Alert.alert('✅ Submitted', 'Your query has been submitted. We\'ll get back to you within 24 hours.');
            setMessage('');
            setShowContactForm(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to submit. Please try calling support.');
        } finally {
            setSending(false);
        }
    };

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} className="bg-white">
                <View className="px-5 py-4 flex-row items-center gap-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-black text-[#1A1D3B]">Help & Support</Text>
                        <Text className="text-gray-400 text-xs">24/7 assistance</Text>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Quick Links */}
                <View className="flex-row mx-5 mt-6 gap-3">
                    {quickLinks.map((link, idx) => (
                        <TouchableOpacity
                            key={idx}
                            onPress={link.action}
                            className="flex-1 bg-white p-4 rounded-2xl items-center border border-gray-100"
                        >
                            <View className="w-12 h-12 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: `${link.color}15` }}>
                                <Ionicons name={link.icon as any} size={24} color={link.color} />
                            </View>
                            <Text className="text-[#1A1D3B] font-bold text-xs">{link.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Contact Form Toggle */}
                <TouchableOpacity
                    onPress={() => setShowContactForm(!showContactForm)}
                    className="mx-5 mt-6 bg-[#1A1D3B] p-5 rounded-2xl flex-row items-center justify-between"
                >
                    <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 bg-[#FF6B6B]/20 rounded-xl items-center justify-center">
                            <Ionicons name="chatbubble-ellipses" size={20} color="#FF6B6B" />
                        </View>
                        <View>
                            <Text className="text-white font-bold">Submit a Query</Text>
                            <Text className="text-white/50 text-xs">We respond within 24 hours</Text>
                        </View>
                    </View>
                    <Ionicons name={showContactForm ? 'chevron-up' : 'chevron-down'} size={20} color="#FF6B6B" />
                </TouchableOpacity>

                {/* Contact Form */}
                {showContactForm && (
                    <View className="mx-5 mt-3 bg-white p-5 rounded-2xl border border-gray-100">
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl text-[#1A1D3B] min-h-[120px]"
                            placeholder="Describe your issue..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            textAlignVertical="top"
                            value={message}
                            onChangeText={setMessage}
                        />
                        <TouchableOpacity
                            onPress={handleSubmitQuery}
                            disabled={sending}
                            className="bg-[#FF6B6B] mt-4 p-4 rounded-xl items-center flex-row justify-center gap-2"
                        >
                            {sending ? (
                                <ActivityIndicator color="#1A1D3B" />
                            ) : (
                                <>
                                    <Ionicons name="send" size={18} color="#1A1D3B" />
                                    <Text className="text-[#1A1D3B] font-bold">Submit</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* FAQs */}
                <View className="mx-5 mt-6 mb-8">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 ml-2">Frequently Asked Questions</Text>

                    {faqs.map((category, idx) => (
                        <View key={idx} className="mb-3">
                            <TouchableOpacity
                                onPress={() => setActiveCategory(activeCategory === category.category ? null : category.category)}
                                className="bg-white p-4 rounded-2xl flex-row items-center justify-between border border-gray-100"
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${category.color}15` }}>
                                        <Ionicons name={category.icon as any} size={20} color={category.color} />
                                    </View>
                                    <Text className="text-[#1A1D3B] font-bold">{category.category}</Text>
                                </View>
                                <Ionicons
                                    name={activeCategory === category.category ? 'chevron-up' : 'chevron-down'}
                                    size={18}
                                    color="#9ca3af"
                                />
                            </TouchableOpacity>

                            {activeCategory === category.category && (
                                <View className="bg-gray-50 mx-2 mt-2 p-4 rounded-xl">
                                    {category.questions.map((faq, qIdx) => (
                                        <View key={qIdx} className={`${qIdx > 0 ? 'mt-4 pt-4 border-t border-gray-200' : ''}`}>
                                            <Text className="text-[#1A1D3B] font-bold mb-2">{faq.q}</Text>
                                            <Text className="text-gray-500 text-sm leading-5">{faq.a}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
