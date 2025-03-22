import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/AppNavigator';

type CheckoutScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Checkout'>;

const CheckoutScreen = () => {
    const navigation = useNavigation<CheckoutScreenNavigationProp>();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Checkout</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shipping Information</Text>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>John Doe</Text>
                        <Text style={styles.infoText}>123 Eco Street</Text>
                        <Text style={styles.infoText}>Toronto, ON M5V 2A8</Text>
                        <Text style={styles.infoText}>Canada</Text>
                        <TouchableOpacity style={styles.changeButton}>
                            <Text style={styles.changeButtonText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>Visa ending in 1234</Text>
                        <TouchableOpacity style={styles.changeButton}>
                            <Text style={styles.changeButtonText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>$39.99</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={styles.summaryValue}>$4.99</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax</Text>
                        <Text style={styles.summaryValue}>$5.85</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>$50.83</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.placeOrderButton}
                    onPress={() => {
                        // This would process the order and take the user to a confirmation screen
                        // For now, just go back to home
                        navigation.navigate('Home');
                    }}
                >
                    <Text style={styles.placeOrderButtonText}>Place Order</Text>
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
    scrollView: {
        flex: 1,
    },
    section: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        padding: 16,
        position: 'relative',
    },
    infoText: {
        fontSize: 16,
        color: '#2C3E50',
        marginBottom: 4,
    },
    changeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    changeButtonText: {
        color: '#45B69C',
        fontWeight: 'bold',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#7F8C8D',
    },
    summaryValue: {
        fontSize: 16,
        color: '#2C3E50',
    },
    totalRow: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#45B69C',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    placeOrderButton: {
        backgroundColor: '#45B69C',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    placeOrderButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CheckoutScreen; 