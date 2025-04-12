import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { NFT } from '../../types/nft';

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: 400,
    },
    content: {
        padding: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
    },
    priceLabel: {
        fontSize: 16,
        color: '#666',
        marginRight: 8,
    },
    priceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    infoSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#444',
    },
    ownerAddress: {
        fontSize: 16,
        color: '#444',
        fontFamily: 'monospace',
    },
    date: {
        fontSize: 16,
        color: '#666',
    },
});

export default NFTDetail;
