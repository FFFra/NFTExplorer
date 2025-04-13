import { StyleSheet, Platform } from 'react-native';

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

export default styles;
