import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
    container: {
        marginVertical: 6, // Consistent vertical spacing
        marginHorizontal: 0, // No horizontal margin - spacing handled by FlatList
        backgroundColor: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
        ...Platform.select({
            android: {
                elevation: 2,
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
        }),
    },
    touchable: {
        width: '100%',
        height: '100%',
    },
    mediaContainer: {
        position: 'relative',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        overflow: 'hidden',
    },
    media: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    errorText: {
        color: '#e74c3c',
        textAlign: 'center',
        padding: 10,
    },
    info: {
        padding: 12,
        paddingVertical: 8,
        backgroundColor: '#ffffff',
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    price: {
        fontSize: 12,
        color: '#666',
    },
    loadingText: {
        color: '#333',
        fontSize: 14,
        marginTop: 10,
    },
});

export default styles;
