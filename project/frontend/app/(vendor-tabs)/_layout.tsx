import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const TabBarIcon = ({ name, color, focused, iconType = 'ionicons' }: { name: string; color: string; focused: boolean; iconType?: string }) => {
    const IconComponent = iconType === 'material' ? MaterialIcons : Ionicons;

    return (
        <View style={[styles.iconContainer, focused && { transform: [{ scale: 1.1 }, { translateY: -2 }] }]}>
            {focused && (
                <View style={styles.glowEffect} />
            )}
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                <IconComponent name={name as any} size={22} color={color} />
            </View>
        </View>
    );
};

export default function VendorTabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarBackground: () => (
                    <View style={styles.tabBarBackground}>
                        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
                        <View style={styles.glassOverlay} />
                    </View>
                ),
                tabBarActiveTintColor: '#FF6B6B',
                tabBarInactiveTintColor: 'rgba(0,0,0,0.4)',
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarItemStyle: styles.tabBarItem,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'grid' : 'grid-outline'} color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="receipt-long" color={color} focused={focused} iconType="material" />
                    ),
                }}
            />
            <Tabs.Screen
                name="menu"
                options={{
                    title: 'Menu',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'restaurant' : 'restaurant-outline'} color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} focused={focused} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        height: 72,
        borderRadius: 24,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        elevation: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        paddingBottom: 0,
        overflow: 'hidden',
    },
    tabBarBackground: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderWidth: 1,
        borderColor: 'rgba(13, 242, 13, 0.2)',
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 24,
    },
    tabBarLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
        marginTop: 2,
        marginBottom: Platform.OS === 'ios' ? 0 : 6,
    },
    tabBarItem: {
        paddingTop: 8,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    iconWrapperActive: {
        backgroundColor: 'rgba(13, 242, 13, 0.15)',
        ...Platform.select({
            ios: {
                shadowColor: '#FF6B6B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
            },
            web: {
                // @ts-ignore
                boxShadow: '0px 4px 8px rgba(255, 107, 107, 0.25)',
            },
            android: {
                elevation: 4,
            }
        }),
    },
    glowEffect: {
        position: 'absolute',
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'rgba(13, 242, 13, 0.1)',
        ...Platform.select({
            ios: {
                shadowColor: '#FF6B6B',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
            },
            web: {
                // @ts-ignore
                boxShadow: '0px 0px 12px rgba(255, 107, 107, 0.4)',
            }
        }),
    },
});
