import axios from 'axios';
import { NFTsResponse, NFT } from '../types/nft';
import { getPlaceholderImageWithIndex } from '../utils/helpers';

const BASE_URL = 'https://glacier-api.avax.network/v1/chains/43114';
const ADDRESS = '0x69155e7ca2e688ccdc247f6c4ddf374b3ae77bd6';

// Better IPFS gateway handling
const convertIpfsToHttp = (ipfsUrl: string): string => {
    if (!ipfsUrl) return '';

    // Handle ipfs:// protocol
    if (ipfsUrl.startsWith('ipfs://')) {
        const cid = ipfsUrl.replace('ipfs://', '');
        return `https://ipfs.io/ipfs/${cid}`;
    }

    // Already HTTP URL
    return ipfsUrl;
};

export const fetchNFTs = async (pageSize = 10, pageToken?: string): Promise<NFTsResponse> => {
    try {
        // Construct the endpoint
        const endpoint = `${BASE_URL}/addresses/${ADDRESS}/balances:listCollectibles`;
        const params = {
            pageSize,
            ...(pageToken && { pageToken })
        };

        console.log('Fetching NFTs from endpoint:', endpoint);
        const response = await axios.get(endpoint, { params });

        // Check if response has collectibleBalances
        const apiCollectibles = response.data.collectibleBalances;

        if (!apiCollectibles || apiCollectibles.length === 0) {
            console.log('No collectibles found');
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

        // Transform the API response to match our types
        const transformedCollectibles: NFT[] = await Promise.all(apiCollectibles.map(async (item: any, index: number) => {
            try {
                let metadata = {};
                let imageUrl = '';
                let name = item.name || `NFT #${item.tokenId}`;
                let description = '';

                // Only attempt to fetch metadata if tokenUri exists
                if (item.tokenUri) {
                    console.log(`Processing tokenUri: ${item.tokenUri} for NFT #${index}`);
                    try {
                        // Convert IPFS URI to HTTP and fetch metadata
                        const httpUri = convertIpfsToHttp(item.tokenUri);
                        console.log(`Fetching metadata from: ${httpUri}`);

                        const metadataResponse = await axios.get(httpUri, { timeout: 10000 });
                        metadata = metadataResponse.data;

                        console.log(`Metadata fetched successfully for ${name}`);

                        // Get name from metadata if available
                        if (metadata && metadata.name) {
                            name = metadata.name;
                        }

                        // Get description from metadata if available
                        if (metadata && metadata.description) {
                            description = metadata.description;
                        }

                        // Check for image in metadata
                        if (metadata && metadata.image) {
                            // Convert IPFS image URL to HTTP
                            imageUrl = convertIpfsToHttp(metadata.image);
                            console.log(`Found image URL in metadata: ${imageUrl}`);
                        }
                    } catch (metadataError) {
                        console.error(`Error fetching metadata for ${item.tokenUri}:`, metadataError);
                        // Try using tokenUri directly as image URL if metadata fetch fails
                        imageUrl = convertIpfsToHttp(item.tokenUri);
                    }
                } else {
                    console.log(`No tokenUri for NFT at index ${index}`);
                }

                // If no image found, try alternative fields
                if (!imageUrl && metadata) {
                    const imageFields = ['image_url', 'imageUrl', 'animation_url', 'media'];
                    for (const field of imageFields) {
                        if (metadata[field]) {
                            imageUrl = convertIpfsToHttp(metadata[field]);
                            console.log(`Using alternative image field ${field}: ${imageUrl}`);
                            break;
                        }
                    }
                }

                // Fallback to placeholder if still no image
                if (!imageUrl) {
                    console.log(`No image found for NFT ${name}, using placeholder`);
                    imageUrl = getPlaceholderImageWithIndex(index);
                }

                // Determine media type based on URL extension
                let mediaType = 'image/jpeg';
                if (imageUrl.endsWith('.png')) mediaType = 'image/png';
                else if (imageUrl.endsWith('.gif')) mediaType = 'image/gif';
                else if (imageUrl.endsWith('.svg')) mediaType = 'image/svg+xml';
                else if (imageUrl.endsWith('.mp4')) mediaType = 'video/mp4';

                // Create the NFT object
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
                    creator: metadata.creator || 'Unknown',
                    collection: {
                        name: item.name || 'Unknown Collection',
                        description: metadata.description || '',
                        imageUrl: imageUrl
                    },
                    metadata: metadata,
                    price: metadata.price || 0,
                    owner: metadata.owner || 'Unknown',
                    createdAt: new Date().toISOString()
                };
            } catch (error) {
                console.error(`Error processing NFT at index ${index}:`, error);
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