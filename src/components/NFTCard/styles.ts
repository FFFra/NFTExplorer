import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        margin: 4,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    listContainer: {
        flexDirection: 'row',
        height: 120,
    },
    gridContainer: {
        aspectRatio: 1,
    },
    listTouchable: {
        flex: 1,
        flexDirection: 'row',
    },
    gridTouchable: {
        flex: 1,
    },
    mediaContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    media: {
        borderRadius: 12,
    },
    playIconOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    playIcon: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    listInfoContainer: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    gridInfoContainer: {
        padding: 8,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    gridTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    listCollection: {
        fontSize: 14,
        color: '#666',
    },
    gridCollection: {
        fontSize: 12,
        color: '#666',
    },
});
