import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StatusBar,
    Share,
    ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    interpolate,
    runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation';
import { NFT } from '../../types/nft';
import { useNFT } from '../../context';
import { useScreenDimensions } from '../../hooks/useScreenDimensions';
import { convertIpfsToHttp } from '../../utils/helpers';
import { HEADER_HEIGHT } from '../../utils/metrics';
import { useFeatureAlert } from '../../hooks/useFeatureAlert';
import styles from './styles';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;
type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Detail'>;

const DetailScreen = () => {
    const dimensions = useScreenDimensions();
    const { width: screenWidth, height: screenHeight } = dimensions;
    const imageHeight = screenHeight * 0.5;

    // Create derived styles based on dimensions
    const derivedStyles = useMemo(() => ({
        imageContainer: {
            ...styles.nftImageContainer,
            width: screenWidth,
            height: imageHeight,
        },
    }), [screenWidth, imageHeight]);

    const navigation = useNavigation<DetailScreenNavigationProp>();
    const route = useRoute<DetailScreenRouteProp>();
    const { nftId } = route.params;
    const { getNFTById, nfts, fetchInitialNFTs } = useNFT();

    const [nft, setNft] = useState<NFT | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageUrlState, setImageUrlState] = useState<string | null>(null);

    // Animation values
    const scrollY = useSharedValue(0);
    const imageScale = useSharedValue(1);
    const headerOpacity = useSharedValue(1);
    const contentOpacity = useSharedValue(0);

    // Add feature alert hook
    const { showOpenSeaAlert } = useFeatureAlert();

    // Hide the default navigation header when this screen is focused
    useFocusEffect(
        React.useCallback(() => {
            navigation.setOptions({
                headerShown: false,
                gestureEnabled: true,
            });

            // Cleanup when leaving the screen
            return () => {
                navigation.setOptions({
                    headerShown: true,
                });
            };
        }, [navigation])
    );

    // Fetch NFT data
    useEffect(() => {
        const loadNFT = async () => {
            try {
                setIsLoading(true);
                console.warn(`Fetching details for NFT ID: ${nftId}`);

                // Try to get NFT from the context first
                let foundNFT = getNFTById(nftId);

                // If not found, try to fetch all NFTs first
                if (!foundNFT && nfts.length === 0) {
                    await fetchInitialNFTs();
                    foundNFT = getNFTById(nftId);
                }

                if (foundNFT) {
                    console.warn(`Found NFT: ${foundNFT.name}`);
                    setNft(foundNFT);

                    // Check if the image URL is a JSON metadata URL
                    if (
                        foundNFT.imageUrl &&
                        (foundNFT.imageUrl.endsWith('.json') || foundNFT.imageUrl.includes('/metadata/'))
                    ) {
                        try {
                            // Fetch the metadata to get the actual image URL
                            console.warn(`Fetching metadata from: ${foundNFT.imageUrl}`);
                            const metadataResponse = await fetch(foundNFT.imageUrl);
                            const metadata = await metadataResponse.json();

                            if (metadata.image) {
                                const imageUrl = convertIpfsToHttp(metadata.image);
                                console.warn(`Found image URL in metadata: ${imageUrl}`);
                                setImageUrlState(imageUrl);
                            } else {
                                setImageUrlState(foundNFT.imageUrl);
                            }
                        } catch (metadataError) {
                            console.warn(`Error fetching metadata: ${metadataError}. Using original URL.`);
                            setImageUrlState(foundNFT.imageUrl);
                        }
                    } else {
                        setImageUrlState(foundNFT.imageUrl);
                    }

                    // Start content animation after a short delay
                    setTimeout(() => {
                        contentOpacity.value = withTiming(1, { duration: 500 });
                    }, 300);
                } else {
                    console.warn(`NFT with ID ${nftId} not found in response`);
                    setError('NFT not found');
                }
            } catch (err) {
                console.error('Error loading NFT:', err);
                setError('Failed to load NFT details');
            } finally {
                setIsLoading(false);
            }
        };

        loadNFT();
    }, [nftId, contentOpacity, getNFTById, nfts.length, fetchInitialNFTs]);

    // Animated styles
    const headerAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: headerOpacity.value,
            transform: [
                {
                    translateY: interpolate(
                        scrollY.value,
                        [0, HEADER_HEIGHT],
                        [0, -HEADER_HEIGHT],
                        'clamp'
                    ),
                },
            ],
        };
    });

    const imageAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: imageScale.value },
                {
                    translateY: interpolate(
                        scrollY.value,
                        [0, imageHeight],
                        [0, -imageHeight / 2],
                        'clamp'
                    ),
                },
            ],
        };
    });

    const contentAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: contentOpacity.value,
            transform: [
                {
                    translateY: interpolate(
                        contentOpacity.value,
                        [0, 1],
                        [50, 0],
                        'clamp'
                    ),
                },
            ],
        };
    });

    // Handle image press for zoom effect
    const handleImagePress = () => {
        imageScale.value = withSpring(imageScale.value === 1 ? 1.5 : 1, {
            damping: 15,
            stiffness: 100,
        });
    };

    // Handle share
    const handleShare = async () => {
        if (!nft) return;

        try {
            await Share.share({
                message: `Check out this NFT: ${nft.name} - ${nft.description}`,
                url: imageUrlState || nft.imageUrl,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    // Handle back navigation with animation
    const handleBack = () => {
        contentOpacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(navigation.goBack)();
        });
    };

    // Handle image error by using a placeholder
    const handleImageError = () => {
        if (nft) {
            const placeholderUrl = `https://picsum.photos/400/400?random=${nft.id.replace(/\D/g, '')}`;
            console.warn(`Image load error, using placeholder: ${placeholderUrl}`);
            setImageUrlState(placeholderUrl);
        }
    };

    // Fix for headerOpacity.value interpolate
    const handleScroll = (offsetY: number) => {
        scrollY.value = offsetY;

        // Fade out header when scrolling down
        headerOpacity.value = interpolate(
            offsetY,
            [0, HEADER_HEIGHT],
            [1, 0],
            'clamp'
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.loadingText}>Loading NFT details...</Text>
            </View>
        );
    }

    if (error || !nft) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error || 'NFT not found'}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.retryButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const displayImageUrl = imageUrlState || nft.imageUrl || nft.thumbnailUrl || nft.mediaUrl || `https://picsum.photos/400/400?random=${nft.id.replace(/\D/g, '')}`;

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent={true}
            />

            {/* Animated Custom Header */}
            <Animated.View style={[styles.header, headerAnimatedStyle]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {nft.name}
                </Text>
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Ionicons name="share-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </Animated.View>

            <Animated.ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                onScroll={(event) => {
                    handleScroll(event.nativeEvent.contentOffset.y);
                }}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Image */}
                <TouchableOpacity activeOpacity={0.9} onPress={handleImagePress}>
                    <Animated.View style={[derivedStyles.imageContainer, imageAnimatedStyle]}>
                        <Image
                            source={{ uri: displayImageUrl }}
                            style={styles.image}
                            onError={handleImageError}
                        />
                    </Animated.View>
                </TouchableOpacity>

                {/* Content */}
                <Animated.View style={[styles.content, contentAnimatedStyle]}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{nft.name}</Text>
                        <Text style={styles.price}>{nft.price || 0} ETH</Text>
                    </View>

                    <View style={styles.ownerContainer}>
                        <Text style={styles.ownerLabel}>Owner</Text>
                        <Text style={styles.ownerAddress}>{nft.owner || 'Unknown'}</Text>
                    </View>

                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionTitle}>Description</Text>
                        <Text style={styles.description}>{nft.description || 'No description available'}</Text>
                    </View>

                    {nft.collection && (
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionTitle}>Collection</Text>
                            <Text style={styles.description}>{nft.collection.name}</Text>
                            {nft.collection.description && (
                                <Text style={styles.description}>{nft.collection.description}</Text>
                            )}
                        </View>
                    )}

                    <View style={styles.detailsContainer}>
                        <Text style={styles.detailsTitle}>Details</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Created</Text>
                            <Text style={styles.detailValue}>
                                {new Date(nft.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Contract</Text>
                            <Text style={styles.detailValue} numberOfLines={1}>
                                {nft.contractAddress || 'Unknown'}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Token ID</Text>
                            <Text style={styles.detailValue}>{nft.tokenId || 'Unknown'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.buyButton}
                        onPress={() => showOpenSeaAlert(nft.contractAddress, nft.tokenId)}
                    >
                        <Text style={styles.buyButtonText}>View on OpenSea</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.ScrollView>
        </View>
    );
};

export default DetailScreen;
