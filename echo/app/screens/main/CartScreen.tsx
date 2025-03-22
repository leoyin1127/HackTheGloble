import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/AppNavigator';

type CartScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Cart'>;

const CartScreen = () => {
    const navigation = useNavigation<CartScreenNavigationProp>();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Cart</Text>
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <Text style={styles.subText}>Browse items and add them to your cart</Text>

                <TouchableOpacity
                    style={styles.browseButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.browseButtonText}>Browse Items</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 8,
    },
    subText: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
        marginBottom: 30,
    },
    browseButton: {
        backgroundColor: '#45B69C',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    browseButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CartScreen; 