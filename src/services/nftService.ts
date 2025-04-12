import { NFT, NFTsResponse } from '../types/nft';

const API_BASE_URL = 'https://api.example.com'; // Replace with your actual API endpoint

export const fetchNFTs = async (page: number = 1, limit: number = 10): Promise<NFTsResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/nfts?page=${page}&limit=${limit}`);
        if (!response.ok) {
            throw new Error('Failed to fetch NFTs');
        }
        return await response.json();
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