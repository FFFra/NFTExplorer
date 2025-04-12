import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    skeletonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 8,
    },
    container: {
        margin: 8,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    gridContainer: {
        flexDirection: 'column',
    },
    listContainer: {
        flexDirection: 'row',
    },
    mediaSkeleton: {
        backgroundColor: '#e0e0e0',
    },
    gridInfoSkeleton: {
        padding: 12,

    },
    listInfoSkeleton: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    titleSkeleton: {
        height: 14,
        width: '80%',
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginBottom: 8,
    },
    collectionSkeleton: {
        height: 12,
        width: '50%',
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
    }
});

export default styles;
