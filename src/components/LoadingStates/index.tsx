// src/components/LoadingStates/NFTSkeleton.tsx
import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import styles, { createSkeletonStyles } from './styles';
import { SkeletonProps } from '../../types/components';
import { useScreenDimensions } from '../../hooks/useScreenDimensions';
import { calculateSkeletonCardWidth, calculateCardHeight } from '../../utils/metrics';

const NFTSkeleton: React.FC<SkeletonProps> = ({ viewMode, columns }) => {
    const dimensions = useScreenDimensions();
    const { width: SCREEN_WIDTH } = dimensions;
    const shimmer = useSharedValue(0);

    // Create dimension-dependent styles
    const dynamicStyles = useMemo(() =>
        createSkeletonStyles(dimensions),
        [dimensions]);

    // Calculate card dimensions using utility functions
    const cardWidth = calculateSkeletonCardWidth(SCREEN_WIDTH, columns, viewMode);
    const cardHeight = calculateCardHeight(cardWidth, viewMode);

    useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 1500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: shimmer.value * 0.5 + 0.3,
        };
    });

    const skeletonItems = Array(6).fill(0);

    const renderSkeleton = () => {
        if (viewMode === 'list') {
            return skeletonItems.map((_, index) => (
                <Animated.View
                    key={`list-skeleton-${index}`}
                    style={[
                        styles.container,
                        styles.listContainer,
                        dynamicStyles.dynamicCardContainer(cardWidth, cardHeight),
                        animatedStyle
                    ]}
                >
                    <View style={[
                        styles.mediaSkeleton,
                        dynamicStyles.dynamicMediaSkeleton(cardHeight)
                    ]} />
                    <View style={styles.listInfoSkeleton}>
                        <View style={styles.titleSkeleton} />
                        <View style={styles.collectionSkeleton} />
                    </View>
                </Animated.View>
            ));
        }

        return skeletonItems.map((_, index) => (
            <Animated.View
                key={`grid-skeleton-${index}`}
                style={[
                    styles.container,
                    styles.gridContainer,
                    dynamicStyles.dynamicCardContainer(cardWidth, cardHeight + 60),
                    animatedStyle
                ]}
            >
                <View style={[
                    styles.mediaSkeleton,
                    dynamicStyles.dynamicMediaSkeleton(cardWidth)
                ]} />
                <View style={styles.gridInfoSkeleton}>
                    <View style={styles.titleSkeleton} />
                    <View style={styles.collectionSkeleton} />
                </View>
            </Animated.View>
        ));
    };

    return (
        <View style={styles.skeletonContainer}>
            {renderSkeleton()}
        </View>
    );
};

export default NFTSkeleton;
