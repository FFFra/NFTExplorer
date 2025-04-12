import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNFTs } from './hooks/useNFTs';
import { NFTDetail } from './components/NFTDetail';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import { NFT } from './types/nft';

const Stack = createNativeStackNavigator();

const NFTListScreen = ({ navigation }: any) => {
    const { nfts, isLoading, error, fetchNextPage, hasMore } = useNFTs();

    React.useEffect(() => {
        fetchNextPage();
    }, []);

    const renderItem = ({ item }: { item: NFT }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('NFTDetail', { nft: item })}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
            <View style={styles.cardContent}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.price}>{item.price} ETH</Text>
            </View>
        </TouchableOpacity>
    );

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={nfts}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            onEndReached={() => hasMore && fetchNextPage()}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
                isLoading ? (
                    <ActivityIndicator style={styles.loader} />
                ) : null
            }
        />
    );
};

const NFTDetailScreen = ({ route }: any) => {
    const { nft } = route.params;
    return (
        <ScrollView style={styles.detailContainer}>
            <Image
                source={{ uri: nft.imageUrl }}
                style={styles.detailImage}
                resizeMode="cover"
            />
            <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>{nft.name}</Text>
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

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="NFTList"
                    component={NFTListScreen}
                    options={{ title: 'NFT Explorer' }}
                />
                <Stack.Screen
                    name="NFTDetail"
                    component={NFTDetailScreen}
                    options={{ title: 'NFT Details' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        margin: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    thumbnail: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    cardContent: {
        padding: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        color: '#666',
    },
    error: {
        color: 'red',
        fontSize: 16,
    },
    loader: {
        padding: 20,
    },
    detailContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    detailImage: {
        width: '100%',
        height: 400,
    },
    detailContent: {
        padding: 16,
    },
    detailTitle: {
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