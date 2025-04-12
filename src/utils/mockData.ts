import { NFT } from '../types/nft';
import { getPlaceholderImageWithIndex } from './helpers';

/**
 * Generates mock NFT data for testing or when API returns empty results
 */
export const generateMockNFTs = (count: number = 3): NFT[] => {
    return Array.from({ length: count }).map((_, index) => ({
        id: `mock-${index + 1}`,
        contractAddress: '0x8f12d7b9335e460ad8f5e3b47abe89f36f59953f',
        tokenId: (index + 1).toString(),
        name: getMockNFTName(index),
        description: getMockNFTDescription(index),
        mediaType: 'image/jpeg',
        mediaUrl: getPlaceholderImageWithIndex(index),
        thumbnailUrl: getPlaceholderImageWithIndex(index),
        imageUrl: getPlaceholderImageWithIndex(index),
        price: (index + 0.5) * 0.5,
        owner: 'Anonymous',
        createdAt: new Date().toISOString(),
        creator: 'Mock Creator',
        collection: {
            name: 'Mock Collection',
            description: 'A collection of mock NFTs',
            imageUrl: getPlaceholderImageWithIndex(index)
        },
        metadata: {}
    }));
};

/**
 * Gets a name for a mock NFT
 */
const getMockNFTName = (index: number): string => {
    const adjectives = ['Awesome', 'Gorgeous', 'Stunning', 'Beautiful', 'Amazing', 'Incredible'];
    const adjective = adjectives[index % adjectives.length];
    return `${adjective} NFT #${index + 1}`;
};

/**
 * Gets a description for a mock NFT
 */
const getMockNFTDescription = (index: number): string => {
    const descriptions = [
        'This is a beautiful mock NFT for testing',
        'Another beautiful mock NFT for testing',
        'Yet another beautiful mock NFT for testing',
        'A stunning NFT created for testing purposes',
        'This NFT was created as a mock for development'
    ];
    return descriptions[index % descriptions.length];
}; 
