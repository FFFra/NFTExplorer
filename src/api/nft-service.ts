import axios from 'axios';
import { NFTsResponse, NFT, ApiCollectible, ApiResponse, NFTMetadata } from '../types/nft';
import {
    getPlaceholderImageWithIndex,
    convertIpfsToHttpAsync,
    determineMediaType,
    fetchMetadata,
    extractImageUrl
} from '../utils/helpers';
import { API, COMMON, COLLECTION } from '../utils/constants';

export const fetchNFTs = async (pageSize = API.PAGINATION.DEFAULT_PAGE_SIZE, pageToken?: string): Promise<NFTsResponse> => {
    try {
        // Construct the endpoint
        const endpoint = `${API.BASE_URL}/addresses/${API.ADDRESSES.DEFAULT}/balances:listCollectibles`;
        const params = {
            pageSize,
            ...(pageToken && { pageToken })
        };

        console.log(`Fetching NFTs from ${endpoint}`);
        const response = await axios.get<ApiResponse>(endpoint, { params });

        // Check if response has collectibleBalances
        const apiCollectibles = response.data.collectibleBalances;

        if (!apiCollectibles || apiCollectibles.length === 0) {
            console.log('No collectibles found in API response');
            return {
                collectibles: [],
                nextPageToken: undefined,
                total: 0,
                page: 1,
                limit: pageSize,
                hasMore: false
            };
        }

        console.log(`Found ${apiCollectibles.length} collectibles`);

        // Process collectibles with retry logic
        const transformedCollectibles: NFT[] = await Promise.all(
            apiCollectibles.map(async (item: ApiCollectible, index: number) => {
                try {
                    let metadata: NFTMetadata = {};
                    let name = item.name || `NFT #${item.tokenId}`;
                    let description = '';

                    // Create placeholder as fallback
                    const placeholderImage = getPlaceholderImageWithIndex(index);

                    // Try to fetch metadata if tokenUri exists
                    if (item.tokenUri) {
                        try {
                            console.log(`Processing tokenUri for NFT #${index}: ${item.tokenUri}`);
                            metadata = await fetchMetadata(item.tokenUri);

                            // Extract name and description if available
                            if (metadata && metadata.name) {
                                name = metadata.name;
                            }

                            if (metadata && metadata.description) {
                                description = metadata.description;
                            }
                        } catch (metadataError) {
                            console.error(`Failed to fetch metadata for NFT #${index}:`, metadataError);
                        }
                    } else {
                        console.log(`No tokenUri for NFT at index ${index}`);
                    }

                    // Extract image URL with fallbacks
                    const imageUrl = await extractImageUrl(metadata, placeholderImage, index);

                    // Determine media type
                    const mediaType = determineMediaType(imageUrl, metadata);

                    // Construct collection info
                    const collection = {
                        name: item.name || COLLECTION.DEFAULT_NAME,
                        symbol: item.symbol || '',
                        description: metadata && metadata.collection?.description || COLLECTION.DEFAULT_DESCRIPTION,
                        imageUrl: metadata && metadata.collection?.image
                            ? await convertIpfsToHttpAsync(metadata.collection.image)
                            : imageUrl
                    };

                    // Create NFT object
                    return {
                        id: `${item.address}-${item.tokenId}`,
                        contractAddress: item.address,
                        tokenId: item.tokenId,
                        name: name,
                        description: description,
                        mediaType: mediaType,
                        mediaUrl: imageUrl,
                        thumbnailUrl: imageUrl,
                        imageUrl: imageUrl,
                        creator: metadata && metadata.creator || COMMON.UNKNOWN_CREATOR,
                        collection: collection,
                        metadata: metadata,
                        price: metadata && metadata.price || 0,
                        owner: metadata && metadata.owner || COMMON.UNKNOWN_OWNER,
                        createdAt: new Date().toISOString(),
                        ercType: item.ercType || 'ERC-721'
                    };
                } catch (error) {
                    console.error(`Error processing NFT ${item.address}-${item.tokenId}:`, error);

                    // Return basic NFT with placeholder on error
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
                        creator: COMMON.UNKNOWN_CREATOR,
                        collection: {
                            name: item.name || COLLECTION.DEFAULT_NAME,
                            description: COLLECTION.DEFAULT_DESCRIPTION,
                            imageUrl: getPlaceholderImageWithIndex(index)
                        },
                        metadata: {},
                        price: 0,
                        owner: COMMON.UNKNOWN_OWNER,
                        createdAt: new Date().toISOString(),
                        ercType: item.ercType || 'ERC-721'
                    };
                }
            })
        );

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
