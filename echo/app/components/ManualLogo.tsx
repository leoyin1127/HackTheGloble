import React from 'react';
import { View, Image, StyleSheet, Dimensions, Platform } from 'react-native';

interface ManualLogoProps {
    size?: number;
    containerStyle?: any;
    transparent?: boolean;
}

const { width, height } = Dimensions.get('window');

const ManualLogo = ({ size = 180, containerStyle, transparent = false }: ManualLogoProps) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <View style={[
                styles.shadowWrapper,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: transparent ? 'transparent' : 'white',
                }
            ]}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={{
                        width: size,
                        height: size,
                        borderRadius: size / 2
                    }}
                    resizeMode="cover"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    shadowWrapper: {
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        // Elevation for Android
        elevation: 5,
        overflow: 'hidden'
    },
});

export default ManualLogo; 