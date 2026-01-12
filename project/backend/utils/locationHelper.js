import axios from 'axios';

/**
 * Reverse Geocode coordinates using OpenStreetMap Nominatim API (FREE)
 * Note: Nominatim requires a User-Agent and has usage limits (1 request/sec)
 */
export const reverseGeocodeFree = async (lat, lng) => {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
            headers: {
                'User-Agent': 'FoodieExpress/1.0 (contact@foodiexpress.com)'
            }
        });

        if (response.data && response.data.display_name) {
            // Simplify address: often first few parts are enough
            const parts = response.data.display_name.split(',');
            const shortAddress = parts.slice(0, 3).join(',').trim();
            return {
                full: response.data.display_name,
                short: shortAddress,
                details: response.data.address
            };
        }
        return null;
    } catch (error) {
        console.error('Nominatim Error:', error.message);
        return null;
    }
};

/**
 * Haversine formula to calculate distance between two points in km
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
