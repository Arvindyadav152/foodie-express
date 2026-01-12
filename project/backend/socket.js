/**
 * Real-time Socket Logic
 * Handles: Cart sync, Order notifications, Driver tracking
 */

// Store active driver locations and user-order mappings
const driverLocations = new Map(); // driverId -> { lat, lng, orderId }
const orderCustomers = new Map();  // orderId -> customerId

// Haversine formula to calculate distance between two coordinates (in meters)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

export const initSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('🔗 Client connected:', socket.id);

        // ========== ROLE-BASED ROOM JOINING ==========

        // Customer joins their order room
        socket.on('order:track', ({ orderId, customerId, deliveryLat, deliveryLng }) => {
            socket.join(`order:${orderId}`);
            socket.join(`customer:${customerId}`);
            orderCustomers.set(orderId, { customerId, deliveryLat, deliveryLng, socketId: socket.id });
            console.log(`📱 Customer tracking order: ${orderId}`);
        });

        // Vendor joins their vendor room
        socket.on('vendor:join', (vendorId) => {
            socket.join(`vendor:${vendorId}`);
            console.log(`🍽️ Vendor joined room: ${vendorId}`);
        });

        // Driver joins their driver room
        socket.on('driver:join', (driverId) => {
            socket.join(`driver:${driverId}`);
            console.log(`🚚 Driver joined room: ${driverId}`);
        });

        // Admin joins admin room
        socket.on('admin:join', () => {
            socket.join('admin');
            console.log(`👨‍💼 Admin connected`);
        });

        // ========== ORDER EVENTS ==========

        // New order placed - notify vendor
        socket.on('order:new', ({ orderId, vendorId, orderDetails }) => {
            io.to(`vendor:${vendorId}`).emit('order:new_notification', {
                orderId,
                orderDetails,
                timestamp: new Date().toISOString(),
                message: 'Naya order aaya hai!'
            });
            io.to('admin').emit('order:new_notification', { orderId, vendorId });
            console.log(`📦 New order notification sent to vendor: ${vendorId}`);
        });

        // Order assigned to driver
        socket.on('order:assigned', ({ orderId, driverId, orderDetails }) => {
            io.to(`driver:${driverId}`).emit('order:assigned_notification', {
                orderId,
                orderDetails,
                timestamp: new Date().toISOString(),
                message: 'Nayi delivery assign hui!'
            });
            console.log(`🚚 Order assigned notification sent to driver: ${driverId}`);
        });

        // Order status update
        socket.on('order:status_update', ({ orderId, status, updatedBy }) => {
            io.to(`order:${orderId}`).emit('order:status_changed', { orderId, status, updatedBy });
            io.to('admin').emit('order:status_changed', { orderId, status });
            console.log(`📊 Order ${orderId} status updated to: ${status}`);
        });

        // ========== DRIVER LOCATION TRACKING ==========

        // Driver broadcasts location
        socket.on('driver:location_update', ({ driverId, orderId, lat, lng }) => {
            driverLocations.set(driverId, { lat, lng, orderId, lastUpdate: Date.now() });

            // Emit to order tracking room
            io.to(`order:${orderId}`).emit('driver:location', { driverId, lat, lng });

            // Also emit to admin for live tracking
            io.to('admin').emit('driver:location', { driverId, orderId, lat, lng });

            // Check proximity to customer
            const customerInfo = orderCustomers.get(orderId);
            if (customerInfo && customerInfo.deliveryLat && customerInfo.deliveryLng) {
                const distance = calculateDistance(lat, lng, customerInfo.deliveryLat, customerInfo.deliveryLng);

                // Notify when driver is within 500m
                if (distance <= 500) {
                    io.to(`order:${orderId}`).emit('driver:nearby', {
                        orderId,
                        distance: Math.round(distance),
                        message: 'Delivery partner sirf ' + Math.round(distance) + 'm door hai!'
                    });
                    console.log(`📍 Driver nearby notification: ${orderId} (${Math.round(distance)}m)`);
                }
            }
        });

        // Driver location from mobile app (simpler event)
        socket.on('driver:location', ({ orderId, driverId, location }) => {
            if (!location) return;
            driverLocations.set(driverId, {
                lat: location.latitude,
                lng: location.longitude,
                orderId,
                lastUpdate: Date.now()
            });

            // Broadcast to customer tracking this order
            io.to(`order:${orderId}`).emit('driver:location', {
                driverId,
                location,
                lat: location.latitude,
                lng: location.longitude
            });

            // Broadcast to admin
            io.to('admin').emit('driver:location', {
                driverId,
                orderId,
                lat: location.latitude,
                lng: location.longitude
            });

            console.log(`📍 Driver ${driverId} location updated for order ${orderId}`);
        });

        // ========== COLLABORATIVE CART ==========

        socket.on('cart:join', (cartId) => {
            socket.join(`cart:${cartId}`);
            console.log(`👤 User joined cart session: ${cartId}`);
            socket.to(`cart:${cartId}`).emit('user:joined', {
                socketId: socket.id,
                message: 'A new foodie joined the cart!'
            });
        });

        socket.on('cart:update', ({ cartId, cartData }) => {
            socket.to(`cart:${cartId}`).emit('cart:synced', cartData);
        });

        socket.on('cart:checkout_started', (cartId) => {
            socket.to(`cart:${cartId}`).emit('cart:locked', {
                message: 'Someone is finalizing the order...',
                locked: true
            });
        });

        // ========== DISCONNECT ==========

        socket.on('disconnect', () => {
            console.log('❌ Client disconnected:', socket.id);
            // Clean up order customer mapping by socketId
            for (const [orderId, info] of orderCustomers.entries()) {
                if (info.socketId === socket.id) {
                    orderCustomers.delete(orderId);
                }
            }
        });
    });

    // Clean up stale driver locations every 60 seconds
    setInterval(() => {
        const now = Date.now();
        for (const [driverId, data] of driverLocations.entries()) {
            if (now - data.lastUpdate > 120000) { // 2 minutes stale
                driverLocations.delete(driverId);
            }
        }
    }, 60000);
};

// Export for use in order creation routes
export const emitNewOrder = (io, vendorId, orderId, orderDetails) => {
    io.to(`vendor:${vendorId}`).emit('order:new_notification', {
        orderId,
        orderDetails,
        timestamp: new Date().toISOString(),
        message: 'Naya order aaya hai!'
    });
    io.to('admin').emit('order:new_notification', { orderId, vendorId });
};

export const emitOrderAssigned = (io, driverId, orderId, orderDetails) => {
    io.to(`driver:${driverId}`).emit('order:assigned_notification', {
        orderId,
        orderDetails,
        timestamp: new Date().toISOString(),
        message: 'Nayi delivery assign hui!'
    });
};

