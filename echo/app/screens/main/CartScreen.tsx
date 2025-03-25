import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { Product } from '../../services/ProductService';

type CartScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Cart'>;

const CartScreen = () => {
    const navigation = useNavigation<CartScreenNavigationProp>();
    const { cartItems, removeFromCart } = useCart();
    const { colors, spacing, typography, borderRadius, shadows } = useTheme();

    const renderCartItem = ({ item }: { item: Product }) => (
        <View style={[styles.cartItem, {
            backgroundColor: colors.neutral.white,
            borderRadius: borderRadius.md,
            ...shadows.sm,
            marginBottom: spacing.md
        }]}>
            <Image
                source={{ uri: item.images && item.images.length > 0 ? item.images[0] : 'https://placehold.co/100x100' }}
                style={styles.itemImage}
            />
            <View style={styles.itemDetails}>
                <Text style={[styles.itemTitle, { color: colors.neutral.charcoal }]}>{item.title}</Text>
                <Text style={[styles.itemPrice, { color: colors.primary.main }]}>
                    ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFromCart(item.id)}
            >
                <Ionicons name="trash-outline" size={22} color={colors.semantic.error} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.neutral.offWhite }]}>
            <StatusBar style="dark" />
            <View style={[styles.header, {
                backgroundColor: colors.neutral.white,
                borderBottomColor: colors.neutral.lightGray,
                ...shadows.sm
            }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.neutral.charcoal} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.neutral.charcoal }]}>Your Cart</Text>
                <View style={{ width: 24 }} />
            </View>

            {cartItems.length > 0 ? (
                <FlatList
                    data={cartItems}
                    renderItem={renderCartItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: spacing.md }}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.contentContainer}>
                    <Ionicons name="cart-outline" size={80} color={colors.neutral.lightGray} />
                    <Text style={[styles.emptyText, { color: colors.neutral.charcoal }]}>Your cart is empty</Text>
                    <Text style={[styles.subText, { color: colors.neutral.darkGray }]}>Browse items and add them to your cart</Text>

                    <TouchableOpacity
                        style={[styles.browseButton, {
                            backgroundColor: colors.primary.main,
                            borderRadius: borderRadius.md
                        }]}
                        onPress={() => navigation.navigate('TabHome', { screen: 'Home' })}
                    >
                        <Text style={[styles.browseButtonText, { color: colors.neutral.white }]}>Browse Items</Text>
                    </TouchableOpacity>
                </View>
            )}

            {cartItems.length > 0 && (
                <View style={[styles.checkoutContainer, {
                    backgroundColor: colors.neutral.white,
                    borderTopColor: colors.neutral.lightGray,
                    ...shadows.md
                }]}>
                    <View style={styles.totalRow}>
                        <Text style={[styles.totalText, { color: colors.neutral.charcoal }]}>Total</Text>
                        <Text style={[styles.totalAmount, { color: colors.primary.dark }]}>
                            ${cartItems.reduce((total, item) => total + (typeof item.price === 'number' ? item.price : 0), 0).toFixed(2)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.checkoutButton, {
                            backgroundColor: colors.primary.main,
                            borderRadius: borderRadius.md
                        }]}
                        onPress={() => navigation.navigate('Checkout')}
                    >
                        <Text style={[styles.checkoutButtonText, { color: colors.neutral.white }]}>Proceed to Checkout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
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
        marginBottom: 8,
        marginTop: 16,
    },
    subText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    browseButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
    },
    browseButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    cartItem: {
        flexDirection: 'row',
        padding: 12,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    itemDetails: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    removeButton: {
        justifyContent: 'center',
        padding: 8,
    },
    checkoutContainer: {
        padding: 16,
        borderTopWidth: 1,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalText: {
        fontSize: 18,
        fontWeight: '600',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    checkoutButton: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    checkoutButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CartScreen; 