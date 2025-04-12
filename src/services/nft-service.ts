import { NFT, NFTsResponse } from '../types/nft';

const API_BASE_URL = 'https://glacier-api.avax.network/v1/chains/43114';
const ADDRESS = '0x69155e7ca2e688ccdc247f6c4ddf374b3ae77bd6';

export const fetchNFTs = async (pageSize = 10, pageToken?: number): Promise<NFTsResponse> => {
    try {
        const endpoint = `${API_BASE_URL}/addresses/${ADDRESS}/balances:listCollectibles`;
        const params = new URLSearchParams({
            pageSize: pageSize.toString(),
            ...(pageToken !== undefined && { pageToken: pageToken.toString() })
        });

        console.warn('Fetching NFTs from endpoint:', `${endpoint}?${params}`);
        const response = await fetch(`${endpoint}?${params}`);
        console.warn('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch NFTs: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.warn('Response data:', JSON.stringify(data, null, 2));

        // Transform the API response to match our types
        const transformedCollectibles = (data.result?.collectibles || []).map((item: any) => ({
            id: item.id || `${item.contractAddress}-${item.tokenId}`,
            contractAddress: item.contractAddress || '',
            tokenId: item.tokenId || '',
            name: item.name || `NFT #${item.tokenId}`,
            description: item.description || '',
            mediaType: item.mediaType || 'image/jpeg',
            mediaUrl: item.mediaUrl || 'https://via.placeholder.com/300x300?text=NFT',
            thumbnailUrl: item.thumbnailUrl || item.mediaUrl || 'https://via.placeholder.com/300x300?text=NFT',
            creator: item.creator || 'Unknown',
            collection: item.collection ? {
                name: item.collection.name || 'Unknown Collection',
                description: item.collection.description || '',
                imageUrl: item.collection.imageUrl || 'https://via.placeholder.com/300x300?text=NFT'
            } : {
                name: 'Unknown Collection',
                description: '',
                imageUrl: 'https://via.placeholder.com/300x300?text=NFT'
            },
            metadata: item.metadata || {}
        }));

        return {
            collectibles: transformedCollectibles,
            nextPageToken: data.result?.nextPageToken,
            total: data.result?.total || 0,
            page: data.result?.page || 1,
            limit: data.result?.limit || pageSize,
            hasMore: data.result?.hasMore || false
        };
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        throw error;
    }
};

export const getNFTById = async (id: string): Promise<NFT> => {
    try {
        const response = await fetch(`${API_BASE_URL}/nfts/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch NFT');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching NFT:', error);
        throw error;
    }
};

export const searchNFTs = async (query: string): Promise<NFTsResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/nfts/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Failed to search NFTs');
        }
        return await response.json();
    } catch (error) {
        console.error('Error searching NFTs:', error);
        throw error;
    }
}; 