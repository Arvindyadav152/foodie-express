import { Stack } from 'expo-router';

export default function VendorLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="menu" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="order-details/[id]" />
            <Stack.Screen name="profile" />
        </Stack>
    );
}
