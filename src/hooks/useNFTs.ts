import { useState, useCallback } from 'react';
import { fetchNFTs } from '../services/nftService';
import { NFT } from '../types/nft';

export const useNFTs = () => {
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchNextPage = useCallback(async () => {
        if (!hasMore || isLoading) return;

        try {
            setIsLoading(true);
            setError(null);
            const response = await fetchNFTs(page, 12);

            setNfts(prev => [...prev, ...response.items]);
            setPage(prev => prev + 1);
            setHasMore(response.hasMore);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
        } finally {
            setIsLoading(false);
        }
    }, [page, hasMore, isLoading]);

    const refetch = useCallback(async () => {
        setNfts([]);
        setPage(1);
        setHasMore(true);
        await fetchNextPage();
    }, [fetchNextPage]);

    return {
        nfts,
        isLoading,
        error,
        hasMore,
        fetchNextPage,
        refetch
    };
}; 