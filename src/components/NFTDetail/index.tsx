import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { NFT } from '../../types/nft';
import styles from './styles';
interface NFTDetailProps {
    nft: NFT;
}

const NFTDetail: React.FC<NFTDetailProps> = ({ nft }) => {
    return (
        <ScrollView style={styles.container}>
            <Image
                source={{ uri: nft.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <Text style={styles.name}>{nft.name}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Price:</Text>
                    <Text style={styles.priceValue}>{nft.price} ETH</Text>
                </View>
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{nft.description}</Text>
                </View>
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Owner</Text>
                    <Text style={styles.ownerAddress}>{nft.owner}</Text>
                </View>
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Created</Text>
                    <Text style={styles.date}>
                        {new Date(nft.createdAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default NFTDetail;
