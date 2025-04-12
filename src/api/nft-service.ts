import axios from 'axios';
import { NFTsResponse, NFT } from '../types/nft';
import { convertIpfsToHttp, getPlaceholderImageWithIndex } from '../utils/helpers';

const BASE_URL = 'https://glacier-api.avax.network/v1/chains/43114';
const ADDRESS = '0x69155e7ca2e688ccdc247f6c4ddf374b3ae77bd6';

export const fetchNFTs = async (pageSize = 10, pageToken?: string): Promise<NFTsResponse> => {
    try {
        // Construct the endpoint
        const endpoint = `${BASE_URL}/addresses/${ADDRESS}/balances:listCollectibles`;
        const params = {
            pageSize,
            ...(pageToken && { pageToken })
        };

        const response = await axios.get(endpoint, { params });

        // Check if response has collectibleBalances
        const apiCollectibles = response.data.collectibleBalances;

        if (!apiCollectibles || apiCollectibles.length === 0) {
            // Return empty response
            return {
                collectibles: [],
                nextPageToken: undefined,
                total: 0,
                page: 1,
                limit: pageSize,
                hasMore: false
            };
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
                        const metadataResponse = await axios.get(convertIpfsToHttp(item.tokenUri));
                        metadata = metadataResponse.data;

                        if (metadata.image) {
                            imageUrl = convertIpfsToHttp(metadata.image);
                        }

                        if (metadata.name) {
                            name = metadata.name;
                        }

                        if (metadata.description) {
                            description = metadata.description;
                        }
                    } catch (metadataError) {
                        // Silently handle metadata fetch errors
                    }
                } else if (item.tokenUri) {
                    // The tokenUri itself might be the image URL
                    imageUrl = convertIpfsToHttp(item.tokenUri);
                }

                // If we still don't have an image URL, use a placeholder
                if (!imageUrl) {
                    imageUrl = getPlaceholderImageWithIndex(index);
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
                        imageUrl: metadata.image ? convertIpfsToHttp(metadata.image) : getPlaceholderImageWithIndex(index)
                    },
                    metadata: metadata,
                    price: metadata.price || 0,
                    owner: metadata.owner || 'Unknown',
                    createdAt: new Date().toISOString()
                };
            } catch (error) {
                // Return a basic NFT with placeholder image if transformation fails
                return {
                    id: `${item.address}-${item.tokenId}`,
                    contractAddress: item.address,
                    tokenId: item.tokenId,
                    name: item.name || `NFT #${item.tokenId}`,
                    description: '',
                    mediaType: 'image/jpeg',
                    mediaUrl: getPlaceholderImageWithIndex(index),
                    thumbnailUrl: getPlaceholderImageWithIndex(index),
                    imageUrl: getPlaceholderImageWithIndex(index),
                    creator: 'Unknown',
                    collection: {
                        name: 'Unknown Collection',
                        description: '',
                        imageUrl: getPlaceholderImageWithIndex(index)
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
            console.error('API error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText
            });
        }

        // Return empty response on error
        return {
            collectibles: [],
            nextPageToken: undefined,
            total: 0,
            page: 1,
            limit: pageSize,
            hasMore: false
        };
    }
};
