import { Alert, Platform } from 'react-native';

/**
 * Custom hook for showing alerts on non-implemented features
 * @returns A function to trigger feature-specific alerts
 */
export const useFeatureAlert = () => {
    /**
     * Show an alert for non-implemented features
     * @param featureName - Name of the feature
     * @param customMessage - Optional custom message
     */
    const showFeatureAlert = (featureName: string, customMessage?: string) => {
        const defaultMessage = `The ${featureName} feature is not implemented yet. This functionality will be available in a future update.`;

        Alert.alert(
            `${featureName} Coming Soon`,
            customMessage || defaultMessage,
            [{ text: 'OK', style: 'default' }],
            { cancelable: true }
        );
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
        const message = contractAddress && tokenId
            ? `The OpenSea integration will allow you to view and purchase this NFT (${contractAddress.substring(0, 6)}...${tokenId}) on OpenSea. Coming in a future update!`
            : 'The OpenSea integration will allow you to view and purchase NFTs on OpenSea. Coming in a future update!';

        showFeatureAlert('OpenSea Integration', message);
    };

    return {
        showFeatureAlert,
        showFavoritesAlert,
        showSettingsAlert,
        showOpenSeaAlert
    };
}; 