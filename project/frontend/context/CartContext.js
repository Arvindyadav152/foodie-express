import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { userInfo } = useContext(AuthContext);
    const userId = userInfo?._id;

    const [cart, setCart] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        if (!userId) {
            setCart(null);
            setCartCount(0);
            return;
        }
        setIsLoading(true);
        try {
            const { data } = await api.get(`/cart/${userId}`);
            setCart(data);
            const count = data.items.reduce((acc, item) => acc + item.quantity, 0);
            setCartCount(count);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (menuItemId, quantity = 1) => {
        if (!userId) return { success: false, message: 'Please login to add items' };
        try {
            const { data } = await api.post('/cart/add', { userId, menuItemId, quantity });
            setCart(data);
            const count = data.items.reduce((acc, item) => acc + item.quantity, 0);
            setCartCount(count);
            return { success: true, data };
        } catch (error) {
            console.error('Add to cart error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error adding to cart'
            };
        }
    };

    const clearCart = async () => {
        if (!userId) return;
        try {
            await api.delete(`/cart/${userId}`);
            setCart(null);
            setCartCount(0);
        } catch (error) {
            console.error('Clear cart error:', error);
        }
    };

    return (
        <CartContext.Provider value={{ cart, cartCount, addToCart, clearCart, fetchCart, isLoading }}>
            {children}
        </CartContext.Provider>
    );
};
