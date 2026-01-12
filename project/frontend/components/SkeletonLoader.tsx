import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Shimmer = ({ width, height, borderRadius = 8, style }: any) => {
    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        const startAnimation = () => {
            animatedValue.setValue(0);
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: Platform.OS !== 'web',
            }).start(() => startAnimation());
        };
        startAnimation();
    }, []);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    });

    return (
        <View
            style={[{
                width,
                height,
                backgroundColor: '#e1e5e1',
                overflow: 'hidden',
                borderRadius
            }, style]}
        >
            <Animated.View
                style={{
                    width: '100%',
                    height: '100%',
                    transform: [{ translateX }],
                }}
            >
                <LinearGradient
                    colors={['#e1e5e1', '#f0f2f0', '#e1e5e1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                />
            </Animated.View>
        </View>
    );
};

export const HomeSkeleton = () => (
    <View className="p-5">
        <View className="flex-row items-center justify-between mb-8">
            <View>
                <Shimmer width={120} height={20} borderRadius={4} />
                <Shimmer width={180} height={32} borderRadius={4} style={{ marginTop: 8 }} />
            </View>
            <Shimmer width={48} height={48} borderRadius={16} />
        </View>

        <View className="flex-row gap-4 mb-10">
            {[1, 2, 3, 4].map(i => (
                <View key={i} className="items-center">
                    <Shimmer width={64} height={64} borderRadius={20} />
                    <Shimmer width={40} height={10} borderRadius={2} style={{ marginTop: 8 }} />
                </View>
            ))}
        </View>

        {[1, 2, 3].map(i => (
            <View key={i} className="mb-6">
                <Shimmer width="100%" height={200} borderRadius={32} />
                <View className="mt-4 flex-row justify-between">
                    <Shimmer width={150} height={24} borderRadius={4} />
                    <Shimmer width={60} height={24} borderRadius={4} />
                </View>
            </View>
        ))}
    </View>
);

export const RestaurantSkeleton = () => (
    <View>
        <Shimmer width="100%" height={300} borderRadius={0} />
        <View className="p-6">
            <Shimmer width={200} height={32} borderRadius={4} />
            <Shimmer width={150} height={16} borderRadius={4} style={{ marginTop: 8 }} />
            <View className="flex-row gap-2 mt-4">
                <Shimmer width={100} height={32} borderRadius={12} />
                <Shimmer width={100} height={32} borderRadius={12} />
            </View>
            <View className="mt-10 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <View key={i} className="flex-row justify-between">
                        <View className="flex-1 mr-4">
                            <Shimmer width={120} height={20} borderRadius={4} />
                            <Shimmer width="100%" height={40} borderRadius={4} style={{ marginTop: 8 }} />
                            <Shimmer width={60} height={20} borderRadius={4} style={{ marginTop: 8 }} />
                        </View>
                        <Shimmer width={100} height={100} borderRadius={24} />
                    </View>
                ))}
            </View>
        </View>
    </View>
);

export default Shimmer;
