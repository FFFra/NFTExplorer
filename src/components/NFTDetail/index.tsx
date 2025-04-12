import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
} from 'react-native-reanimated';
import { NFT } from '../../types/nft';
import { useScreenDimensions } from '../../hooks/useScreenDimensions';
import { formatAddress } from '../../utils/helpers';
import { HEADER_HEIGHT, calculateDetailStyles } from '../../utils/metrics';
import styles from './styles';

interface NFTDetailProps {
    nft: NFT;
    imageUrl: string;
    onBack: () => void;
    scrollY: Animated.SharedValue<number>;
}

const NFTDetail: React.FC<NFTDetailProps> = ({
    nft,
    imageUrl,
    onBack,
    scrollY
}) => {
    const dimensions = useScreenDimensions();
    const dynamicStyles = useMemo(() => calculateDetailStyles(dimensions), [dimensions]);

    // Animation values
    const imageScale = useSharedValue(1);
    const headerOpacity = useSharedValue(1);

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
                        [0, dimensions.height * 0.5],
                        [0, -(dimensions.height * 0.5) / 2],
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
        try {
            await Share.share({
                message: `Check out this NFT: ${nft.name} - ${nft.description}`,
                url: imageUrl,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <>
            {/* Animated Custom Header */}
            <Animated.View style={[styles.header, headerAnimatedStyle]}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {nft.name}
                </Text>
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Ionicons name="share-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </Animated.View>

            {/* Hero Image */}
            <TouchableOpacity activeOpacity={0.9} onPress={handleImagePress}>
                <Animated.View style={[dynamicStyles.imageContainer, imageAnimatedStyle]}>
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                    />
                </Animated.View>
            </TouchableOpacity>

            {/* Content section */}
            <View style={[styles.content, dynamicStyles.contentWithHeight]}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{nft.name}</Text>
                    <Text style={styles.price}>{nft.price || 0} ETH</Text>
                </View>

                <View style={styles.ownerContainer}>
                    <Text style={styles.ownerLabel}>Owner</Text>
                    <Text style={styles.ownerAddress}>{formatAddress(nft.owner)}</Text>
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
                            {formatAddress(nft.contractAddress, 8, 6)}
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
            </View>
        </>
    );
};

export default NFTDetail;
