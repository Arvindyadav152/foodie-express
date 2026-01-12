import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Restaurant from './models/Restaurant.js';

dotenv.config();

const fixRestaurantData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodie_db');
        console.log('Connected to MongoDB');

        const restaurants = await Restaurant.find({});
        console.log(`Found ${restaurants.length} restaurants to update`);

        for (const rest of restaurants) {
            // If location is missing or in old format, update to GeoJSON
            if (!rest.location || !rest.location.coordinates) {
                // Assign some mock coordinates around a center point (e.g., Delhi)
                // Randomly offset slightly to test distance sorting
                const lng = 77.2090 + (Math.random() - 0.5) * 0.1;
                const lat = 28.6139 + (Math.random() - 0.5) * 0.1;

                rest.location = {
                    type: 'Point',
                    coordinates: [lng, lat]
                };
                await rest.save();
                console.log(`Updated: ${rest.name}`);
            }
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

fixRestaurantData();
