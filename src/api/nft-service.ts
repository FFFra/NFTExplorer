import axios from 'axios';
import { NFTsResponse, NFT } from '../types/nft';

const BASE_URL = 'https://glacier-api.avax.network/v1/chains/43114';
const ADDRESS = '0x69155e7ca2e688ccdc247f6c4ddf374b3ae77bd6';

export const fetchNFTs = async (pageSize = 10, pageToken?: string): Promise<NFTsResponse> => {
    try {
        const endpoint = `${BASE_URL}/addresses/${ADDRESS}/balances:listCollectibles`;
        const params = {
            pageSize,
            ...(pageToken && { pageToken })
        };

        const response = await axios.get(endpoint, { params });
        console.log('API Response:', JSON.stringify(response.data, null, 2));

        // Transform the API response to match our types
        const transformedCollectibles: NFT[] = (response.data.result?.collectibles || []).map((item: any) => ({
            id: item.id || `${item.contractAddress}-${item.tokenId}`,
            contractAddress: item.contractAddress || '',
            tokenId: item.tokenId || '',
            name: item.name || `NFT #${item.tokenId}`,
            description: item.description || '',
            mediaType: item.mediaType || 'image/jpeg',
            mediaUrl: item.mediaUrl || getPlaceholderImage(),
            thumbnailUrl: item.thumbnailUrl || item.mediaUrl || getPlaceholderImage(),
            creator: item.creator,
            collection: item.collection ? {
                name: item.collection.name || 'Unknown Collection',
                description: item.collection.description || '',
                imageUrl: item.collection.imageUrl || getPlaceholderImage()
            } : {
                name: 'Unknown Collection',
                description: '',
                imageUrl: getPlaceholderImage()
            },
            metadata: item.metadata || {}
        }));

        return {
            collectibles: transformedCollectibles,
            nextPageToken: response.data.result?.nextPageToken
        };
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        if (axios.isAxiosError(error)) {
            console.error('Axios error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
        }
        return {
            collectibles: [],
            nextPageToken: undefined
        };
    }
};

// Function to determine if media is video
export const isVideoMedia = (mediaType: string): boolean => {
    return mediaType.includes('video') || mediaType.includes('mp4');
};

// Function to generate a placeholder if media URL is missing
export const getPlaceholderImage = (): string => {
    return 'https://via.placeholder.com/300x300?text=NFT';
};
