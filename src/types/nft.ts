/**
 * Types for NFT-related data structures and API responses
 */

export interface NFT {
    id: string;
    contractAddress: string;
    tokenId: string;
    name: string;
    description: string;
    mediaType: string;
    mediaUrl: string;
    thumbnailUrl: string;
    imageUrl: string;
    price: number;
    owner: string;
    createdAt: string;
    creator?: string;
    collection?: {
        name: string;
        description?: string;
        imageUrl?: string;
        symbol?: string;
    };
    metadata?: Record<string, any>;
    ercType?: string;
}

export interface NFTsResponse {
    collectibles: NFT[];
    nextPageToken?: string;
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

/**
 * Represents a collectible item from the Avalanche API
 */
export interface ApiCollectible {
    address: string;
    tokenId: string;
    name?: string;
    symbol?: string;
    tokenUri?: string;
    ercType?: string;
}

/**
 * Represents the API response for collectibles
 */
export interface ApiResponse {
    collectibleBalances: ApiCollectible[];
    nextPageToken?: string;
}

/**
 * Represents the metadata structure for an NFT
 */
export interface NFTMetadata {
    name?: string;
    description?: string;
    image?: string;
    image_url?: string;
    imageUrl?: string;
    animation_url?: string;
    media?: string;
    mediaUrl?: string;
    mediaType?: string;
    media_type?: string;
    creator?: string;
    owner?: string;
    price?: number;
    collection?: {
        name?: string;
        description?: string;
        image?: string;
        symbol?: string;
    };
    properties?: {
        image?: string;
        [key: string]: any;
    };
    // Add index signature to allow dynamic keys
    [key: string]: any;
}

export type ViewMode = 'grid' | 'list';
export type GridColumns = 1 | 2 | 3;
