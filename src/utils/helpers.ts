/**
 * Utility helper functions for the NFT Explorer application
 */

/**
 * Converts IPFS URLs to HTTP URLs for better compatibility
 * @param ipfsUrl - The IPFS URL to convert
 * @returns The converted HTTP URL
 */
export const convertIpfsToHttp = (ipfsUrl: string): string => {
    if (ipfsUrl.startsWith('ipfs://')) {
        return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
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
    return `https://picsum.photos/400/400?random=${id.replace(/[^0-9]/g, '')}`;
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
