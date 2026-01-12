import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';

export default function LiveChatScreen() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: '1', text: 'Hello! How can I help you today?', sender: 'support', time: '10:00 AM' }
    ]);

    const sendMessage = () => {
        if (!message.trim()) return;

        const newMessage = {
            id: Date.now().toString(),
            text: message,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMessage]);
        setMessage('');

        // Mock reply
        setTimeout(() => {
            const reply = {
                id: (Date.now() + 1).toString(),
                text: "Thanks for reaching out! An agent will be with you shortly.",
                sender: 'support',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, reply]);
        }, 1000);
    };

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center p-4 bg-white border-b border-gray-100 shadow-sm">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <MaterialIcons name="arrow-back" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <View className="flex-1 flex-row items-center gap-3">
                        <View className="relative">
                            <Image
                                source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
                                className="w-10 h-10 rounded-full bg-gray-200"
                            />
                            <View className="absolute bottom-0 right-0 w-3 h-3 bg-[#FF6B6B] rounded-full border-2 border-white" />
                        </View>
                        <View>
                            <Text className="text-[#1A1D3B] font-bold text-lg">Customer Support</Text>
                            <Text className="text-[#FF6B6B] text-xs font-bold">Online</Text>
                        </View>
                    </View>
                    <TouchableOpacity className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full">
                        <MaterialIcons name="phone" size={20} color="#1A1D3B" />
                    </TouchableOpacity>
                </View>

                {/* Chat Area */}
                <ScrollView
                    className="flex-1 px-4 py-4"
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Text className="text-center text-gray-400 text-xs mb-6">Today, {new Date().toLocaleDateString()}</Text>

                    {messages.map((msg) => (
                        <View
                            key={msg.id}
                            className={`mb-4 flex-row ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.sender === 'support' && (
                                <Image
                                    source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
                                    className="w-8 h-8 rounded-full bg-gray-200 mr-2 mt-1"
                                />
                            )}
                            <View
                                className={`px-4 py-3 rounded-2xl max-w-[80%] ${msg.sender === 'user'
                                        ? 'bg-[#FF6B6B] rounded-tr-none'
                                        : 'bg-white border border-gray-100 rounded-tl-none'
                                    } shadow-sm`}
                            >
                                <Text
                                    className={`text-base ${msg.sender === 'user' ? 'text-white' : 'text-[#1A1D3B]'
                                        }`}
                                >
                                    {msg.text}
                                </Text>
                                <Text
                                    className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-white/80' : 'text-gray-400'
                                        }`}
                                >
                                    {msg.time}
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Input Area */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
                >
                    <View className="p-4 bg-white border-t border-gray-100 flex-row items-center gap-3">
                        <TouchableOpacity className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full border border-gray-100">
                            <MaterialIcons name="add" size={24} color="#9ca3af" />
                        </TouchableOpacity>

                        <View className="flex-1 bg-gray-50 h-12 rounded-full px-4 flex-row items-center border border-gray-100">
                            <TextInput
                                className="flex-1 text-base text-[#1A1D3B]"
                                placeholder="Type a message..."
                                placeholderTextColor="#9ca3af"
                                value={message}
                                onChangeText={setMessage}
                                multiline
                            />
                        </View>

                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={!message.trim()}
                            className={`w-12 h-12 items-center justify-center rounded-full shadow-md ${message.trim() ? 'bg-[#FF6B6B]' : 'bg-gray-200'
                                }`}
                        >
                            <MaterialIcons name="send" size={20} color="white" className="ml-1" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
