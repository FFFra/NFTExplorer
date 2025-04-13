import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 20
    },
    placeholderIcon: {
        marginBottom: 20
    },
    placeholderTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333'
    },
    placeholderText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24
    },
    tabBar: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#ffffff',
        ...(Platform.OS === 'android' && { elevation: 4 }),
    }
}); 
