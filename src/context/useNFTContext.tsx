import React, { createContext, useContext, useState, useCallback } from 'react';
import { NFT, NFTsResponse } from '../types/nft';
import { NFTContextType } from '../types/context';
import { NFTProviderProps } from '../types/components';
import { fetchNFTs } from '../api/nft-service';
import { isVideoMedia } from '../utils/helpers';
import { generateMockNFTs } from '../utils/mockData';

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
    const [useMockData, setUseMockData] = useState<boolean>(false);

    // Process API response, use mock data if response is empty
    const processApiResponse = useCallback((response: NFTsResponse): NFTsResponse => {
        // If API returns empty results and we're allowed to use mock data
        if (response.collectibles.length === 0) {
            console.warn('API returned no NFTs. Using mock data instead.');
            const mockNFTs = generateMockNFTs(pageSize);

            return {
                collectibles: mockNFTs,
                nextPageToken: undefined,
                total: mockNFTs.length,
                page: 1,
                limit: pageSize,
                hasMore: false
            };
        }

        return response;
    }, [pageSize]);

    // Fetch initial NFTs
    const fetchInitialNFTs = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response: NFTsResponse = await fetchNFTs(pageSize);
            const processedResponse = processApiResponse(response);

            setNFTs(processedResponse.collectibles);
            setNextPageToken(processedResponse.nextPageToken);
            setHasMore(processedResponse.hasMore);
            setTotalNFTs(processedResponse.total);
            setUseMockData(response.collectibles.length === 0);
        } catch (err) {
            setError('Failed to fetch NFTs. Please try again.');
            console.error('Error in fetchInitialNFTs:', err);

            // Fall back to mock data on error
            const mockNFTs = generateMockNFTs(pageSize);
            setNFTs(mockNFTs);
            setNextPageToken(undefined);
            setHasMore(false);
            setTotalNFTs(mockNFTs.length);
            setUseMockData(true);
        } finally {
            setLoading(false);
        }
    }, [pageSize, processApiResponse]);

    // Fetch more NFTs (pagination)
    const fetchMoreNFTs = useCallback(async () => {
        if (!hasMore || loading || !nextPageToken || useMockData) return;

        setLoading(true);

        try {
            const response: NFTsResponse = await fetchNFTs(pageSize, nextPageToken);
            const processedResponse = processApiResponse(response);

            setNFTs(prevNFTs => [...prevNFTs, ...processedResponse.collectibles]);
            setNextPageToken(processedResponse.nextPageToken);
            setHasMore(processedResponse.hasMore);
            setTotalNFTs(prevTotal => prevTotal + processedResponse.collectibles.length);
        } catch (err) {
            setError('Failed to fetch more NFTs. Please try again.');
            console.error('Error in fetchMoreNFTs:', err);
        } finally {
            setLoading(false);
        }
    }, [hasMore, loading, nextPageToken, pageSize, processApiResponse, useMockData]);

    // Get NFT by id
    const getNFTById = useCallback((id: string): NFT | undefined => {
        return nfts.find(nft => nft.id === id);
    }, [nfts]);

    // Refresh NFTs
    const refreshNFTs = useCallback(async () => {
        setNextPageToken(undefined);
        setUseMockData(false);
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
