import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import MenuItem from './models/MenuItem.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const restaurantsData = [
    {
        name: 'The Verdant Bistro',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFMlwHZxWy_1iQH_xirmex8opSqL_wbXBYvbDT7BLgwHcCgXAfNAU4_r0b3iV9xuqO7tCCwfSTLvjfDw1e3ahYlKv89qH8arBKq8urpQqX_8TBuSVes91q99B_2SKD_8z50zBu2mArxW0FiC7kJdrqNxAtptWtaWRSeAWPp6zc9F_SdJiyRhTD4k6ReF--vb5EBbVved7aMNHM3rwSijU_6pfzCAuvwLe2GeIfE2AuFIhiYmPh6ZoicilRBPOT-NQAOZAyAHSbFXE',
        description: 'Fine Dining • Contemporary French',
        rating: 4.9,
        reviewCount: 1200,
        deliveryTime: '20-35 min',
        priceRange: '$$$',
        deliveryFee: 5.00,
        categories: ['French', 'Fine Dining'],
        address: { street: '123 Paris Ave', city: 'New York', zip: '10001', coordinates: { lat: 40.7128, lng: -74.0060 } }
    },
    {
        name: 'Green Bites',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2op1kd3RnU5Y9sHstHtuw34O63DZA3l1cZ_41Zlaua-2vin3YogOLkXwZO-ViYsqr8ozOr4AaJJ_lVEYslLSWMllGkLfv_c1yOjqhJdWMCE4ZRrgibCt7MBToI7YHe5vQMtf_WMWX4tzsWGFKLXgBgsZRHcXZCZUXcfaf9Lb2BWdJQ0t0owCaYLT_J408ViNHlp6WKfduQ-gYpUqPc4UQCO90Ghmeq53JiL1lZyoX_HSnxmk9vJ2eWEqZax5SCxp9r6-26H25X8w',
        description: 'Healthy • Salads • Bowls',
        rating: 4.8,
        reviewCount: 850,
        deliveryTime: '15-25 min',
        priceRange: '$$',
        deliveryFee: 0,
        isFreeDelivery: true,
        categories: ['Healthy', 'Salad'],
        address: { street: '456 Green St', city: 'New York', zip: '10002', coordinates: { lat: 40.7138, lng: -74.0070 } }
    },
    {
        name: 'Pizza Studio',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhBBy5D1AfFgxBg12ThWSQryLxA_QMOqbmEznlrFtHeIhmHzq4mVrCNmdMaPBjboxtyD8HX47YGJ0OrmkBNBwlrtP4D8T2SSSd-_PDU90BdWBati68vKRFVC40ch2jtbrER6kvpGukcjfp7mm9E-sGIKrI3cqviVYxRO4Cy02EnxDRcUnBPV3fAl7nIGxIL9OTvDSSFg2QcbzsRkN5q7Fk-RbLpz1-ueMcRRJZQjkMgy3gp1RS9xkG1KDWuoJF4dgiYelddXyX5Mo',
        description: 'Italian • Pizza • Pasta',
        rating: 4.5,
        reviewCount: 500,
        deliveryTime: '25-40 min',
        priceRange: '$$',
        deliveryFee: 1.99,
        categories: ['Italian', 'Pizza'],
        address: { street: '789 Dough Ln', city: 'New York', zip: '10003', coordinates: { lat: 40.7148, lng: -74.0080 } }
    }
];

