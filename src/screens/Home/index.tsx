import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { NFT, ViewMode, GridColumns } from '../../types/nft';
import { fetchNFTs } from '../../api/nft-service';
import { styles } from './styles';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [columns, setColumns] = useState<GridColumns>(2);

    useEffect(() => {
        loadNFTs();
    }, []);

    const loadNFTs = async () => {
        try {
            setLoading(true);
            const response = await fetchNFTs();
            setNfts(response.collectibles);
            setError(null);
        } catch (err) {
            setError('Failed to load NFTs. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    };

    const cycleGridColumns = () => {
        setColumns(prev => {
            if (prev === 1) return 2;
            if (prev === 2) return 3;
            return 1;
        });
    };

    const navigateToDetail = (nftId: string) => {
        navigation.navigate('Detail', { nftId });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#3498db" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadNFTs}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>NFT Explorer</Text>
                <View style={styles.viewControls}>
                    <TouchableOpacity
                        style={styles.viewButton}
                        onPress={toggleViewMode}
                    >
                        <Text>{viewMode === 'grid' ? 'List View' : 'Grid View'}</Text>
                    </TouchableOpacity>

                    {viewMode === 'grid' && (
                        <TouchableOpacity
                            style={styles.columnButton}
                            onPress={cycleGridColumns}
                        >
                            <Text>{`${columns} ${columns === 1 ? 'Column' : 'Columns'}`}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.content}>
                <Text>NFT Content will be displayed here</Text>
                {/* We'll implement the NFT grid/list here */}
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;
