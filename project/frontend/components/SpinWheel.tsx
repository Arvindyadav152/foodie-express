import React, { useState, useRef, useContext } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Alert, Dimensions } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const WHEEL_SIZE = Dimensions.get('window').width * 0.8;
const PRIZES = [
    { name: '10% OFF', color: '#FF6B6B', textColor: '#1A1D3B' },
    { name: 'FREE DELIVERY', color: '#1A1D3B', textColor: '#FF6B6B' },
    { name: '₹50 OFF', color: '#3b82f6', textColor: '#fff' },
    { name: '50 POINTS', color: '#f59e0b', textColor: '#fff' },
    { name: '5% OFF', color: '#ef4444', textColor: '#fff' },
    { name: 'BETTER LUCK', color: '#9ca3af', textColor: '#fff' },
    { name: '₹25 CASHBACK', color: '#10b981', textColor: '#fff' },
    { name: '20% OFF', color: '#6366f1', textColor: '#fff' },
];

interface SpinWheelProps {
    spinCredits: number;
    onSpinComplete?: (prize: any) => void;
}

export default function SpinWheel({ spinCredits, onSpinComplete }: SpinWheelProps) {
    const { userInfo } = useContext(AuthContext);
    const [isSpinning, setIsSpinning] = useState(false);
    const [credits, setCredits] = useState(spinCredits);
    const spinValue = useRef(new Animated.Value(0)).current;

    const spin = () => {
        if (credits <= 0) {
            Alert.alert('No Spins!', 'Order more to earn spin credits! 🍔');
            return;
        }
        if (isSpinning) return;

        setIsSpinning(true);
        const randomDegree = 360 * 5 + Math.floor(Math.random() * 360); // 5 full rotations + random

        spinValue.setValue(0);
        Animated.timing(spinValue, {
            toValue: randomDegree,
            duration: 4000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(async () => {
            setIsSpinning(false);
            setCredits(c => c - 1);

            // Determine prize based on final position
            const prizeIndex = Math.floor(((360 - (randomDegree % 360)) / (360 / PRIZES.length))) % PRIZES.length;
            const prize = PRIZES[prizeIndex];

            // Call backend to record spin
            try {
                const { data } = await api.post('/gamification/spin', { userId: userInfo?._id });
                Alert.alert('🎉 Congratulations!', `You won: ${data.prize?.name || prize.name}!`);
                if (onSpinComplete) onSpinComplete(data);
            } catch (error: any) {
                Alert.alert('Spin Result', `You got: ${prize.name}!`);
            }
        });
    };

    const spinInterpolate = spinValue.interpolate({
        inputRange: [0, 360],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View className="items-center py-8">
            {/* Spin Credits Badge */}
            <View className="flex-row items-center gap-2 bg-[#1A1D3B] px-4 py-2 rounded-full mb-6">
                <MaterialIcons name="stars" size={20} color="#FF6B6B" />
                <Text className="text-white font-black text-sm">{credits} Spins Available</Text>
            </View>

            {/* Wheel Container */}
            <View className="relative" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
                {/* Pointer */}
                <View className="absolute top-0 left-1/2 -translate-x-3 z-10">
                    <View className="w-6 h-8 bg-[#1A1D3B] items-center justify-center" style={{ transform: [{ rotate: '180deg' }] }}>
                        <View className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[16px] border-l-transparent border-r-transparent border-b-[#1A1D3B]" />
                    </View>
                </View>

                {/* Wheel */}
                <Animated.View
                    style={{
                        width: WHEEL_SIZE,
                        height: WHEEL_SIZE,
                        borderRadius: WHEEL_SIZE / 2,
                        overflow: 'hidden',
                        transform: [{ rotate: spinInterpolate }],
                        borderWidth: 8,
                        borderColor: '#1A1D3B',
                    }}
                >
                    {PRIZES.map((prize, index) => {
                        const angle = (360 / PRIZES.length) * index;
                        return (
                            <View
                                key={index}
                                className="absolute items-center justify-start pt-8"
                                style={{
                                    width: WHEEL_SIZE,
                                    height: WHEEL_SIZE / 2,
                                    left: 0,
                                    top: WHEEL_SIZE / 2,
                                    transformOrigin: 'center top',
                                    transform: [{ rotate: `${angle}deg` }],
                                    backgroundColor: prize.color,
                                }}
                            >
                                <Text
                                    className="font-black text-[10px] text-center tracking-tight"
                                    style={{ color: prize.textColor, width: 60 }}
                                    numberOfLines={2}
                                >
                                    {prize.name}
                                </Text>
                            </View>
                        );
                    })}
                </Animated.View>

                {/* Center Button */}
                <TouchableOpacity
                    onPress={spin}
                    disabled={isSpinning || credits <= 0}
                    className="absolute top-1/2 left-1/2 -translate-x-10 -translate-y-10 w-20 h-20 rounded-full bg-[#1A1D3B] items-center justify-center border-4 border-[#FF6B6B] shadow-xl"
                    style={{ elevation: 10 }}
                >
                    <Text className="text-[#FF6B6B] font-black text-xs uppercase tracking-tight">
                        {isSpinning ? '...' : 'SPIN'}
                    </Text>
                </TouchableOpacity>
            </View>

            <Text className="text-gray-400 text-xs font-bold mt-6 text-center">
                {credits > 0 ? 'Tap the center to spin!' : 'Place an order to earn spins! 🍕'}
            </Text>
        </View>
    );
}
