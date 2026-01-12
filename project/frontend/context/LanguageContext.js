import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../i18n/en.json';
import hi from '../i18n/hi.json';

const translations = { en, hi };

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLang = await AsyncStorage.getItem('appLanguage');
            if (savedLang && translations[savedLang]) {
                setLanguage(savedLang);
            }
        } catch (error) {
            console.error('Error loading language:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const changeLanguage = async (lang) => {
        if (translations[lang]) {
            setLanguage(lang);
            try {
                await AsyncStorage.setItem('appLanguage', lang);
            } catch (error) {
                console.error('Error saving language:', error);
            }
        }
    };

    // Translation function
    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                // Fallback to English
                value = translations['en'];
                for (const fallbackK of keys) {
                    if (value && value[fallbackK]) {
                        value = value[fallbackK];
                    } else {
                        return key; // Return key if not found
                    }
                }
                break;
            }
        }

        return typeof value === 'string' ? value : key;
    };

    return (
        <LanguageContext.Provider value={{
            language,
            changeLanguage,
            t,
            isLoading,
            isHindi: language === 'hi',
            isEnglish: language === 'en'
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Custom hook for easy access
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
