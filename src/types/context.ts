import { NFT } from './nft';

/**
 * Type definitions for context API interfaces
 */

/**
 * NFT Context type definition
 */
export interface NFTContextType {
    nfts: NFT[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    nextPageToken?: string;
    totalNFTs: number;
    fetchInitialNFTs: () => Promise<void>;
    fetchMoreNFTs: () => Promise<void>;
    getNFTById: (id: string) => NFT | undefined;
    isVideoMedia: (mediaType: string) => boolean;
    refreshNFTs: () => Promise<void>;
} 
