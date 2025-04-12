import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate
} from 'react-native-reanimated';
import { NFT, GridColumns, ViewMode } from '../../types/nft';

interface NFTCardProps {
    nft: NFT;
    onPress: (nft: NFT) => void;
    columns: GridColumns;
    viewMode: ViewMode;
    index: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const convertIpfsToHttp = (ipfsUrl: string): string => {
    if (ipfsUrl.startsWith('ipfs://')) {
        return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return ipfsUrl;
};

// Function to check if a URL is a JSON metadata URL
const isJsonMetadataUrl = (url: string): boolean => {
    return url.endsWith('.json');
};

// Function to get a placeholder image when all else fails
const getPlaceholderImage = (): string => {
    return 'https://via.placeholder.com/300x300?text=NFT';
};

const NFTCard: React.FC<NFTCardProps> = ({
    nft,
    onPress,
    columns,
    viewMode,
    index
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [actualImageUrl, setActualImageUrl] = useState<string | null>(null);

    // Animated values
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);

    // Calculate dimensions based on column count and view mode
    const getCardWidth = () => {
        if (viewMode === 'list') return SCREEN_WIDTH - 32; // Full width minus padding

        const gap = 8;
        const totalGaps = columns - 1;
        const totalPadding = 32; // 16 on each side
        const availableWidth = SCREEN_WIDTH - totalPadding - (totalGaps * gap);
        return availableWidth / columns;
    };

    const cardWidth = getCardWidth();
    const cardHeight = viewMode === 'list' ? 120 : cardWidth;

    // Fetch metadata and extract image URL if needed
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                // Use the best available URL
                const sourceUrl = nft.imageUrl || nft.thumbnailUrl || nft.mediaUrl;

                if (!sourceUrl) {
                    console.warn(`No source URL available for NFT ${nft.id}`);
                    setActualImageUrl(getPlaceholderImage());
                    setIsLoading(false);
                    return;
                }

                // If the URL doesn't look like a JSON metadata file, use it directly
                if (!isJsonMetadataUrl(sourceUrl)) {
                    setActualImageUrl(sourceUrl);
                    return;
                }

                console.warn(`Fetching metadata for NFT ${nft.id} from ${sourceUrl}`);
                const response = await fetch(sourceUrl);
                const metadata = await response.json();

                console.warn(`Metadata for NFT ${nft.id}:`, metadata);

                // Extract the image URL from the metadata
                if (metadata && metadata.image) {
                    const imageUrl = convertIpfsToHttp(metadata.image);
                    console.warn(`Extracted image URL for NFT ${nft.id}: ${imageUrl}`);
                    setActualImageUrl(imageUrl);
                } else {
                    console.warn(`No image found in metadata for NFT ${nft.id}`);
                    setActualImageUrl(getPlaceholderImage());
                }
            } catch (error) {
                console.error(`Error fetching metadata for NFT ${nft.id}:`, error);
                setActualImageUrl(getPlaceholderImage());
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetadata();
    }, [nft.id, nft.imageUrl, nft.thumbnailUrl, nft.mediaUrl]);

    // Animation for scale effect on press
    const onPressIn = () => {
        scale.value = withSpring(0.95, { damping: 15 });
    };

    const onPressOut = () => {
        scale.value = withSpring(1, { damping: 15 });
    };

    // Animation for appearing when loaded
    React.useEffect(() => {
        opacity.value = withSpring(1, { damping: 20 });
    }, []);

    // Animated styles
    const cardAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    // Entry animation based on index (staggered effect)
    const entryAnimatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            opacity.value,
            [0, 1],
            [50, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return {
            transform: [{ translateY }],
        };
    });

    // Handle media loading
    const handleLoadEnd = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        console.warn(`Image load error for NFT ${nft.id}:`, actualImageUrl);
        setHasError(true);
        setIsLoading(false);
    };

    const renderMedia = () => {
        // Initially show a loading state
        if (isLoading && !actualImageUrl) {
            return (
                <View style={[styles.mediaContainer, { width: cardWidth, height: cardHeight }]}>
                    <ActivityIndicator size="small" color="#3498db" />
                </View>
            );
        }

        // Show error state if there was an error
        if (hasError) {
            return (
                <View style={[styles.mediaContainer, { width: cardWidth, height: cardHeight }]}>
                    <Text style={styles.errorText}>Failed to load image</Text>
                </View>
            );
        }

        // Use the actual image URL we got from metadata, or fallback to a placeholder
        const imageSource = actualImageUrl || getPlaceholderImage();

        return (
            <View style={[styles.mediaContainer, { width: cardWidth, height: cardHeight }]}>
                <Image
                    source={{ uri: imageSource }}
                    style={styles.media}
                    onLoadEnd={handleLoadEnd}
                    onError={handleError}
                    resizeMode="cover"
                />
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#3498db" />
                    </View>
                )}
            </View>
        );
    };

    return (
        <Animated.View
            style={[
                styles.container,
                { width: cardWidth },
                cardAnimatedStyle,
                entryAnimatedStyle
            ]}
        >
            <TouchableOpacity
                onPress={() => onPress(nft)}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={0.7}
            >
                {renderMedia()}
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                        {nft.name}
                    </Text>
                    <Text style={styles.price}>{nft.price} ETH</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 4,
    },
    mediaContainer: {
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    media: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    errorText: {
        color: '#e74c3c',
        textAlign: 'center',
        padding: 10,
    },
    info: {
        padding: 12,
        backgroundColor: '#fff',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        color: '#666',
    },
});

export default NFTCard;
