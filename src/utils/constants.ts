/**
 * Application-wide constants
 */

// API Configuration
export const API = {
    BASE_URL: 'https://glacier-api.avax.network/v1/chains/43114',
    ADDRESSES: {
        DEFAULT: '0x69155e7ca2e688ccdc247f6c4ddf374b3ae77bd6',
    },
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        MAX_PAGE_SIZE: 50
    }
};

// IPFS Configuration
export const IPFS = {
    GATEWAYS: [
        'https://dweb.link/ipfs/',
        'https://gateway.pinata.cloud/ipfs/',
        'https://cloudflare-ipfs.com/ipfs/',
        'https://ipfs.io/ipfs/',
        'https://gateway.ipfs.io/ipfs/'
    ],
    DEFAULT_GATEWAY: 'https://ipfs.io/ipfs/'
};

// Image Placeholders
export const IMAGES = {
    PLACEHOLDER_BASE: 'https://picsum.photos/400/400',
    DEFAULT_NFT_IMAGE: '/assets/images/nft-placeholder.png'
};

// App-wide timeout values (in milliseconds)
export const TIMEOUTS = {
    API_REQUEST: 5000,
    GATEWAY_CHECK: 3000
};

// Collection Default Values
export const COLLECTION = {
    DEFAULT_NAME: 'Unknown Collection',
    DEFAULT_DESCRIPTION: 'No description available'
};

// Common Values
export const COMMON = {
    UNKNOWN_CREATOR: 'Unknown',
    UNKNOWN_OWNER: 'Unknown'
}; 
