import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Alert, Vibration, Platform } from 'react-native';
import { AuthContext } from './AuthContext';
import NotificationSound from '../utils/NotificationSound';
import Constants from 'expo-constants';

// Get Socket URL from environment or use defaults
const getSocketUrl = () => {
    const envSocketUrl = Constants.expoConfig?.extra?.socketUrl || process.env.EXPO_PUBLIC_SOCKET_URL;
    if (envSocketUrl) {
        return envSocketUrl;
    }
    // Development fallback
    if (Platform.OS === 'web' || Platform.OS === 'ios') {
        return 'http://localhost:8000';
    }
    return 'http://10.0.2.2:8000';
};

const SOCKET_URL = getSocketUrl();

// Default context value to avoid null errors
const defaultContextValue = {
    socket: null,
    activeCartId: null,
    joinCart: (cartId) => { },
    syncCartUpdate: (cartId, cartData) => { },
    participants: [],
    trackOrder: (orderId, deliveryLat, deliveryLng) => { },
    joinAsVendor: (vendorId) => { },
    joinAsDriver: (driverId) => { },
    joinAsAdmin: () => { },
    broadcastDriverLocation: (driverId, orderId, lat, lng) => { },
    emitNewOrder: (orderId, vendorId, orderDetails) => { },
    emitOrderAssigned: (orderId, driverId, orderDetails) => { },
    newOrderNotification: null,
    driverNearbyNotification: null,
    clearNewOrderNotification: () => { },
    clearDriverNearbyNotification: () => { },
};

const SocketContext = createContext(defaultContextValue);

export const SocketProvider = ({ children }) => {
    const { userInfo } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [activeCartId, setActiveCartId] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [newOrderNotification, setNewOrderNotification] = useState(null);
    const [driverNearbyNotification, setDriverNearbyNotification] = useState(null);

    useEffect(() => {
        const socketInstance = io(SOCKET_URL, {
            transports: ['websocket'],
        });

        socketInstance.on('connect', () => {
            console.log('✅ Connected to Real-time Socket');
        });

        // ========== NOTIFICATION LISTENERS ==========

        // Vendor: New order received
        socketInstance.on('order:new_notification', async (data) => {
            console.log('📦 New order notification:', data);
            setNewOrderNotification(data);
            await NotificationSound.playNewOrder();
            Vibration.vibrate([0, 500, 100, 500]);
        });

        // Driver: Order assigned
        socketInstance.on('order:assigned_notification', async (data) => {
            console.log('🚚 Order assigned:', data);
            await NotificationSound.playOrderAssigned();
            Vibration.vibrate([0, 300, 100, 300, 100, 300]);
        });

        // Customer: Driver nearby
        socketInstance.on('driver:nearby', async (data) => {
            console.log('📍 Driver nearby:', data);
            setDriverNearbyNotification(data);
            await NotificationSound.playDriverNearby();
            Vibration.vibrate([0, 200, 100, 200]);
        });

        // Customer: Order status changed
        socketInstance.on('order:status_changed', async (data) => {
            console.log('📊 Order status changed:', data);
            if (data.status === 'delivered') {
                await NotificationSound.playOrderDelivered();
            }
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
            NotificationSound.cleanup();
        };
    }, []);

    // ========== ROLE-BASED JOIN METHODS ==========

    // Customer tracking an order
    const trackOrder = useCallback((orderId, deliveryLat, deliveryLng) => {
        if (socket && userInfo?._id) {
            socket.emit('order:track', {
                orderId,
                customerId: userInfo._id,
                deliveryLat,
                deliveryLng
            });
            console.log(`📱 Started tracking order: ${orderId}`);
        }
    }, [socket, userInfo]);

    // Vendor joins their room
    const joinAsVendor = useCallback((vendorId) => {
        if (socket) {
            socket.emit('vendor:join', vendorId);
            console.log(`🍽️ Joined as vendor: ${vendorId}`);
        }
    }, [socket]);

    // Driver joins their room
    const joinAsDriver = useCallback((driverId) => {
        if (socket) {
            socket.emit('driver:join', driverId);
            console.log(`🚚 Joined as driver: ${driverId}`);
        }
    }, [socket]);

    // Admin joins admin room
    const joinAsAdmin = useCallback(() => {
        if (socket) {
            socket.emit('admin:join');
            console.log(`👨‍💼 Joined as admin`);
        }
    }, [socket]);

    // Driver broadcasts location
    const broadcastDriverLocation = useCallback((driverId, orderId, lat, lng) => {
        if (socket) {
            socket.emit('driver:location_update', { driverId, orderId, lat, lng });
        }
    }, [socket]);

    // Emit new order event (from checkout)
    const emitNewOrder = useCallback((orderId, vendorId, orderDetails) => {
        if (socket) {
            socket.emit('order:new', { orderId, vendorId, orderDetails });
        }
    }, [socket]);

    // Emit order assigned event
    const emitOrderAssigned = useCallback((orderId, driverId, orderDetails) => {
        if (socket) {
            socket.emit('order:assigned', { orderId, driverId, orderDetails });
        }
    }, [socket]);

    // ========== CART METHODS ==========

    const joinCart = (cartId) => {
        if (socket) {
            socket.emit('cart:join', cartId);
            setActiveCartId(cartId);
        }
    };

    const syncCartUpdate = (cartId, cartData) => {
        if (socket) {
            socket.emit('cart:update', { cartId, cartData });
        }
    };

    // Clear notifications
    const clearNewOrderNotification = () => setNewOrderNotification(null);
    const clearDriverNearbyNotification = () => setDriverNearbyNotification(null);

    return (
        <SocketContext.Provider value={{
            socket,
            activeCartId,
            joinCart,
            syncCartUpdate,
            participants,
            // Role-based methods
            trackOrder,
            joinAsVendor,
            joinAsDriver,
            joinAsAdmin,
            broadcastDriverLocation,
            emitNewOrder,
            emitOrderAssigned,
            // Notification state
            newOrderNotification,
            driverNearbyNotification,
            clearNewOrderNotification,
            clearDriverNearbyNotification,
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);

