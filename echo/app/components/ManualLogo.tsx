import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

interface ManualLogoProps {
    size?: number;
    containerStyle?: any;
}

const { width, height } = Dimensions.get('window');

const ManualLogo = ({ size = 180, containerStyle }: ManualLogoProps) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <Image
                source={require('../../assets/logo.png')}
                style={[
                    styles.logo,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2
                    }
                ]}
                resizeMode="cover"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        // Elevation for Android
        elevation: 5,
    }
});

export default ManualLogo; 