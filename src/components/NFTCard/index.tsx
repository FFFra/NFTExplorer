import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    StyleSheet,
    Platform
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate
} from 'react-native-reanimated';
import { NFT, GridColumns, ViewMode } from '../../types/nft';
import styles from './styles';
interface NFTCardProps {
    nft: NFT;
    onPress: (nft: NFT) => void;
    columns: GridColumns;
    viewMode: ViewMode;
    index: number;
    style?: object;
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
const getPlaceholderImage = (id: string): string => {
    return `https://picsum.photos/400/400?random=${id.replace(/[^0-9]/g, '')}`;
};

const NFTCard: React.FC<NFTCardProps> = ({
    nft,
    onPress,
    columns,
    viewMode,
    index,
    style = {}
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [actualImageUrl, setActualImageUrl] = useState<string | null>(null);

    // Animated values
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);

    // Calculate dimensions based on column count and view mode
    const getCardWidth = () => {
        if (viewMode === 'list') {
            return SCREEN_WIDTH - 32; // Full width minus padding
        }

        // Calculate width based on container padding and number of columns
        const containerPadding = 32; // Total container padding (16px on each side)
        const cardSpacing = 12; // Spacing between cards (6px on each side)
        const totalSpacing = cardSpacing * (columns - 1); // Total spacing between cards

        // Calculate available width and divide by number of columns
        const availableWidth = SCREEN_WIDTH - containerPadding - totalSpacing;
        return Math.floor(availableWidth / columns);
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
                    setActualImageUrl(getPlaceholderImage(nft.id));
                    setIsLoading(false);
                    return;
                }

                // If the URL doesn't look like a JSON metadata file, use it directly
                if (!isJsonMetadataUrl(sourceUrl)) {
                    setActualImageUrl(sourceUrl);
                    setIsLoading(false);
                    return;
                }

                // Use a timeout to prevent hanging requests
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                try {
                    const response = await fetch(sourceUrl, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const metadata = await response.json();

                    // Extract the image URL from the metadata
                    if (metadata && metadata.image) {
                        const imageUrl = convertIpfsToHttp(metadata.image);
                        setActualImageUrl(imageUrl);
                    } else {
                        setActualImageUrl(getPlaceholderImage(nft.id));
                    }
                } catch (fetchError) {
                    setActualImageUrl(getPlaceholderImage(nft.id));
                    clearTimeout(timeoutId);
                }
            } catch (error) {
                setActualImageUrl(getPlaceholderImage(nft.id));
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
    useEffect(() => {
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
        // Try to use a different URL if the current one failed
        if (actualImageUrl && (actualImageUrl === nft.imageUrl || actualImageUrl === nft.thumbnailUrl)) {
            // If the primary URL failed, try a different one from the NFT
            const alternateUrl = nft.mediaUrl || nft.thumbnailUrl || nft.imageUrl;
            if (alternateUrl && alternateUrl !== actualImageUrl) {
                setActualImageUrl(alternateUrl);
                return; // Don't mark as error yet, we're trying another URL
            }
        }

        // If we've tried all URLs or don't have alternatives, use a secure placeholder
        setActualImageUrl(getPlaceholderImage(nft.id));
        setHasError(false); // We're not in an error state since we're using a placeholder
        setIsLoading(false);
    };

    const renderMedia = () => {
        // Initially show a loading state
        if (isLoading && !actualImageUrl) {
            return (
                <View style={[styles.mediaContainer, { width: cardWidth, height: cardHeight }]}>
                    <ActivityIndicator size="large" color="#3498db" />
                    <Text style={styles.loadingText}>Loading NFT...</Text>
                </View>
            );
        }

        // Use the actual image URL we got from metadata, or fallback to a placeholder
        const imageSource = actualImageUrl ||
            nft.imageUrl ||
            nft.thumbnailUrl ||
            nft.mediaUrl ||
            `https://picsum.photos/400/400?random=${nft.id.replace(/[^0-9]/g, '')}`;

        return (
            <View style={[styles.mediaContainer, { width: cardWidth, height: cardHeight }]}>
                <Image
                    source={{ uri: imageSource }}
                    style={styles.media}
                    onLoadEnd={handleLoadEnd}
                    onError={handleError}
                    resizeMode="cover"
                    // Adding key to force refresh when URL changes
                    key={imageSource}
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
                entryAnimatedStyle,
                style
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

export default NFTCard;
