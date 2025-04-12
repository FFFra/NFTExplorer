import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Share,
    ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    interpolate,
    Extrapolate,
    runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation';
import { NFT } from '../../types/nft';
import { fetchNFTs } from '../../services/nft-service';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;
type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Detail'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 60;
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.5;

const DetailScreen = () => {
    const navigation = useNavigation<DetailScreenNavigationProp>();
    const route = useRoute<DetailScreenRouteProp>();
    const { nftId } = route.params;

    const [nft, setNft] = useState<NFT | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Animation values
    const scrollY = useSharedValue(0);
    const imageScale = useSharedValue(1);
    const headerOpacity = useSharedValue(1);
    const contentOpacity = useSharedValue(0);

    // Fetch NFT data
    useEffect(() => {
        const loadNFT = async () => {
            try {
                setIsLoading(true);
                // In a real app, you would fetch a single NFT by ID
                // For now, we'll fetch all NFTs and find the one we need
                const response = await fetchNFTs(20);
                const foundNFT = response.collectibles.find(item => item.id === nftId);

                if (foundNFT) {
                    setNft(foundNFT);
                    // Start content animation after a short delay
                    setTimeout(() => {
                        contentOpacity.value = withTiming(1, { duration: 500 });
                    }, 300);
                } else {
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
    }, [nftId]);

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
                        Extrapolate.CLAMP
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
                        [0, IMAGE_HEIGHT],
                        [0, -IMAGE_HEIGHT / 2],
                        Extrapolate.CLAMP
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
                        Extrapolate.CLAMP
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
                url: nft.imageUrl,
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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
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

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Animated Header */}
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
                onScroll={(event) => {
                    scrollY.value = event.nativeEvent.contentOffset.y;

                    // Fade out header when scrolling down
                    headerOpacity.value = interpolate(
                        scrollY.value,
                        [0, HEADER_HEIGHT],
                        [1, 0],
                        Extrapolate.CLAMP
                    );
                }}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Image */}
                <TouchableOpacity activeOpacity={0.9} onPress={handleImagePress}>
                    <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
                        <Image source={{ uri: nft.imageUrl }} style={styles.image} />
                    </Animated.View>
                </TouchableOpacity>

                {/* Content */}
                <Animated.View style={[styles.content, contentAnimatedStyle]}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{nft.name}</Text>
                        <Text style={styles.price}>{nft.price} ETH</Text>
                    </View>

                    <View style={styles.ownerContainer}>
                        <Text style={styles.ownerLabel}>Owner</Text>
                        <Text style={styles.ownerAddress}>{nft.owner}</Text>
                    </View>

                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionTitle}>Description</Text>
                        <Text style={styles.description}>{nft.description}</Text>
                    </View>

                    <View style={styles.detailsContainer}>
                        <Text style={styles.detailsTitle}>Details</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Created</Text>
                            <Text style={styles.detailValue}>
                                {new Date(nft.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>ID</Text>
                            <Text style={styles.detailValue}>{nft.id}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.buyButton}>
                        <Text style={styles.buyButtonText}>Buy Now</Text>
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
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    imageContainer: {
        width: SCREEN_WIDTH,
        height: IMAGE_HEIGHT,
        backgroundColor: '#f0f0f0',
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
