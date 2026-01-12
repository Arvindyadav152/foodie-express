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

export default function DriverTabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarBackground: () => (
                    <View style={styles.tabBarBackground}>
                        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.glassOverlay} />
                    </View>
                ),
                tabBarActiveTintColor: '#FF6B6B',
                tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarItemStyle: styles.tabBarItem,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name="delivery-dining" color={color} focused={focused} iconType="material" />
                    ),
                }}
            />
            <Tabs.Screen
                name="earnings"
                options={{
                    title: 'Earnings',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'wallet' : 'wallet-outline'} color={color} focused={focused} />
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
        left: 20,
        right: 20,
        height: 75,
        borderRadius: 28,
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        elevation: 0,
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        paddingBottom: 0,
        overflow: 'hidden',
    },
    tabBarBackground: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 28,
        overflow: 'hidden',
        backgroundColor: 'rgba(17, 24, 17, 0.85)',
        borderWidth: 1,
        borderColor: 'rgba(13, 242, 13, 0.15)',
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 28,
    },
    tabBarLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
        marginTop: 2,
        marginBottom: Platform.OS === 'ios' ? 0 : 8,
    },
    tabBarItem: {
        paddingTop: 10,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    iconWrapperActive: {
        backgroundColor: 'rgba(13, 242, 13, 0.12)',
        ...Platform.select({
            ios: {
                shadowColor: '#FF6B6B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            web: {
                // @ts-ignore
                boxShadow: '0px 4px 8px rgba(255, 107, 107, 0.3)',
            },
            android: {
                elevation: 4,
            }
        }),
    },
    glowEffect: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(13, 242, 13, 0.15)',
        ...Platform.select({
            ios: {
                shadowColor: '#FF6B6B',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 15,
            },
            web: {
                // @ts-ignore
                boxShadow: '0px 0px 15px rgba(255, 107, 107, 0.5)',
            }
        }),
    },
});
