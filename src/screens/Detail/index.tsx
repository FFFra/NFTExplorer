import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
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
import { fetchNFTs } from '../../api/nft-service';
import { useScreenDimensions } from '../../hooks/useScreenDimensions';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;
type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Detail'>;

const HEADER_HEIGHT = 60;

// Function to convert IPFS URL to HTTP URL if needed
const convertIpfsToHttp = (ipfsUrl: string): string => {
    if (!ipfsUrl) return '';
    if (ipfsUrl.startsWith('ipfs://')) {
        return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return ipfsUrl;
};

const DetailScreen = () => {
    const dimensions = useScreenDimensions();
    const { width: screenWidth, height: screenHeight } = dimensions;
    const imageHeight = screenHeight * 0.5;

    // Create derived styles based on dimensions
    const derivedStyles = useMemo(() => ({
        imageContainer: {
            width: screenWidth,
            height: imageHeight,
            backgroundColor: '#f0f0f0',
        },
    }), [screenWidth, imageHeight]);

    const navigation = useNavigation<DetailScreenNavigationProp>();
    const route = useRoute<DetailScreenRouteProp>();
    const { nftId } = route.params;

    const [nft, setNft] = useState<NFT | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageUrlState, setImageUrlState] = useState<string | null>(null);

    // Animation values
    const scrollY = useSharedValue(0);
    const imageScale = useSharedValue(1);
    const headerOpacity = useSharedValue(1);
    const contentOpacity = useSharedValue(0);

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

                // Fetch all NFTs and find the one we need by ID
                const response = await fetchNFTs(50);

                const foundNFT = response.collectibles.find((item: NFT) => item.id === nftId);

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
    }, [nftId, contentOpacity]);

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

                    <TouchableOpacity style={styles.buyButton}>
                        <Text style={styles.buyButtonText}>View on OpenSea</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#e74c3c',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    header: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    shareButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingTop: 0,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    content: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3498db',
    },
    ownerContainer: {
        marginBottom: 20,
    },
    ownerLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    ownerAddress: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    descriptionContainer: {
        marginBottom: 20,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    detailsContainer: {
        marginBottom: 30,
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    detailLabel: {
        fontSize: 16,
        color: '#666',
    },
    detailValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        maxWidth: '60%',
        textAlign: 'right',
    },
    buyButton: {
        backgroundColor: '#3498db',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 30,
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default DetailScreen;
