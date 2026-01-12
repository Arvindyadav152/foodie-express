import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect, useContext } from 'react';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import api from '../utils/api';

export default function CheckoutScreen() {
    const { userInfo } = useContext(AuthContext);
    const userId = userInfo?._id;

    const { cart, isLoading, fetchCart } = useContext(CartContext);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [instructions, setInstructions] = useState('');
    const [availablePromos, setAvailablePromos] = useState<any[]>([]);
    const [appliedPromo, setAppliedPromo] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [promoModalVisible, setPromoModalVisible] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [addAddressModalVisible, setAddAddressModalVisible] = useState(false);
    const [newAddressLabel, setNewAddressLabel] = useState('');
    const [newAddressStreet, setNewAddressStreet] = useState('');
    const [newAddressCity, setNewAddressCity] = useState('');

    // Addresses State
    const [addresses, setAddresses] = useState([
        { id: '1', label: 'Home', street: '123 Main St, Apt 4B', city: 'New York', zip: '10001' },
        { id: '2', label: 'Work', street: '456 Tech Blvd, Suite 200', city: 'New York', zip: '10010' }
    ]);
    const [selectedAddress, setSelectedAddress] = useState(addresses[0]);
    const [paymentMethod] = useState('card');

    const handleAddNewAddress = () => {
        if (!newAddressLabel.trim() || !newAddressStreet.trim() || !newAddressCity.trim()) {
            Alert.alert('Missing Info', 'Please fill all address fields.');
            return;
        }
        const newAddr = {
            id: Date.now().toString(),
            label: newAddressLabel.trim(),
            street: newAddressStreet.trim(),
            city: newAddressCity.trim(),
            zip: '00000'
        };
        setAddresses(prev => [...prev, newAddr]);
        setSelectedAddress(newAddr);
        setNewAddressLabel('');
        setNewAddressStreet('');
        setNewAddressCity('');
        setAddAddressModalVisible(false);
        setAddressModalVisible(false);
    };

    const fetchPromos = async () => {
        try {
            const { data } = await api.get('/promos');
            setAvailablePromos(data.filter((p: any) => p.isActive));
        } catch (error) {
            console.error("Error fetching promos:", error);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const handleApplyPromo = (promo: any) => {
        if (cart && cart.totalAmount < (promo.minOrderAmount || 0)) {
            Alert.alert("Requirement Not Met", `This coupon requires a minimum order of $${promo.minOrderAmount}`);
            return;
        }

        let discount = 0;
        if (promo.discountType === 'percentage') {
            discount = (cart!.totalAmount * promo.discountValue) / 100;
            if (promo.maxDiscountAmount && discount > promo.maxDiscountAmount) {
                discount = promo.maxDiscountAmount;
            }
        } else {
            discount = promo.discountValue;
        }

        setDiscountAmount(discount);
        setAppliedPromo(promo);
        setPromoModalVisible(false);
    };

    const handlePlaceOrder = async () => {
        if (!cart || cart.items.length === 0 || !userId) return;
        setPlacingOrder(true);

        try {
            const response = await api.post('/orders', {
                userId,
                restaurantId: cart.restaurantId._id,
                items: cart.items,
                totalAmount: (cart.totalAmount + 1.99) - discountAmount,
                deliveryAddress: selectedAddress,
                paymentMethod,
                instructions,
                promoCode: appliedPromo?.code,
                discountAmount
            });

            const orderData = response.data;
            await fetchCart(); // Refresh cart to clear it
            router.replace({
                pathname: '/order-success',
                params: {
                    orderId: orderData._id,
                    otp: orderData.verificationCode
                }
            });
        } catch (error) {
            console.error(error);
            Alert.alert("Order Failed", "Something went wrong while placing your order. Please try again.");
        } finally {
            setPlacingOrder(false);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#f5f8f5]">
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-[#f5f8f5]">
                <MaterialIcons name="shopping-basket" size={64} color="#ccc" />
                <Text className="text-gray-500 mt-4 font-bold">Your cart is empty</Text>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} className="mt-4">
                    <Text className="text-[#FF6B6B] font-bold">Go back to Home</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const total = cart.totalAmount + 1.99;

    return (
        <View className="flex-1 bg-[#f5f8f5]">
            <SafeAreaView edges={['top']} className="bg-white z-50">
                <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.push('/(tabs)/cart')} className="w-10 h-10 items-center justify-center rounded-full bg-[#f6f8f6]">
                            <MaterialIcons name="arrow-back" size={24} color="#1A1D3B" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-[#1A1D3B] ml-4">Finalize Order</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/home')} className="w-10 h-10 items-center justify-center rounded-full bg-[#FF6B6B]/10">
                        <MaterialIcons name="home" size={22} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Delivery Address Section */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-[#1A1D3B] font-extrabold text-lg">Delivery Address</Text>
                        <TouchableOpacity onPress={() => setAddressModalVisible(true)}>
                            <Text className="text-[#FF6B6B] font-bold text-sm">Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="gap-3">
                        {addresses.map((addr) => (
                            <TouchableOpacity
                                key={addr.id}
                                onPress={() => setSelectedAddress(addr)}
                                className={`p-4 rounded-2xl border flex-row items-center gap-4 ${selectedAddress.id === addr.id ? 'bg-white border-[#FF6B6B] shadow-md' : 'bg-white/40 border-transparent'}`}
                            >
                                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedAddress.id === addr.id ? 'border-[#FF6B6B]' : 'border-gray-200'}`}>
                                    {selectedAddress.id === addr.id && <View className="w-3 h-3 rounded-full bg-[#FF6B6B]" />}
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center gap-2">
                                        <MaterialIcons name={addr.label === 'Home' ? 'home' : 'work'} size={16} color={selectedAddress.id === addr.id ? '#FF6B6B' : '#9ca3af'} />
                                        <Text className={`font-bold ${selectedAddress.id === addr.id ? 'text-[#1A1D3B]' : 'text-gray-500'}`}>{addr.label}</Text>
                                    </View>
                                    <Text className="text-gray-400 text-xs mt-1 font-medium">{addr.street}, {addr.city}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Order Summary */}
                <View className="mb-8">
                    <Text className="text-[#1A1D3B] font-extrabold text-lg mb-4">Order Summary</Text>
                    <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
                        <View className="flex-row items-center gap-2 mb-4 pb-4 border-b border-gray-50">
                            <MaterialIcons name="restaurant" size={18} color="#FF6B6B" />
                            <Text className="font-bold text-[#1A1D3B]">{cart.restaurantId?.name || 'Restaurant'}</Text>
                        </View>
                        {cart.items.map((item: any, idx: number) => (
                            <View key={idx} className="flex-row justify-between mb-3">
                                <Text className="text-gray-600 text-sm font-medium"><Text className="font-bold">x{item.quantity}</Text> {item.name}</Text>
                                <Text className="text-[#1A1D3B] font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Order Instructions */}
                <View className="mb-8">
                    <Text className="text-[#1A1D3B] font-extrabold text-lg mb-4">Special Instructions</Text>
                    <View className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                        <TextInput
                            placeholder="e.g. Extra spicy, don't ring the bell, etc."
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={3}
                            value={instructions}
                            onChangeText={setInstructions}
                            style={{ textAlignVertical: 'top' }}
                            className="text-[#1A1D3B] text-sm font-medium h-24"
                        />
                    </View>
                </View>

                {/* Promo Code Section */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-[#1A1D3B] font-extrabold text-lg">Applied Coupon</Text>
                        <TouchableOpacity onPress={() => setPromoModalVisible(true)}>
                            <Text className="text-[#FF6B6B] font-bold text-sm">View Offers</Text>
                        </TouchableOpacity>
                    </View>

                    {appliedPromo ? (
                        <View className="bg-white p-4 rounded-2xl border border-[#FF6B6B] flex-row items-center gap-4 shadow-sm relative">
                            <View className="w-12 h-12 bg-[#FF6B6B]/10 rounded-xl items-center justify-center">
                                <MaterialIcons name="local-offer" size={24} color="#FF6B6B" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[#1A1D3B] font-black uppercase tracking-tighter">{appliedPromo.code}</Text>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-3">
                                    Saved ${discountAmount.toFixed(2)} on this order
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => { setAppliedPromo(null); setDiscountAmount(0); }}>
                                <MaterialIcons name="close" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => setPromoModalVisible(true)}
                            className="bg-white p-4 rounded-2xl border border-dashed border-gray-200 flex-row items-center gap-4 shadow-sm"
                        >
                            <View className="w-12 h-12 bg-gray-50 rounded-xl items-center justify-center">
                                <MaterialIcons name="local-offer" size={24} color="#9ca3af" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 font-bold">Select a coupon to save big</Text>
                                <Text className="text-gray-300 text-[10px] font-black uppercase tracking-widest">Limited time offers available</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Payment Method */}
                <View className="mb-8">
                    <Text className="text-[#1A1D3B] font-extrabold text-lg mb-4">Payment Method</Text>
                    <View className="bg-white p-4 rounded-2xl border border-gray-50 flex-row items-center gap-4 shadow-sm">
                        <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center">
                            <MaterialIcons name="credit-card" size={24} color="#1d4ed8" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[#1A1D3B] font-bold">MasterCard •••• 4242</Text>
                            <Text className="text-gray-400 text-xs font-medium">Expires 12/28</Text>
                        </View>
                        <MaterialIcons name="check-circle" size={24} color="#FF6B6B" />
                    </View>
                </View>

            </ScrollView>

            {/* Glass Footer */}
            <View className="absolute bottom-0 left-0 right-0 rounded-t-[32px] overflow-hidden border-t border-white/20" style={{ height: 180 }}>
                <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
                <View className="flex-1 p-6">
                    {discountAmount > 0 && (
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Coupon Savings</Text>
                            <Text className="text-[#FF6B6B] text-[10px] font-black uppercase tracking-widest">-${discountAmount.toFixed(2)}</Text>
                        </View>
                    )}
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total to Pay</Text>
                            <Text className="text-3xl font-black text-[#1A1D3B]">${((cart.totalAmount + 1.99) - discountAmount).toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handlePlaceOrder}
                            disabled={placingOrder}
                            className={`px-8 py-4 rounded-2xl shadow-xl flex-row items-center gap-3 ${placingOrder ? 'bg-gray-200' : 'bg-[#FF6B6B] shadow-[#FF6B6B]/40'}`}
                        >
                            {placingOrder ? (
                                <ActivityIndicator color="#1A1D3B" />
                            ) : (
                                <>
                                    <Text className="text-[#1A1D3B] text-lg font-black">Confirm</Text>
                                    <MaterialIcons name="shopping-bag" size={20} color="#1A1D3B" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {/* Coupon Modal */}
            {promoModalVisible && (
                <View className="absolute inset-0 z-[100] items-center justify-center p-6">
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setPromoModalVisible(false)}
                        className="absolute inset-0 bg-[#1A1D3B]/60"
                    />
                    <View className="bg-white w-full rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                        <View className="flex-row items-center gap-3 mb-6">
                            <View className="w-12 h-12 rounded-2xl bg-[#FF6B6B]/10 items-center justify-center">
                                <MaterialIcons name="local-offer" size={24} color="#FF6B6B" />
                            </View>
                            <View>
                                <Text className="text-[#1A1D3B] text-xl font-black uppercase tracking-tighter">Available Offers</Text>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Save big on your feast</Text>
                            </View>
                        </View>

                        <ScrollView className="max-h-[300px] mb-8">
                            <View className="gap-3">
                                {availablePromos.length > 0 ? availablePromos.map((promo) => (
                                    <TouchableOpacity
                                        key={promo._id}
                                        onPress={() => handleApplyPromo(promo)}
                                        className="bg-gray-50 p-4 rounded-3xl border border-gray-100"
                                    >
                                        <View className="flex-row justify-between items-center mb-2">
                                            <Text className="text-[#1A1D3B] font-black uppercase tracking-widest">{promo.code}</Text>
                                            <Text className="text-[#FF6B6B] font-black text-xs uppercase tracking-widest">
                                                {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `$${promo.discountValue} OFF`}
                                            </Text>
                                        </View>
                                        <Text className="text-gray-400 text-[10px] font-medium leading-4 italic">
                                            Min order ${promo.minOrderAmount} • Expires {new Date(promo.expiryDate).toLocaleDateString()}
                                        </Text>
                                    </TouchableOpacity>
                                )) : (
                                    <View className="items-center py-8">
                                        <MaterialIcons name="sentiment-dissatisfied" size={40} color="#ccc" />
                                        <Text className="text-gray-400 font-bold mt-2">No active coupons available</Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            onPress={() => setPromoModalVisible(false)}
                            className="py-4 rounded-2xl items-center"
                        >
                            <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Maybe Later</Text>
                        </TouchableOpacity>

                        {/* Decoration */}
                        <View className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FF6B6B] rounded-full opacity-5" />
                    </View>
                </View>
            )}

            {/* Address Edit Modal */}
            {addressModalVisible && (
                <View className="absolute inset-0 z-[100] items-center justify-center p-6">
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setAddressModalVisible(false)}
                        className="absolute inset-0 bg-[#1A1D3B]/60"
                    />
                    <View className="bg-white w-full rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                        <View className="flex-row items-center gap-3 mb-6">
                            <View className="w-12 h-12 rounded-2xl bg-[#FF6B6B]/10 items-center justify-center">
                                <MaterialIcons name="location-on" size={24} color="#FF6B6B" />
                            </View>
                            <View>
                                <Text className="text-[#1A1D3B] text-xl font-black uppercase tracking-tighter">Select Address</Text>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Choose your delivery location</Text>
                            </View>
                        </View>

                        <View className="gap-3 mb-8">
                            {addresses.map((addr) => (
                                <TouchableOpacity
                                    key={addr.id}
                                    onPress={() => {
                                        setSelectedAddress(addr);
                                        setAddressModalVisible(false);
                                    }}
                                    className={`p-4 rounded-3xl border flex-row items-center gap-4 ${selectedAddress.id === addr.id ? 'bg-[#FF6B6B]/5 border-[#FF6B6B]' : 'bg-gray-50 border-gray-100'}`}
                                >
                                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedAddress.id === addr.id ? 'border-[#FF6B6B]' : 'border-gray-200'}`}>
                                        {selectedAddress.id === addr.id && <View className="w-3 h-3 rounded-full bg-[#FF6B6B]" />}
                                    </View>
                                    <View className="flex-1">
                                        <View className="flex-row items-center gap-2">
                                            <MaterialIcons name={addr.label === 'Home' ? 'home' : 'work'} size={16} color={selectedAddress.id === addr.id ? '#FF6B6B' : '#9ca3af'} />
                                            <Text className={`font-bold ${selectedAddress.id === addr.id ? 'text-[#1A1D3B]' : 'text-gray-500'}`}>{addr.label}</Text>
                                        </View>
                                        <Text className="text-gray-400 text-xs mt-1 font-medium">{addr.street}, {addr.city}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Add New Address Button */}
                        <TouchableOpacity
                            onPress={() => setAddAddressModalVisible(true)}
                            className="py-4 mb-4 rounded-2xl items-center bg-[#FF6B6B]/10 flex-row justify-center gap-2"
                        >
                            <MaterialIcons name="add-location-alt" size={20} color="#FF6B6B" />
                            <Text className="text-[#FF6B6B] font-black text-[10px] uppercase tracking-widest">Add New Address</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setAddressModalVisible(false)}
                            className="py-4 rounded-2xl items-center"
                        >
                            <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Done</Text>
                        </TouchableOpacity>

                        {/* Decoration */}
                        <View className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FF6B6B] rounded-full opacity-5" />
                    </View>
                </View>
            )}

            {/* Add New Address Modal */}
            {addAddressModalVisible && (
                <View className="absolute inset-0 z-[110] items-center justify-center p-6">
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setAddAddressModalVisible(false)}
                        className="absolute inset-0 bg-[#1A1D3B]/70"
                    />
                    <View className="bg-white w-full rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                        <View className="flex-row items-center gap-3 mb-6">
                            <View className="w-12 h-12 rounded-2xl bg-[#FF6B6B]/10 items-center justify-center">
                                <MaterialIcons name="add-location" size={24} color="#FF6B6B" />
                            </View>
                            <View>
                                <Text className="text-[#1A1D3B] text-xl font-black uppercase tracking-tighter">New Address</Text>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Add a new delivery location</Text>
                            </View>
                        </View>

                        <View className="gap-4 mb-8">
                            <View>
                                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Label (e.g., Home, Office)</Text>
                                <TextInput
                                    placeholder="e.g. Home"
                                    placeholderTextColor="#ccc"
                                    value={newAddressLabel}
                                    onChangeText={setNewAddressLabel}
                                    className="bg-gray-50 rounded-2xl px-4 py-3 text-[#1A1D3B] font-medium"
                                />
                            </View>
                            <View>
                                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Street Address</Text>
                                <TextInput
                                    placeholder="e.g. 123 Main St, Apt 5"
                                    placeholderTextColor="#ccc"
                                    value={newAddressStreet}
                                    onChangeText={setNewAddressStreet}
                                    className="bg-gray-50 rounded-2xl px-4 py-3 text-[#1A1D3B] font-medium"
                                />
                            </View>
                            <View>
                                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">City</Text>
                                <TextInput
                                    placeholder="e.g. New York"
                                    placeholderTextColor="#ccc"
                                    value={newAddressCity}
                                    onChangeText={setNewAddressCity}
                                    className="bg-gray-50 rounded-2xl px-4 py-3 text-[#1A1D3B] font-medium"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleAddNewAddress}
                            className="py-4 rounded-2xl items-center bg-[#FF6B6B] mb-3"
                        >
                            <Text className="text-[#1A1D3B] font-black text-xs uppercase tracking-widest">Save Address</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setAddAddressModalVisible(false)}
                            className="py-3 rounded-2xl items-center"
                        >
                            <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Cancel</Text>
                        </TouchableOpacity>

                        {/* Decoration */}
                        <View className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FF6B6B] rounded-full opacity-5" />
                    </View>
                </View>
            )}
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
