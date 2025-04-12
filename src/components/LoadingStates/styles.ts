import { StyleSheet } from 'react-native';
import { ScreenDimensions } from '../../types/hooks';
import { SkeletonStyles } from '../../types/components';

// Dynamic styles that depend on screen dimensions
export const createSkeletonStyles = (dimensions: ScreenDimensions): SkeletonStyles => {
    const { width } = dimensions;

    return {
        dynamicCardContainer: (cardWidth: number, cardHeight: number) => ({
            width: cardWidth,
            height: cardHeight,
        }),
        dynamicMediaSkeleton: (size: number) => ({
            width: size,
            height: size,
        }),
    };
};

// Static styles that don't change with dimensions
const styles = StyleSheet.create({
    skeletonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 8,
    },
    container: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        overflow: 'hidden',
        margin: 6,
    },
    gridContainer: {
        marginBottom: 16,
    },
    listContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    mediaSkeleton: {
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
    },
    gridInfoSkeleton: {
        padding: 12,
    },
    listInfoSkeleton: {
        flex: 1,
        paddingHorizontal: 12,
        height: '100%',
        justifyContent: 'center',
    },
    titleSkeleton: {
        height: 18,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginBottom: 8,
        width: '80%',
    },
    collectionSkeleton: {
        height: 14,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        width: '50%',
    }
});

export default styles;
