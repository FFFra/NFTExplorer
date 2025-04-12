import axios from 'axios';
import { NFTsResponse, NFT } from '../types/nft';

// Updated to the correct Avalanche address
const BASE_URL = 'https://glacier-api.avax.network/v1/chains/43114';
const ADDRESS = '0x69155e7ca2e688ccdc247f6c4ddf374b3ae77bd6';

// Function to convert IPFS URL to HTTP URL
const convertIpfsToHttp = (ipfsUrl: string): string => {
    if (!ipfsUrl) return '';
    if (ipfsUrl.startsWith('ipfs://')) {
        return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return ipfsUrl;
};

// Function to generate a placeholder image
const getPlaceholderImage = (index?: number): string => {
    const random = index !== undefined ? index % 10 : Math.floor(Math.random() * 10);
    return `https://picsum.photos/400/400?random=${random}`;
};

// Mock NFT data to use as fallback when API returns empty results
const MOCK_NFTS: NFT[] = [
    {
        id: 'mock-1',
        contractAddress: '0x8f12d7b9335e460ad8f5e3b47abe89f36f59953f',
        tokenId: '1',
        name: 'Awesome NFT #1',
        description: 'This is a beautiful mock NFT for testing',
        mediaType: 'image/jpeg',
        mediaUrl: 'https://picsum.photos/400/400?random=1',
        thumbnailUrl: 'https://picsum.photos/200/200?random=1',
        imageUrl: 'https://picsum.photos/400/400?random=1',
        price: 0.5,
        owner: 'Anonymous',
        createdAt: new Date().toISOString(),
        creator: 'Mock Creator',
        collection: {
            name: 'Mock Collection',
            description: 'A collection of mock NFTs',
            imageUrl: 'https://picsum.photos/100/100?random=1'
        },
        metadata: {}
    },
    {
        id: 'mock-2',
        contractAddress: '0x8f12d7b9335e460ad8f5e3b47abe89f36f59953f',
        tokenId: '2',
        name: 'Gorgeous NFT #2',
        description: 'Another beautiful mock NFT for testing',
        mediaType: 'image/jpeg',
        mediaUrl: 'https://picsum.photos/400/400?random=2',
        thumbnailUrl: 'https://picsum.photos/200/200?random=2',
        imageUrl: 'https://picsum.photos/400/400?random=2',
        price: 1.2,
        owner: 'Anonymous',
        createdAt: new Date().toISOString(),
        creator: 'Mock Creator',
        collection: {
            name: 'Mock Collection',
            description: 'A collection of mock NFTs',
            imageUrl: 'https://picsum.photos/100/100?random=2'
        },
        metadata: {}
    },
    {
        id: 'mock-3',
        contractAddress: '0x8f12d7b9335e460ad8f5e3b47abe89f36f59953f',
        tokenId: '3',
        name: 'Stunning NFT #3',
        description: 'Yet another beautiful mock NFT for testing',
        mediaType: 'image/jpeg',
        mediaUrl: 'https://picsum.photos/400/400?random=3',
        thumbnailUrl: 'https://picsum.photos/200/200?random=3',
        imageUrl: 'https://picsum.photos/400/400?random=3',
        price: 2.0,
        owner: 'Anonymous',
        createdAt: new Date().toISOString(),
        creator: 'Mock Creator',
        collection: {
            name: 'Mock Collection',
            description: 'A collection of mock NFTs',
            imageUrl: 'https://picsum.photos/100/100?random=3'
        },
        metadata: {}
    }
];

export const fetchNFTs = async (pageSize = 10, pageToken?: string): Promise<NFTsResponse> => {
    console.warn('fetchNFTs called with pageSize:', pageSize, 'pageToken:', pageToken);
    try {
        // Construct the endpoint
        const endpoint = `${BASE_URL}/addresses/${ADDRESS}/balances:listCollectibles`;
        const params = {
            pageSize,
            ...(pageToken && { pageToken })
        };

        console.warn('Fetching from endpoint:', endpoint, 'with params:', params);
        const response = await axios.get(endpoint, { params });
        console.warn('API Response status:', response.status);
        console.warn('API Response data structure:', Object.keys(response.data));

        // Check if response has collectibleBalances
        const apiCollectibles = response.data.collectibleBalances;

        if (!apiCollectibles || apiCollectibles.length === 0) {
            console.warn('No NFTs found in API response, using mock data instead');
            // Return mock data
            const page = pageToken ? parseInt(pageToken, 10) : 1;
            const startIdx = (page - 1) * pageSize;
            const endIdx = Math.min(startIdx + pageSize, MOCK_NFTS.length);
            const paginatedMockNFTs = MOCK_NFTS.slice(startIdx, endIdx);

            return {
                collectibles: paginatedMockNFTs,
                nextPageToken: endIdx < MOCK_NFTS.length ? String(page + 1) : undefined,
                total: MOCK_NFTS.length,
                page: page,
                limit: pageSize,
                hasMore: endIdx < MOCK_NFTS.length
            };
        }

        console.warn(`Found ${apiCollectibles.length} NFTs in the response`);

        // Print a sample collectible for debugging
        if (apiCollectibles.length > 0) {
            console.warn('Sample collectible:', JSON.stringify(apiCollectibles[0], null, 2));
        }

        // Transform the API response to match our types
        const transformedCollectibles: NFT[] = await Promise.all(apiCollectibles.map(async (item: any, index: number) => {
            try {
                let metadata = item.metadata || {};
                let imageUrl = '';
                let name = item.name || `NFT #${item.tokenId}`;
                let description = '';

                // If this is a JSON URL, try to fetch the metadata
                if (item.tokenUri && item.tokenUri.endsWith('.json')) {
                    try {
                        console.warn(`Fetching metadata for NFT ${item.tokenId} from ${item.tokenUri}`);
                        const metadataResponse = await axios.get(convertIpfsToHttp(item.tokenUri));
                        metadata = metadataResponse.data;

                        if (metadata.image) {
                            imageUrl = convertIpfsToHttp(metadata.image);
                            console.warn(`Found image URL in metadata: ${imageUrl}`);
                        }

                        if (metadata.name) {
                            name = metadata.name;
                        }

                        if (metadata.description) {
                            description = metadata.description;
                        }
                    } catch (metadataError) {
                        console.warn(`Error fetching metadata for NFT ${item.tokenId}:`, metadataError);
                    }
                } else if (item.tokenUri) {
                    // The tokenUri itself might be the image URL
                    imageUrl = convertIpfsToHttp(item.tokenUri);
                }

                // If we still don't have an image URL, use a placeholder
                if (!imageUrl) {
                    imageUrl = getPlaceholderImage(index);
                    console.warn(`Using placeholder image for NFT ${item.tokenId}: ${imageUrl}`);
                }

                return {
                    id: `${item.address}-${item.tokenId}`,
                    contractAddress: item.address,
                    tokenId: item.tokenId,
                    name: name,
                    description: description || metadata.description || '',
                    mediaType: metadata.mediaType || 'image/jpeg',
                    mediaUrl: imageUrl,
                    thumbnailUrl: imageUrl,
                    imageUrl: imageUrl,
                    creator: metadata.creator || 'Unknown',
                    collection: {
                        name: item.name || 'Unknown Collection',
                        description: metadata.description || '',
                        imageUrl: metadata.image ? convertIpfsToHttp(metadata.image) : getPlaceholderImage(index)
                    },
                    metadata: metadata,
                    price: metadata.price || 0,
                    owner: metadata.owner || 'Unknown',
                    createdAt: new Date().toISOString()
                };
            } catch (error) {
                console.error(`Error transforming NFT ${item.tokenId}:`, error);
                // Return a basic NFT with placeholder image if transformation fails
                return {
                    id: `${item.address}-${item.tokenId}`,
                    contractAddress: item.address,
                    tokenId: item.tokenId,
                    name: item.name || `NFT #${item.tokenId}`,
                    description: '',
                    mediaType: 'image/jpeg',
                    mediaUrl: getPlaceholderImage(index),
                    thumbnailUrl: getPlaceholderImage(index),
                    imageUrl: getPlaceholderImage(index),
                    creator: 'Unknown',
                    collection: {
                        name: 'Unknown Collection',
                        description: '',
                        imageUrl: getPlaceholderImage(index)
                    },
                    metadata: {},
                    price: 0,
                    owner: 'Unknown',
                    createdAt: new Date().toISOString()
                };
            }
        }));

        return {
            collectibles: transformedCollectibles,
            nextPageToken: response.data.nextPageToken,
            total: transformedCollectibles.length,
            page: 1,
            limit: pageSize,
            hasMore: !!response.data.nextPageToken
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

        // Return mock data on error
        return {
            collectibles: MOCK_NFTS,
            nextPageToken: undefined,
            total: MOCK_NFTS.length,
            page: 1,
            limit: pageSize,
            hasMore: false
        };
    }
};

export const isVideoMedia = (mediaType: string): boolean => {
    return mediaType.includes('video') || mediaType.includes('mp4');
};
