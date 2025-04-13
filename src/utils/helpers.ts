/**
 * Utility helper functions for the NFT Explorer application
 */
import axios from 'axios';
import { NFTMetadata } from '../types/nft';
import { IPFS, TIMEOUTS, IMAGES } from './constants';

// List of IPFS gateways to try in order
export const IPFS_GATEWAYS = IPFS.GATEWAYS;

/**
 * Converts IPFS URLs to HTTP URLs for better compatibility
 * Simple synchronous version for basic conversions
 * @param ipfsUrl - The IPFS URL to convert
 * @returns The converted HTTP URL
 */
export const convertIpfsToHttp = (ipfsUrl: string): string => {
    if (!ipfsUrl) return '';
    if (ipfsUrl.startsWith('ipfs://')) {
        return ipfsUrl.replace('ipfs://', IPFS.DEFAULT_GATEWAY);
    }
    return ipfsUrl;
};

/**
 * Converts IPFS URL to HTTP URL using multiple gateways with fallback
 * Advanced async version that tries multiple gateways
 * @param ipfsUrl - The IPFS URL to convert
 * @returns Promise resolving to the best available HTTP URL
 */
export const convertIpfsToHttpAsync = async (ipfsUrl: string): Promise<string> => {
    if (!ipfsUrl) return '';

    // If it's already an HTTP URL, return it
    if (ipfsUrl.startsWith('http')) {
        return ipfsUrl;
    }

    // Handle ipfs:// protocol
    if (ipfsUrl.startsWith('ipfs://')) {
        const cid = ipfsUrl.replace('ipfs://', '');

        // Try each gateway until one works
        for (const gateway of IPFS.GATEWAYS) {
            const fullUrl = `${gateway}${cid}`;
            try {
                // Make a HEAD request to check if the URL is accessible
                await axios.head(fullUrl, { timeout: TIMEOUTS.GATEWAY_CHECK });
                console.log(`Successfully validated gateway: ${fullUrl}`);
                return fullUrl;
            } catch (error) {
                console.warn(`Gateway ${gateway} failed for ${cid}, trying next...`);
                // Continue to the next gateway
            }
        }

        // If all gateways failed, return the URL with the first gateway anyway
        return `${IPFS.GATEWAYS[0]}${cid}`;
    }

    return ipfsUrl;
};

/**
 * Checks if a URL is a JSON metadata URL
 * @param url - The URL to check
 * @returns Boolean indicating if the URL points to a JSON file
 */
export const isJsonMetadataUrl = (url: string): boolean => {
    return url.endsWith('.json');
};

/**
 * Gets a placeholder image when all other sources fail
 * @param id - An identifier to generate a consistent random image
 * @returns A URL to a placeholder image
 */
export const getPlaceholderImage = (id: string): string => {
    return `${IMAGES.PLACEHOLDER_BASE}?random=${id.replace(/[^0-9]/g, '')}`;
};

/**
 * Gets a placeholder image using an index number
 * @param index - Optional index to use for random seed
 * @returns A URL to a placeholder image
 */
export const getPlaceholderImageWithIndex = (index?: number): string => {
    const random = index !== undefined ? index % 10 : Math.floor(Math.random() * 10);
    return `${IMAGES.PLACEHOLDER_BASE}?random=${random}`;
};

/**
 * Selects the best image URL from an NFT object
 * @param nft - The NFT object containing various image URLs
 * @returns The best available image URL
 */
export const getBestImageUrl = (nft: any): string => {
    return nft.imageUrl || nft.thumbnailUrl || nft.mediaUrl || getPlaceholderImage(nft.id);
};

/**
 * Formats an address string for display
 * @param address - The full address string
 * @param startChars - Number of characters to show at the start (default: 6)
 * @param endChars - Number of characters to show at the end (default: 4)
 * @returns Formatted address with ellipsis
 */
export const formatAddress = (address?: string, startChars = 6, endChars = 4): string => {
    if (!address) return 'Unknown';
    if (address.length <= startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Checks if a media type is a video format
 * @param mediaType - The media type/mime type to check
 * @returns Boolean indicating if the media is a video
 */
export const isVideoMedia = (mediaType: string): boolean => {
    return mediaType.includes('video') || mediaType.includes('mp4');
};

/**
 * Determine media type based on URL or metadata
 * @param url - The URL to analyze
 * @param metadata - Optional metadata that might contain media type info
 * @returns The detected media MIME type
 */
export const determineMediaType = (url: string, metadata: any): string => {
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

/**
 * Fetch metadata from URI with retry logic across multiple gateways
 * @param tokenUri - The URI to fetch metadata from
 * @returns Promise resolving to the NFT metadata
 */
export const fetchMetadata = async (tokenUri: string): Promise<NFTMetadata> => {
    if (!tokenUri) return {};

    try {
        // First convert the URI to use a gateway
        const httpUri = await convertIpfsToHttpAsync(tokenUri);

        console.log(`Fetching metadata from: ${httpUri}`);
        const response = await axios.get(httpUri, { timeout: 5000 });
        return response.data;
    } catch (error) {
        // If the tokenUri itself isn't accessible via the selected gateway, try others
        if (tokenUri.startsWith('ipfs://')) {
            const cid = tokenUri.replace('ipfs://', '');

            for (let i = 1; i < IPFS.GATEWAYS.length; i++) {  // Start from 1 since we already tried the first one
                try {
                    const uri = `${IPFS.GATEWAYS[i]}${cid}`;
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
 * @param metadata - The NFT metadata to extract the image URL from
 * @param fallbackUrl - Fallback URL to use if no image is found
 * @param index - Optional index for generating placeholder images
 * @returns Promise resolving to the best available image URL
 */
export const extractImageUrl = async (metadata: NFTMetadata, fallbackUrl: string, index: number): Promise<string> => {
    // No metadata, use fallback
    if (!metadata) return fallbackUrl;

    // Check for image in metadata (common field)
    if (metadata.image) {
        try {
            return await convertIpfsToHttpAsync(metadata.image);
        } catch (error) {
            console.warn(`Failed to convert image URL: ${metadata.image}`);
        }
    }

    // Try alternative image fields
    const imageFields = ['image_url', 'imageUrl', 'animation_url', 'media', 'mediaUrl'];
    for (const field of imageFields) {
        if (metadata[field]) {
            try {
                return await convertIpfsToHttpAsync(metadata[field]);
            } catch (error) {
                console.warn(`Failed to convert ${field}: ${metadata[field]}`);
            }
        }
    }

    // Last resort: try to extract URL from metadata properties if it exists
    if (metadata.properties && metadata.properties.image) {
        try {
            return await convertIpfsToHttpAsync(metadata.properties.image);
        } catch (error) {
            console.warn(`Failed to convert properties.image: ${metadata.properties.image}`);
        }
    }

    // No image found, use fallback
    return fallbackUrl;
};
