// src/screens/Home/index.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    interpolate,
    withSequence,
    withDelay
} from 'react-native-reanimated';
import { RootStackParamList } from '../../navigation';
import { NFT, ViewMode, GridColumns } from '../../types/nft';
import NFTCard from '../../components/NFTCard';
import NFTSkeleton from '../../components/LoadingStates/index';
import { fetchNFTs } from '../../api/nft-service';

import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo/vector-icons

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Create a properly typed AnimatedFlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<NFT>);

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [columns, setColumns] = useState<GridColumns>(2);
    const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);

    // Animated values
    const layoutAnimation = useSharedValue(0);
    const headerHeight = useSharedValue(60);


    useEffect(() => {
        loadNFTs();
        StatusBar.setBarStyle('dark-content');
    }, []);

    // Animate layout change when switching view modes
    useEffect(() => {
        layoutAnimation.value = withSequence(
            withTiming(0.5, { duration: 150, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
        );
    }, [viewMode, columns]);

    // Add this log whenever nfts state changes
    useEffect(() => {
        console.warn('NFTs state updated:', {
            count: nfts.length,
            firstNft: nfts.length > 0 ? nfts[0] : null
        });
    }, [nfts]);

    const loadNFTs = async (refresh = true) => {
        console.warn(`${refresh ? 'Initial load' : 'Loading more'} NFTs...`);
        try {
            if (refresh) {
                setLoading(true);
                setNextPageToken(undefined);
            } else {
                setLoadingMore(true);
            }

            const token = refresh ? undefined : nextPageToken;
            console.warn('Fetching NFTs...', { pageSize: 12, token });
            const response = await fetchNFTs(12, token);
            console.warn('Response received:', {
                hasCollectibles: !!response?.collectibles,
                collectiblesCount: response?.collectibles?.length || 0
            });

            if (response && response.collectibles && response.collectibles.length > 0) {
                console.warn('NFTs found, updating state');

                if (refresh) {
                    setNfts(response.collectibles);
                } else {
                    setNfts(prev => [...prev, ...response.collectibles]);
                }

                // Use page information to construct next page token
                setNextPageToken(response.hasMore ? String(response.page + 1) : undefined);
                setError(null);

                // Verify the NFT data structure matches what the card component expects
                if (response.collectibles.length > 0) {
                    const firstNft = response.collectibles[0];
                    console.warn('Sample NFT data structure:', {
                        id: firstNft.id,
                        name: firstNft.name,
                        imageUrl: firstNft.thumbnailUrl || firstNft.mediaUrl,
                        hasImageUrl: !!firstNft.thumbnailUrl || !!firstNft.mediaUrl
                    });
                }
            } else {
                console.warn('No collectibles found in response');
                if (refresh) {
                    setNfts([]);
                    setError('No NFTs found. Please try again later.');
                }
            }
        } catch (err) {
            setError('Failed to load NFTs. Please try again.');
            console.error('Error in loadNFTs:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadNFTs();
    };

    const loadMoreNFTs = () => {
        if (nextPageToken && !loadingMore) {
            loadNFTs(false);
        }
    };

    const toggleViewMode = () => {
        // Play expand animation
        headerHeight.value = withSequence(
            withTiming(70, { duration: 200 }),
            withDelay(300, withTiming(60, { duration: 200 }))
        );
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    };

    const cycleGridColumns = () => {
        setColumns(prev => {
            if (prev === 1) return 2;
            if (prev === 2) return 3;
            return 1;
        });
    };

    const navigateToDetail = (nft: NFT) => {
        navigation.navigate('Detail', { nftId: nft.id });
    };

    // Animated styles
    const contentAnimatedStyle = useAnimatedStyle(() => {
        if (layoutAnimation.value === undefined) return { opacity: 1, transform: [{ scale: 1 }] };

        const opacity = interpolate(
            layoutAnimation.value,
            [0, 0.5, 1],
            [1, 0.7, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const scale = interpolate(
            layoutAnimation.value,
            [0, 0.5, 1],
            [1, 0.97, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return {
            opacity,
            transform: [{ scale }]
        };
    });

    const headerAnimatedStyle = useAnimatedStyle(() => {
        if (headerHeight.value === undefined) return { height: 60 };
        return {
            height: headerHeight.value
        };
    });

    // Add this debug helper for rendering NFT items
    const renderNFTItem = ({ item, index }: { item: NFT; index: number }) => {
        console.warn(`Rendering NFT at index ${index}:`, {
            id: item.id,
            name: item.name,
            hasImageUrl: !!item.thumbnailUrl || !!item.mediaUrl
        });

        return (
            <NFTCard
                nft={item}
                onPress={navigateToDetail}
                columns={columns}
                viewMode={viewMode}
                index={index}
            />
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;

        return (
            <View style={styles.footerLoader}>
                <NFTSkeleton viewMode={viewMode} columns={columns} />
            </View>
        );
    };

    const getKey = (item: NFT) => item.id;

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Animated.View style={[styles.header, headerAnimatedStyle]}>
                    <Text style={styles.title}>NFT Explorer</Text>
                </Animated.View>
                <NFTSkeleton viewMode={viewMode} columns={columns} />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Animated.View style={[styles.header, headerAnimatedStyle]}>
                    <Text style={styles.title}>NFT Explorer</Text>
                </Animated.View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => loadNFTs()}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={[styles.header, headerAnimatedStyle]}>
                <Text style={styles.title}>NFT Explorer</Text>
                <View style={styles.viewControls}>
                    <TouchableOpacity
                        style={styles.viewButton}
                        onPress={toggleViewMode}
                    >
                        <Ionicons
                            name={viewMode === 'grid' ? 'list' : 'grid'}
                            size={22}
                            color="#333"
                        />
                    </TouchableOpacity>

                    {viewMode === 'grid' && (
                        <TouchableOpacity
                            style={styles.columnButton}
                            onPress={cycleGridColumns}
                        >
                            <Text style={styles.columnButtonText}>{columns}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>

            <Animated.View style={[styles.content, contentAnimatedStyle]}>
                <AnimatedFlatList
                    data={nfts}
                    renderItem={renderNFTItem}
                    keyExtractor={getKey}
                    numColumns={viewMode === 'grid' ? columns : 1}
                    key={`${viewMode}-${columns}`} // Force re-render when changing layout
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#3498db"
                        />
                    }
                    onEndReached={loadMoreNFTs}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                />
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    viewControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewButton: {
        backgroundColor: '#f5f5f5',
        padding: 8,
        borderRadius: 20,
        marginRight: 8,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    columnButton: {
        backgroundColor: '#f5f5f5',
        padding: 8,
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    columnButtonText: {
        fontWeight: '600',
        fontSize: 16,
    },
    content: {
        flex: 1,
    },
    listContent: {
        padding: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#e74c3c',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
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
    footerLoader: {
        marginVertical: 16,
    }
});

export default HomeScreen;
