import { StyleSheet } from 'react-native';

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

export default styles;
