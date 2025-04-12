import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NFT, NFTsResponse } from '../types/nft';
import { NFTContextType } from '../types/context';
import { NFTProviderProps } from '../types/components';
import { fetchNFTs, isVideoMedia } from '../api/nft-service';

// Create the context
const NFTContext = createContext<NFTContextType | undefined>(undefined);

/**
 * Custom hook to create NFT context state and functions
 * Separating this from the provider component allows for better testing and reuse
 */
export const useCreateNFTContext = (pageSize: number = 10): NFTContextType => {
    const [nfts, setNFTs] = useState<NFT[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [totalNFTs, setTotalNFTs] = useState<number>(0);

    // Fetch initial NFTs
    const fetchInitialNFTs = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response: NFTsResponse = await fetchNFTs(pageSize);

            setNFTs(response.collectibles);
            setNextPageToken(response.nextPageToken);
            setHasMore(response.hasMore);
            setTotalNFTs(response.total);
        } catch (err) {
            setError('Failed to fetch NFTs. Please try again.');
            console.error('Error in fetchInitialNFTs:', err);
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    // Fetch more NFTs (pagination)
    const fetchMoreNFTs = useCallback(async () => {
        if (!hasMore || loading || !nextPageToken) return;

        setLoading(true);

        try {
            const response: NFTsResponse = await fetchNFTs(pageSize, nextPageToken);

            setNFTs(prevNFTs => [...prevNFTs, ...response.collectibles]);
            setNextPageToken(response.nextPageToken);
            setHasMore(response.hasMore);
            setTotalNFTs(response.total);
        } catch (err) {
            setError('Failed to fetch more NFTs. Please try again.');
            console.error('Error in fetchMoreNFTs:', err);
        } finally {
            setLoading(false);
        }
    }, [hasMore, loading, nextPageToken, pageSize]);

    // Get NFT by id
    const getNFTById = useCallback((id: string): NFT | undefined => {
        return nfts.find(nft => nft.id === id);
    }, [nfts]);

    // Refresh NFTs
    const refreshNFTs = useCallback(async () => {
        setNextPageToken(undefined);
        await fetchInitialNFTs();
    }, [fetchInitialNFTs]);

    return {
        nfts,
        loading,
        error,
        hasMore,
        nextPageToken,
        totalNFTs,
        fetchInitialNFTs,
        fetchMoreNFTs,
        getNFTById,
        isVideoMedia,
        refreshNFTs
    };
};

/**
 * NFT Context Provider component
 */
export const NFTProvider: React.FC<NFTProviderProps> = ({
    children,
    pageSize = 10
}) => {
    const contextValue = useCreateNFTContext(pageSize);

    return (
        <NFTContext.Provider value={contextValue}>
            {children}
        </NFTContext.Provider>
    );
};

/**
 * Custom hook to use the NFT context
 */
export const useNFT = (): NFTContextType => {
    const context = useContext(NFTContext);

    if (context === undefined) {
        throw new Error('useNFT must be used within an NFTProvider');
    }

    return context;
};

export default NFTContext; 
