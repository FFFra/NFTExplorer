import { ViewMode, GridColumns, NFT } from './nft';
import { ScreenDimensions } from './hooks';
import Animated from 'react-native-reanimated';

/**
 * Props for the NFT skeleton loading component
 */
export interface SkeletonProps {
    viewMode: ViewMode;
    columns: GridColumns;
}

/**
 * Type for skeleton styles that are dynamically created based on screen dimensions
 */
export interface SkeletonStyles {
    dynamicCardContainer: (cardWidth: number, cardHeight: number) => {
        width: number;
        height: number;
    };
    dynamicMediaSkeleton: (size: number) => {
        width: number;
        height: number;
    };
}

/**
 * Props for the NFT card component
 */
export interface NFTCardProps {
    nft: NFT;
    onPress: (nft: NFT) => void;
    columns: GridColumns;
    viewMode: ViewMode;
    index: number;
    style?: object;
}

/**
 * Props for the NFT detail component
 */
export interface NFTDetailProps {
    nft: NFT;
    imageUrl: string;
    onBack: () => void;
    scrollY: Animated.SharedValue<number>;
}

/**
 * Props for the NFT provider component
 */
export interface NFTProviderProps {
    children: React.ReactNode;
    pageSize?: number;
} 
