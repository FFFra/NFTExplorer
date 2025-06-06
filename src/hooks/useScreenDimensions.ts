import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { ScreenDimensions } from '../types/hooks';

export const useScreenDimensions = (): ScreenDimensions => {
    const [dimensions, setDimensions] = useState<ScreenDimensions>(() => {
        const { width, height } = Dimensions.get('window');
        return {
            width,
            height,
            isPortrait: height > width
        };
    });

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
            const { width, height } = window;
            setDimensions({
                width,
                height,
                isPortrait: height > width
            });
        });

        return () => subscription.remove();
    }, []);

    return dimensions;
}; 
