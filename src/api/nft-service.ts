import axios from 'axios';
import { NFTsResponse } from '../types/nft';

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
        return response.data;
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        throw error;
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
