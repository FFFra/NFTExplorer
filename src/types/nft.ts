export interface NFT {
    id: string;
    contractAddress: string;
    tokenId: string;
    name: string;
    description: string;
    mediaType: string;
    mediaUrl: string;
    thumbnailUrl: string;
    creator?: string;
    collection?: {
        name: string;
        description?: string;
        imageUrl?: string;
    };
    metadata?: Record<string, any>;
}

export interface NFTsResponse {
    nextPageToken?: string;
    collectibles: NFT[];
}

export type ViewMode = 'grid' | 'list';
export type GridColumns = 1 | 2 | 3;
