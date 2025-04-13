import { Alert, Platform, ToastAndroid } from 'react-native';

/**
 * Custom hook for showing alerts on non-implemented features
 * @returns A function to trigger feature-specific alerts
 */
export const useFeatureAlert = () => {
    // Track if an alert is currently showing to prevent multiple alerts
    let isAlertShowing = false;

    /**
     * Show an alert for non-implemented features
     * @param featureName - Name of the feature
     * @param customMessage - Optional custom message
     */
    const showFeatureAlert = (featureName: string, customMessage?: string) => {
        // Prevent multiple alerts from showing at once
        if (isAlertShowing) return;

        const defaultMessage = `The ${featureName} feature is not implemented yet. This functionality will be available in a future update.`;
        const message = customMessage || defaultMessage;

        // Use different approach for Android and iOS
        if (Platform.OS === 'android') {
            // Show toast on Android for a more native feel
            ToastAndroid.showWithGravity(
                `${featureName} Coming Soon: ${message}`,
                ToastAndroid.LONG,
                ToastAndroid.CENTER
            );
        } else {
            // Use Alert for iOS
            isAlertShowing = true;
            Alert.alert(
                `${featureName} Coming Soon`,
                message,
                [{
                    text: 'OK',
                    style: 'default',
                    onPress: () => { isAlertShowing = false; }
                }],
                {
                    cancelable: true,
                    onDismiss: () => { isAlertShowing = false; }
                }
            );
        }
    };

    /**
     * Show a specific alert for Favorites feature
     */
    const showFavoritesAlert = () => {
        showFeatureAlert('Favorites', 'The Favorites feature will allow you to save NFTs for later viewing. Coming in a future update!');
    };

    /**
     * Show a specific alert for Settings feature
     */
    const showSettingsAlert = () => {
        showFeatureAlert('Settings', 'The Settings page will allow you to customize your app experience. Coming in a future update!');
    };

    /**
     * Show a specific alert for OpenSea feature
     */
    const showOpenSeaAlert = (contractAddress?: string, tokenId?: string) => {
        let message = 'The OpenSea integration will allow you to view and purchase NFTs on OpenSea. Coming in a future update!';

        if (contractAddress && tokenId) {
            const shortAddress = `${contractAddress.substring(0, 6)}...${contractAddress.slice(-4)}`;
            message = `The OpenSea integration will allow you to view and purchase this NFT (${shortAddress}, Token #${tokenId}) on OpenSea. Coming in a future update!`;
        }

        showFeatureAlert('OpenSea Integration', message);
    };

    return {
        showFeatureAlert,
        showFavoritesAlert,
        showSettingsAlert,
        showOpenSeaAlert
    };
}; 
