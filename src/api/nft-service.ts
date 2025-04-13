import axios from 'axios';
import { NFTsResponse, NFT } from '../types/nft';
import { getPlaceholderImageWithIndex } from '../utils/helpers';

const BASE_URL = 'https://glacier-api.avax.network/v1/chains/43114';
const ADDRESS = '0x69155e7ca2e688ccdc247f6c4ddf374b3ae77bd6';

// List of IPFS gateways to try in order
const IPFS_GATEWAYS = [
    'https://dweb.link/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://gateway.ipfs.io/ipfs/'
];

/**
 * Converts IPFS URL to HTTP URL using multiple gateways with fallback
 */
const convertIpfsToHttp = async (ipfsUrl: string): Promise<string> => {
    if (!ipfsUrl) return '';

    // If it's already an HTTP URL, return it
    if (ipfsUrl.startsWith('http')) {
        return ipfsUrl;
    }

    // Handle ipfs:// protocol
    if (ipfsUrl.startsWith('ipfs://')) {
        const cid = ipfsUrl.replace('ipfs://', '');

        // Try each gateway until one works
        for (const gateway of IPFS_GATEWAYS) {
            const fullUrl = `${gateway}${cid}`;
            try {
                // Make a HEAD request to check if the URL is accessible
                await axios.head(fullUrl, { timeout: 3000 });
                console.log(`Successfully validated gateway: ${fullUrl}`);
                return fullUrl;
            } catch (error) {
                console.warn(`Gateway ${gateway} failed for ${cid}, trying next...`);
                // Continue to the next gateway
            }
        }

        // If all gateways failed, return the URL with the first gateway anyway
        return `${IPFS_GATEWAYS[0]}${cid}`;
    }

    return ipfsUrl;
};

/**
 * Fetch metadata from URI with retry logic across multiple gateways
 */
const fetchMetadata = async (tokenUri: string): Promise<any> => {
    if (!tokenUri) return {};

    try {
        // First convert the URI to use a gateway
        const httpUri = await convertIpfsToHttp(tokenUri);

        console.log(`Fetching metadata from: ${httpUri}`);
        const response = await axios.get(httpUri, { timeout: 5000 });
        return response.data;
    } catch (error) {
        // If the tokenUri itself isn't accessible via the selected gateway, try others
        if (tokenUri.startsWith('ipfs://')) {
            const cid = tokenUri.replace('ipfs://', '');

            for (let i = 1; i < IPFS_GATEWAYS.length; i++) {  // Start from 1 since we already tried the first one
                try {
                    const uri = `${IPFS_GATEWAYS[i]}${cid}`;
                    console.log(`Trying alternative gateway for metadata: ${uri}`);
                    const response = await axios.get(uri, { timeout: 5000 });
                    return response.data;
                } catch (gatewayError) {
                    // Continue to the next gateway
                }
            }
        }

        console.error(`All metadata fetch attempts failed for ${tokenUri}`);
        throw error;
    }
};

/**
 * Extract image URL from metadata and ensure it's HTTP accessible
 */
const extractImageUrl = async (metadata: any, fallbackUrl: string, index: number): Promise<string> => {
    // No metadata, use fallback
    if (!metadata) return fallbackUrl;

    // Check for image in metadata (common field)
    if (metadata.image) {
        try {
            return await convertIpfsToHttp(metadata.image);
        } catch (error) {
            console.warn(`Failed to convert image URL: ${metadata.image}`);
        }
    }

    // Try alternative image fields
    const imageFields = ['image_url', 'imageUrl', 'animation_url', 'media', 'mediaUrl'];
    for (const field of imageFields) {
        if (metadata[field]) {
            try {
                return await convertIpfsToHttp(metadata[field]);
            } catch (error) {
                console.warn(`Failed to convert ${field}: ${metadata[field]}`);
            }
        }
    }

    // Last resort: try to extract URL from metadata properties if it exists
    if (metadata.properties && metadata.properties.image) {
        try {
            return await convertIpfsToHttp(metadata.properties.image);
        } catch (error) {
            console.warn(`Failed to convert properties.image: ${metadata.properties.image}`);
        }
    }

    // No image found, use fallback
    return fallbackUrl;
};

/**
 * Determine media type based on URL or metadata
 */
const determineMediaType = (url: string, metadata: any): string => {
    // Check metadata first
    if (metadata && metadata.mediaType) return metadata.mediaType;
    if (metadata && metadata.media_type) return metadata.media_type;

    // Determine from URL extension
    if (!url) return 'image/jpeg';

    const extension = url.split('.').pop()?.toLowerCase();
    if (extension === 'png') return 'image/png';
    if (extension === 'gif') return 'image/gif';
    if (extension === 'svg') return 'image/svg+xml';
    if (extension === 'mp4') return 'video/mp4';
    if (extension === 'webm') return 'video/webm';
    if (extension === 'mp3') return 'audio/mpeg';

    // Default to JPEG
    return 'image/jpeg';
};

export const fetchNFTs = async (pageSize = 10, pageToken?: string): Promise<NFTsResponse> => {
    try {
        // Construct the endpoint
        const endpoint = `${BASE_URL}/addresses/${ADDRESS}/balances:listCollectibles`;
        const params = {
            pageSize,
            ...(pageToken && { pageToken })
        };

        console.log(`Fetching NFTs from ${endpoint}`);
        const response = await axios.get(endpoint, { params });

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
            apiCollectibles.map(async (item: any, index: number) => {
                try {
                    let metadata = {};
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
                        name: item.name || 'Unknown Collection',
                        symbol: item.symbol || '',
                        description: metadata && metadata.collection?.description || '',
                        imageUrl: metadata && metadata.collection?.image
                            ? await convertIpfsToHttp(metadata.collection.image)
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
                        creator: metadata && metadata.creator || 'Unknown',
                        collection: collection,
                        metadata: metadata,
                        price: metadata && metadata.price || 0,
                        owner: metadata && metadata.owner || 'Unknown',
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
                        creator: 'Unknown',
                        collection: {
                            name: item.name || 'Unknown Collection',
                            description: '',
                            imageUrl: getPlaceholderImageWithIndex(index)
                        },
                        metadata: {},
                        price: 0,
                        owner: 'Unknown',
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