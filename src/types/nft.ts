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
    };
    metadata?: Record<string, any>;
}

export interface NFTsResponse {
    items: NFT[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

export type ViewMode = 'grid' | 'list';
export type GridColumns = 1 | 2 | 3;
