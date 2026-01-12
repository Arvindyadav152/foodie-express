import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Sound configuration for different notification types
const SOUND_CONFIG = {
    orderNew: {
        // Using a royalty-free notification sound URL
        uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
        volume: 1.0,
    },
    orderAssigned: {
        uri: 'https://assets.mixkit.co/active_storage/sfx/1518/1518-preview.mp3',
        volume: 1.0,
    },
    driverNearby: {
        uri: 'https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3',
        volume: 1.0,
    },
    orderDelivered: {
        uri: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3',
        volume: 1.0,
    },
    success: {
        uri: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
        volume: 0.8,
    },
    error: {
        uri: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3',
        volume: 0.8,
    },
};

export type NotificationType = keyof typeof SOUND_CONFIG;

class NotificationSoundService {
    private soundObject: Audio.Sound | null = null;
    private isEnabled: boolean = true;

    constructor() {
        this.setupAudioMode();
    }

    private async setupAudioMode() {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });
        } catch (error) {
            console.error('Error setting up audio mode:', error);
        }
    }

    async play(type: NotificationType): Promise<void> {
        if (!this.isEnabled) return;

        try {
            // Unload previous sound if any
            if (this.soundObject) {
                await this.soundObject.unloadAsync();
                this.soundObject = null;
            }

            const config = SOUND_CONFIG[type];
            if (!config) {
                console.warn(`Unknown notification type: ${type}`);
                return;
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri: config.uri },
                { volume: config.volume, shouldPlay: true }
            );

            this.soundObject = sound;

            // Auto-unload when finished
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    sound.unloadAsync();
                    this.soundObject = null;
                }
            });
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    }

    async playNewOrder(): Promise<void> {
        await this.play('orderNew');
    }

    async playOrderAssigned(): Promise<void> {
        await this.play('orderAssigned');
    }

    async playDriverNearby(): Promise<void> {
        await this.play('driverNearby');
    }

    async playOrderDelivered(): Promise<void> {
        await this.play('orderDelivered');
    }

    async playSuccess(): Promise<void> {
        await this.play('success');
    }

    async playError(): Promise<void> {
        await this.play('error');
    }

    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
    }

    isNotificationEnabled(): boolean {
        return this.isEnabled;
    }

    async cleanup(): Promise<void> {
        if (this.soundObject) {
            await this.soundObject.unloadAsync();
            this.soundObject = null;
        }
    }
}

// Singleton instance
export const NotificationSound = new NotificationSoundService();
export default NotificationSound;
