import { View, Text, FlatList, TouchableOpacity, Image, Modal, TextInput, Alert, ScrollView, ActivityIndicator, StatusBar, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import api from '../../utils/api';
import * as ImagePicker from 'expo-image-picker';
import { useRequireAuth } from '../../hooks/useRequireAuth';

export default function MenuManagementScreen() {
    const { vendorId, isLoading: authLoading } = useRequireAuth('vendor');

    const [restaurantId, setRestaurantId] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState('');

    useEffect(() => {
        fetchRestaurantAndMenu();
    }, []);

    const fetchRestaurantAndMenu = async () => {
        try {
            const restRes = await api.get(`/vendor/restaurant/${vendorId}`);
            setRestaurantId(restRes.data._id);
            await fetchMenu(restRes.data._id);
        } catch (error) {
            console.error("Error fetching restaurant:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMenu = async (restId: string) => {
        try {
            const { data } = await api.get(`/menu/${restId}`);
            setMenuItems(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveItem = async () => {
        if (!name || !price || !category || !restaurantId) {
            Alert.alert("Missing Fields", "Please fill name, price and category.");
            return;
        }

        setSaving(true);
        const payload = {
            restaurantId,
            name,
            description,
            price: parseFloat(price),
            category,
            image: image || "https://placehold.co/200x200?text=Food",
            isAvailable: true
        };

        try {
            if (editingItem) {
                await api.put(`/menu/${editingItem._id}`, payload);
            } else {
                await api.post('/menu', payload);
            }
            await fetchMenu(restaurantId);
            closeModal();
        } catch (error) {
            Alert.alert("Error", "Failed to save item");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteItem = async (id: string | any) => {
        Alert.alert("Delete Item", "This cannot be undone.", [
            { text: "Keep it" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await api.delete(`/menu/${id}`);
                        fetchMenu(restaurantId!);
                    } catch (error) {
                        Alert.alert("Error", "Failed to delete item");
                    }
                }
            }
        ]);
    };

    const openModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setName(item.name);
            setDescription(item.description);
            setPrice(item.price.toString());
            setCategory(item.category);
            setImage(item.image);
        } else {
            setEditingItem(null);
            setName('');
            setDescription('');
            setPrice('');
            setCategory('');
            setImage('');
        }
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingItem(null);
    };

    const pickImage = async () => {
        // Placeholder for image picker logic
        // In a real app, use Expo ImagePicker
        setImage('https://placehold.co/150'); // Mock
    };

    const toggleAvailability = async (item: any, value: boolean) => {
        try {
            await api.put(`/menu/${item._id}`, { ...item, isAvailable: value });
            await fetchMenu(restaurantId!);
        } catch (error) {
            Alert.alert("Error", "Failed to update availability");
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white mx-5 mb-4 p-5 rounded-[32px] shadow-sm border border-gray-50 flex-row gap-4">
            <View className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50">
                <Image
                    source={{ uri: item.image || 'https://placehold.co/200x200?text=Food' }}
                    className="w-full h-full"
                />
                {!item.isAvailable && (
                    <View className="absolute inset-0 bg-black/40 items-center justify-center">
                        <Text className="text-white text-[8px] font-black uppercase tracking-widest">Sold Out</Text>
                    </View>
                )}
            </View>
            <View className="flex-1 justify-between">
                <View>
                    <View className="flex-row justify-between items-start">
                        <Text className={`font-black text-lg flex-1 mr-2 ${item.isAvailable ? 'text-[#1A1D3B]' : 'text-gray-400'}`} numberOfLines={1}>{item.name}</Text>
                        <Text className={`font-black text-lg ${item.isAvailable ? 'text-[#FF6B6B]' : 'text-gray-300'}`}>${item.price.toFixed(2)}</Text>
                    </View>
                    <Text className="text-gray-400 text-[10px] font-medium uppercase tracking-widest" numberOfLines={1}>{item.category}</Text>
                </View>

                <View className="flex-row justify-between items-center mt-2">
                    <View className="flex-row items-center gap-2">
                        <Switch
                            value={item.isAvailable}
                            onValueChange={(val) => toggleAvailability(item, val)}
                            trackColor={{ true: '#FF6B6B', false: '#d1d5db' }}
                            thumbColor="#fff"
                            style={{ transform: [{ scale: 0.7 }] }}
                        />
                        <Text className="text-[9px] font-black uppercase tracking-widest text-gray-400">{item.isAvailable ? 'Available' : 'Out of Stock'}</Text>
                    </View>
                    <View className="flex-row gap-2">
                        <TouchableOpacity onPress={() => openModal(item)} className="w-8 h-8 rounded-xl bg-[#f5f8f5] items-center justify-center">
                            <MaterialIcons name="edit" size={16} color="#1A1D3B" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteItem(item._id)} className="w-8 h-8 rounded-xl bg-red-50 items-center justify-center">
                            <MaterialIcons name="delete" size={16} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#f5f8f5]">
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <StatusBar barStyle="dark-content" />

            <SafeAreaView edges={['top']} className="bg-white/80 z-50">
                <View className="px-5 py-3 flex-row items-center justify-between border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-2xl bg-[#f5f8f5] items-center justify-center">
                        <Ionicons name="backspace" size={24} color="#1A1D3B" />
                    </TouchableOpacity>
                    <Text className="text-xl font-black text-[#1A1D3B] uppercase tracking-tight">Food Menu</Text>
                    <TouchableOpacity onPress={() => openModal()} className="w-10 h-10 bg-[#1A1D3B] rounded-2xl items-center justify-center shadow-lg">
                        <Ionicons name="add" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <FlatList
                data={menuItems}
                keyExtractor={(item: any) => item._id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center py-20 px-10">
                        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
                            <Ionicons name="restaurant-outline" size={40} color="#9ca3af" />
                        </View>
                        <Text className="text-[#1A1D3B] text-xl font-black text-center">Your Menu is Empty</Text>
                        <Text className="text-gray-500 text-center mt-2 font-medium">Add your signature dishes and start selling!</Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} animationType="slide" presentationStyle="formSheet">
                <View className="flex-1 bg-white">
                    <View className="px-6 py-6 border-b border-gray-100 flex-row items-center justify-between">
                        <TouchableOpacity onPress={closeModal}>
                            <Text className="text-gray-400 font-black uppercase text-xs tracking-widest">Cancel</Text>
                        </TouchableOpacity>
                        <Text className="text-lg font-black text-[#1A1D3B] uppercase tracking-tight">{editingItem ? 'Edit Dish' : 'New Dish'}</Text>
                        <TouchableOpacity onPress={handleSaveItem} disabled={saving}>
                            {saving ? (
                                <ActivityIndicator size="small" color="#FF6B6B" />
                            ) : (
                                <Text className="text-[#FF6B6B] font-black uppercase text-xs tracking-widest">Done</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                        <TouchableOpacity className="h-48 w-full bg-gray-50 rounded-[40px] items-center justify-center mb-8 border border-dashed border-gray-200 overflow-hidden">
                            {image ? (
                                <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <View className="items-center">
                                    <View className="w-16 h-16 bg-[#1A1D3B] rounded-3xl items-center justify-center mb-3">
                                        <Ionicons name="camera" size={28} color="#FF6B6B" />
                                    </View>
                                    <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Add Dish Photo</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <View className="gap-6">
                            <View>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-2">Dish Name</Text>
                                <TextInput
                                    className="bg-gray-50 px-6 h-14 rounded-2xl text-[#1A1D3B] font-bold border border-gray-50"
                                    value={name} onChangeText={setName} placeholder="e.g. Truffle Mushroom Burger" placeholderTextColor="#9ca3af"
                                />
                            </View>

                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-2">Price ($)</Text>
                                    <TextInput
                                        className="bg-gray-50 px-6 h-14 rounded-2xl text-[#1A1D3B] font-bold border border-gray-50"
                                        value={price} onChangeText={setPrice} placeholder="9.99" keyboardType="numeric" placeholderTextColor="#9ca3af"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-2">Category</Text>
                                    <TextInput
                                        className="bg-gray-50 px-6 h-14 rounded-2xl text-[#1A1D3B] font-bold border border-gray-50"
                                        value={category} onChangeText={setCategory} placeholder="e.g. Burgers" placeholderTextColor="#9ca3af"
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-2">Description</Text>
                                <TextInput
                                    className="bg-gray-50 p-6 rounded-[32px] text-[#1A1D3B] font-medium h-32 border border-gray-50"
                                    value={description} onChangeText={setDescription} placeholder="Describe your masterpiece..." multiline textAlignVertical="top" placeholderTextColor="#9ca3af"
                                />
                            </View>
                        </View>
                        <View className="h-20" />
                    </ScrollView>
                </View>
            </Modal>
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
