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
    StatusBar,
    Platform
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
import { useNFT } from '../../context';
import { useScreenDimensions } from '../../hooks/useScreenDimensions';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

// Create a properly typed AnimatedFlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<NFT>);

const HomeScreen = () => {
    const { width: SCREEN_WIDTH } = useScreenDimensions();
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const {
        nfts,
        loading,
        error,
        hasMore,
        fetchInitialNFTs,
        fetchMoreNFTs,
        refreshNFTs
    } = useNFT();

    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [columns, setColumns] = useState<GridColumns>(2);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);

    // Animated values
    const layoutAnimation = useSharedValue(0);
    const headerHeight = useSharedValue(60);

    useEffect(() => {
        fetchInitialNFTs();
        StatusBar.setBarStyle('dark-content');
    }, []);

    // Animate layout change when switching view modes
    useEffect(() => {
        layoutAnimation.value = withSequence(
            withTiming(0.5, { duration: 150, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
        );
    }, [viewMode, columns]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshNFTs();
        setRefreshing(false);
    };

    const handleLoadMore = async () => {
        if (hasMore && !loadingMore && !refreshing) {
            setLoadingMore(true);
            await fetchMoreNFTs();
            setLoadingMore(false);
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

    // Updated renderNFTItem to apply correct margins for different column configurations
    const renderNFTItem = ({ item, index }: { item: NFT; index: number }) => {
        // Add spacing style for grid mode only
        const itemStyle = viewMode === 'grid' && columns > 1
            ? {
                // Add equal spacing between cards
                marginLeft: index % columns === 0 ? 0 : 6,  // No left margin for first card in row
                marginRight: (index + 1) % columns === 0 ? 0 : 6, // No right margin for last card in row
            }
            : {}; // No extra styling for list mode

        return (
            <NFTCard
                nft={item}
                onPress={navigateToDetail}
                columns={columns}
                viewMode={viewMode}
                index={index}
                style={itemStyle}
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

    if (loading && nfts.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <Animated.View style={[styles.header, headerAnimatedStyle]}>
                    <Text style={styles.title}>NFT Explorer</Text>
                </Animated.View>
                <NFTSkeleton viewMode={viewMode} columns={columns} />
            </SafeAreaView>
        );
    }

    if (error && nfts.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <Animated.View style={[styles.header, headerAnimatedStyle]}>
                    <Text style={styles.title}>NFT Explorer</Text>
                </Animated.View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => fetchInitialNFTs()}>
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
                    columnWrapperStyle={
                        viewMode === 'grid' && columns > 1
                            ? { justifyContent: 'space-evenly' }
                            : undefined
                    }
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#3498db"
                        />
                    }
                    onEndReached={handleLoadMore}
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
        paddingTop: Platform.OS === 'android' ? 30 : 0,
    },
    header: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        height: 60,
        backgroundColor: '#ffffff',
        // Add elevation for Android shadow
        ...Platform.OS === 'android' ? {
            elevation: 4,
            paddingTop: 8,
        } : {},
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
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
        padding: 16, // Use consistent padding on all sides
        paddingBottom: 80, // Add extra padding for tab bar
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
