const config = require('./tailwind.config.js');
console.log('Presets length:', config.presets ? config.presets.length : 0);
try {
    const nwPreset = require('nativewind/preset');
    console.log('NativeWind preset loaded successfully');
    const hasPreset = config.presets.includes(nwPreset);
    console.log('Config includes NativeWind preset (exact match):', hasPreset);
} catch (e) {
    console.error('Failed to require nativewind/preset:', e.message);
}
