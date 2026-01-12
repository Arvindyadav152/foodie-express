import { useContext, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { AuthContext } from '../context/AuthContext';

type RequiredRole = 'vendor' | 'driver' | 'user' | 'admin';

/**
 * Hook to require authentication and specific role
 * Redirects to login if not authenticated or wrong role
 */
export const useRequireAuth = (requiredRole?: RequiredRole) => {
    const { userInfo, isLoading } = useContext(AuthContext);
    const hasRedirected = useRef(false);

    useEffect(() => {
        if (isLoading) return;
        if (hasRedirected.current) return;

        if (!userInfo) {
            hasRedirected.current = true;
            router.replace('/auth/login');
            return;
        }

        if (requiredRole) {
            // Check role-specific requirements
            switch (requiredRole) {
                case 'vendor':
                    if (!userInfo.vendorId && userInfo.role !== 'vendor') {
                        hasRedirected.current = true;
                        router.replace('/auth/login');
                    }
                    break;
                case 'driver':
                    if (userInfo.role !== 'driver') {
                        hasRedirected.current = true;
                        router.replace('/auth/login');
                    }
                    break;
                case 'admin':
                    if (userInfo.role !== 'admin') {
                        hasRedirected.current = true;
                        router.replace('/auth/login');
                    }
                    break;
            }
        }
    }, [userInfo, isLoading, requiredRole]);

    return {
        userInfo,
        isLoading,
        isAuthenticated: !!userInfo,
        vendorId: userInfo?.vendorId,
        driverId: userInfo?._id,
        userId: userInfo?._id,
    };
};

export default useRequireAuth;
