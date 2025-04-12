import { useState, useCallback } from 'react';
import { fetchNFTs } from '../api/nft-service';
import { NFT } from '../types/nft';

export const useNFTs = () => {
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);

    const fetchNextPage = useCallback(async () => {
        if (!hasMore || isLoading) return;

        try {
            setIsLoading(true);
            setError(null);
            const response = await fetchNFTs(12, nextPageToken);

            setNfts(prev => [...prev, ...(response.collectibles || [])]);
            setNextPageToken(response.nextPageToken);
            setHasMore(!!response.nextPageToken);
            setPage(prev => prev + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
        } finally {
            setIsLoading(false);
        }
    }, [nextPageToken, hasMore, isLoading]);

    const refetch = useCallback(async () => {
        setNfts([]);
        setNextPageToken(undefined);
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
