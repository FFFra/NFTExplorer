/**
 * UI metrics and layout calculations
 */
import { ViewMode, GridColumns } from '../types/nft';
import { ScreenDimensions } from '../types/hooks';

// Common layout constants
export const HEADER_HEIGHT = 60;
export const CONTAINER_PADDING = 32; // Total container padding (16px on each side)
export const CARD_SPACING = 12; // Spacing between cards (6px on each side)
export const SKELETON_CARD_GAP = 8; // Gap between skeleton cards

/**
 * Calculates the width of an NFT card based on screen width, column count, and view mode
 * 
 * @param screenWidth - Total width of the screen
 * @param columns - Number of columns to display in grid view
 * @param viewMode - Current view mode (grid or list)
 * @returns The calculated width for the card in pixels
 */
export const calculateCardWidth = (
    screenWidth: number,
    columns: GridColumns,
    viewMode: ViewMode
): number => {
    if (viewMode === 'list') {
        return screenWidth - CONTAINER_PADDING; // Full width minus padding
    }

    // Calculate width based on container padding and number of columns
    const totalSpacing = CARD_SPACING * (columns - 1); // Total spacing between cards

    // Calculate available width and divide by number of columns
    const availableWidth = screenWidth - CONTAINER_PADDING - totalSpacing;
    return Math.floor(availableWidth / columns);
};

/**
 * Calculates the width of a skeleton card based on screen width, column count, and view mode
 * 
 * @param screenWidth - Total width of the screen
 * @param columns - Number of columns to display in grid view
 * @param viewMode - Current view mode (grid or list)
 * @returns The calculated width for the skeleton card in pixels
 */
export const calculateSkeletonCardWidth = (
    screenWidth: number,
    columns: GridColumns,
    viewMode: ViewMode
): number => {
    if (viewMode === 'list') {
        return screenWidth - CONTAINER_PADDING; // Full width minus padding
    }

    const totalGaps = columns - 1;
    const availableWidth = screenWidth - CONTAINER_PADDING - (totalGaps * SKELETON_CARD_GAP);
    return availableWidth / columns;
};

/**
 * Calculates the height of an NFT card based on its width and view mode
 * 
 * @param cardWidth - The width of the card
 * @param viewMode - Current view mode (grid or list)
 * @returns The calculated height for the card in pixels
 */
export const calculateCardHeight = (
    cardWidth: number,
    viewMode: ViewMode
): number => {
    return viewMode === 'list' ? 120 : cardWidth;
};

/**
 * Calculate image height for NFT detail view
 * 
 * @param screenHeight - The height of the screen
 * @returns The height for the detail image
 */
export const calculateDetailImageHeight = (screenHeight: number): number => {
    return screenHeight * 0.5; // Image takes up half the screen height
};

/**
 * Generates dynamic styles for NFT detail view based on screen dimensions
 * 
 * @param dimensions - The screen dimensions object
 * @returns Object containing dynamic styles
 */
export const calculateDetailStyles = (dimensions: ScreenDimensions) => {
    const { width, height } = dimensions;
    const imageHeight = calculateDetailImageHeight(height);

    return {
        imageContainer: {
            width,
            height: imageHeight,
            backgroundColor: '#f0f0f0',
        },
        contentWithHeight: {
            minHeight: height - imageHeight + 20, // Ensures the content fills the screen
        }
    };
};