const menuItemsData = [
    // Verdant Bistro
    {
        name: 'Black Truffle Tagliatelle',
        description: 'Handmade pasta tossed in creamy parmesan sauce with fresh shaving of Perigord truffles.',
        price: 34.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKA7D94B6I7hIPH2MRQKHw9A9SezxZR24d2jxUSKYnwr8tzVoGi8yjcLEIiGYYG9IqVHfw48N-2RcwmTtdL7_luhqLfLAbzr9CBvPf3IEqHuo7xs-2WLys4LUvrmfUI8ZXXaEI0DezW0bebnmRLhIcXFHtpqDhtHpRrwrlP5Zup0TYqfihZTvgkzGgfLMzPu2gg9FnpeK34h_pLa2_RBEDmhp5bpGgkxLtaPDsZTcV633mM409XbPczmPlft5gdfqt5jIhfae17sI',
        category: 'Main Course'
    },
    {
        name: 'Hokkaido Scallops',
        description: 'Pan-seared jumbo scallops served on a bed of vibrant sweet pea purée and lemon zest.',
        price: 28.50,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1LhElYqFtgkos1PzZSJvSlbMdBvNhwdhyLAYdbSjjyXMplhTzRP-dBtVDKnulzE3d-7g1_RWUBKFBXqRoF8WlZz83bEQzPxrmwSaKpFY2P23jBZPw2kxcfw0OKECjOnj5E0mYwdnXbf3kLNm06tcPXCYqzrwvmx7QXyOMd-G0RZyaFaut17foIwkwpmShpIHUw9UfjwVivGZlrMf_YxBBgYsO04QicHEAVkFr97AoVlUkgcjJrlHXLc8ZrGiLPPaQoz1EFfiXdPw',
        category: 'Appetizers'
    },
    // Green Bites
    {
        name: 'Quinoa Power Bowl',
        description: 'Red quinoa, kale, avocado, roasted chickpeas, and tahini dressing.',
        price: 14.50,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2op1kd3RnU5Y9sHstHtuw34O63DZA3l1cZ_41Zlaua-2vin3YogOLkXwZO-ViYsqr8ozOr4AaJJ_lVEYslLSWMllGkLfv_c1yOjqhJdWMCE4ZRrgibCt7MBToI7YHe5vQMtf_WMWX4tzsWGFKLXgBgsZRHcXZCZUXcfaf9Lb2BWdJQ0t0owCaYLT_J408ViNHlp6WKfduQ-gYpUqPc4UQCO90Ghmeq53JiL1lZyoX_HSnxmk9vJ2eWEqZax5SCxp9r6-26H25X8w', // Reusing placeholder logic, ideally comprehensive
        category: 'Bowls'
    },
    // Pizza Studio
    {
        name: 'Margherita Classic',
        description: 'San Marzano tomato sauce, fresh buffalo mozzarella, basil, and EVOO.',
        price: 16.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhBBy5D1AfFgxBg12ThWSQryLxA_QMOqbmEznlrFtHeIhmHzq4mVrCNmdMaPBjboxtyD8HX47YGJ0OrmkBNBwlrtP4D8T2SSSd-_PDU90BdWBati68vKRFVC40ch2jtbrER6kvpGukcjfp7mm9E-sGIKrI3cqviVYxRO4Cy02EnxDRcUnBPV3fAl7nIGxIL9OTvDSSFg2QcbzsRkN5q7Fk-RbLpz1-ueMcRRJZQjkMgy3gp1RS9xkG1KDWuoJF4dgiYelddXyX5Mo',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhBBy5D1AfFgxBg12ThWSQryLxA_QMOqbmEznlrFtHeIhmHzq4mVrCNmdMaPBjboxtyD8HX47YGJ1OrmkBNBwlrtP4D8T2SSSd-_PDU90BdWBati68vKRFVC40ch2jtbrER6kvpGukcjfp7mm9E-sGIKrI3cqviVYxRO4Cy02EnxDRcUnBPV3fAl7nIGxIL9OTvDSSFg2QcbzsRkN5q7Fk-RbLpz1-ueMcRRJZQjkMgy3gp1RS9xkG1KDWuoJF4dgiYelddXyX5Mo',
        category: 'Pizza'
    }
];

const seedDB = async () => {
    try {
        const URI = process.env.MONGO_URI;
        console.log(`Trying to connect to: ${URI}`);
        await mongoose.connect(URI);
        console.log('MongoDB Connected for Seeding');

        // Create users if they don't exist

        // 1. Vendor
        let vendor = await User.findOne({ email: 'vendor@foodies.com' });
        if (!vendor) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            vendor = await User.create({
                fullName: 'Foodies Vendor',
                email: 'vendor@foodies.com',
                password: hashedPassword,
                role: 'vendor'
            });
            console.log('Vendor Created:', vendor._id);
        } else {
            console.log('Vendor Exists:', vendor._id);
        }

        // 2. Driver
        let driver = await User.findOne({ email: 'driver@foodies.com' });
        if (!driver) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            driver = await User.create({
                fullName: 'Fast Driver',
                email: 'driver@foodies.com',
                phone: '555-0199',
                password: hashedPassword,
                role: 'driver'
            });
            console.log('Driver Created:', driver._id);
        } else {
            console.log('Driver Exists:', driver._id);
        }

        // 3. Customer
        let customer = await User.findOne({ email: 'user@foodies.com' });
        if (!customer) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            customer = await User.create({
                fullName: 'Arvind Yadav', // Matching the hardcoded name in Profile
                email: 'user@foodies.com',
                password: hashedPassword,
                role: 'user',
                addresses: [
                    { label: 'Home', street: '123 Main St', city: 'New York', zip: '10001', coordinates: { lat: 40.7128, lng: -74.0060 } }
                ]
            });
            console.log('Customer Created:', customer._id);
        } else {
            console.log('Customer Exists:', customer._id);
        }

        // Clear existing (optional, but good for consistent checks)
        // await Restaurant.deleteMany({});
        // await MenuItem.deleteMany({});

        // Create Restaurants
        for (const rData of restaurantsData) {
            let restaurant = await Restaurant.findOne({ name: rData.name });
            if (!restaurant) {
                restaurant = await Restaurant.create({ ...rData, vendorId: vendor._id });
                console.log(`Created Restaurant: ${restaurant.name}`);

                // Add items for this restaurant
                if (rData.name === 'The Verdant Bistro') {
                    await MenuItem.create({ ...menuItemsData[0], restaurantId: restaurant._id });
                    await MenuItem.create({ ...menuItemsData[1], restaurantId: restaurant._id });
                } else if (rData.name === 'Green Bites') {
                    await MenuItem.create({ ...menuItemsData[2], restaurantId: restaurant._id });
                } else if (rData.name === 'Pizza Studio') {
                    await MenuItem.create({ ...menuItemsData[3], restaurantId: restaurant._id });
                }
            } else {
                console.log(`Restaurant ${rData.name} already exists`);
            }
        }

        console.log('Seeding Completed');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedDB();
