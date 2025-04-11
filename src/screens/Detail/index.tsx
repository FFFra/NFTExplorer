import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Image,
    TouchableOpacity,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { NFT } from '../../types/nft';
import { styles } from './styles';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;
type DetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Detail'>;

const DetailScreen = () => {
    const route = useRoute<DetailScreenRouteProp>();
    const navigation = useNavigation<DetailScreenNavigationProp>();
    const { nftId } = route.params;

    // Placeholder - will be replaced with real data
    const [nft, setNft] = useState<NFT | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    useEffect(() => {
        // Simulate loading the NFT (replace with real API call)
        setTimeout(() => {
            setNft({
                id: nftId,
                contractAddress: '0x69155e7ca2e688ccdc247f6c4ddf374b3ae77bd6',
                tokenId: '123',
                name: 'Sample NFT',
                description: 'This is a sample NFT description. We will replace this with real data.',
                mediaType: 'image/jpeg',
                mediaUrl: 'https://via.placeholder.com/500',
                thumbnailUrl: 'https://via.placeholder.com/200',
                creator: 'Creator Name',
                collection: {
                    name: 'Sample Collection',
                    description: 'A collection of amazing NFTs',
                    imageUrl: 'https://via.placeholder.com/100'
                }
            });
            setLoading(false);
        }, 1000);
    }, [nftId]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    if (!nft) {
        return (
            <View style={styles.errorContainer}>
                <Text>NFT not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity onPress={toggleFullscreen}>
                    <Image
                        source={{ uri: nft.mediaUrl }}
                        style={[
                            styles.nftImage,
                            isFullscreen && styles.fullscreenImage
                        ]}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                {!isFullscreen && (
                    <View style={styles.infoContainer}>
                        <Text style={styles.title}>{nft.name}</Text>

                        <View style={styles.creatorRow}>
                            <Text style={styles.label}>Creator: </Text>
                            <Text style={styles.value}>{nft.creator}</Text>
                        </View>

                        <View style={styles.collectionRow}>
                            <Text style={styles.label}>Collection: </Text>
                            <Text style={styles.value}>{nft.collection?.name}</Text>
                        </View>

                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{nft.description}</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default DetailScreen;
