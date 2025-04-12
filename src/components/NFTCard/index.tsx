import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate
} from 'react-native-reanimated';
import { NFTCardProps } from '../../types/components';
import { useScreenDimensions } from '../../hooks/useScreenDimensions';
import { convertIpfsToHttp, isJsonMetadataUrl, getPlaceholderImage, getBestImageUrl } from '../../utils/helpers';
import { calculateCardWidth, calculateCardHeight } from '../../utils/metrics';
import styles from './styles';

const NFTCard: React.FC<NFTCardProps> = ({
    nft,
    onPress,
    columns,
    viewMode,
    style = {}
}) => {
    const { width: SCREEN_WIDTH } = useScreenDimensions();
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [actualImageUrl, setActualImageUrl] = useState<string | null>(null);

    // Animated values
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);

    // Calculate card dimensions using utility functions
    const cardWidth = calculateCardWidth(SCREEN_WIDTH, columns, viewMode);
    const cardHeight = calculateCardHeight(cardWidth, viewMode);

    // Fetch metadata and extract image URL if needed
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                // Use the best available URL
                const sourceUrl = getBestImageUrl(nft);

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
        const imageSource = actualImageUrl || getBestImageUrl(nft);

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
