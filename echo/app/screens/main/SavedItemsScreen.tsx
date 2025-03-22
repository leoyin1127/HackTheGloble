import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../context/ThemeContext';
import { MainStackParamList } from '../../navigation/AppNavigator';

type SavedItemsScreenNavigationProp = StackNavigationProp<MainStackParamList>;

const { width } = Dimensions.get('window');

// Sample saved items
const SAVED_ITEMS = [
    {
        id: '1',
        title: 'Vintage Denim Jacket',
        price: '$45.00',
        image: { uri: 'https://placehold.co/600x800/E0F7FA/2C3E50?text=Denim+Jacket' },
        sellerName: 'ameliegong',
    },
    {
        id: '3',
        title: 'Organic Cotton Shirt',
        price: '$32.00',
        image: { uri: 'https://placehold.co/600x800/F9FBE7/2C3E50?text=Shirt' },
        sellerName: 'greenbasics',
    },
    {
        id: '6',
        title: 'Upcycled Glass Vase',
        price: '$24.00',
        image: { uri: 'https://placehold.co/600x800/FFF8E1/2C3E50?text=Vase' },
        sellerName: 'ecofriendly',
    },
];

const SavedItemsScreen = () => {
    const navigation = useNavigation<SavedItemsScreenNavigationProp>();
    const { colors, spacing, typography, borderRadius, shadows } = useTheme();

    const renderSavedItem = ({ item }: { item: typeof SAVED_ITEMS[0] }) => {
        return (
            <View
                style={[
                    styles.savedItem,
                    {
                        borderBottomColor: colors.neutral.lightGray,
                        borderBottomWidth: 1,
                        padding: spacing.md,
                        backgroundColor: colors.neutral.white,
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.itemContent}
                    onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                >
                    <Image
                        source={item.image}
                        style={[
                            styles.itemImage,
                            {
                                borderRadius: borderRadius.md,
                            }
                        ]}
                    />

                    <View style={[styles.itemInfo, { marginLeft: spacing.md }]}>
                        <Text
                            style={[
                                styles.itemTitle,
                                {
                                    color: colors.neutral.charcoal,
                                    fontSize: typography.fontSize.md,
                                    marginBottom: spacing.xs,
                                }
                            ]}
                            numberOfLines={1}
                        >
                            {item.title}
                        </Text>

                        <Text
                            style={[
                                styles.sellerName,
                                {
                                    color: colors.neutral.darkGray,
                                    fontSize: typography.fontSize.sm,
                                    marginBottom: spacing.xs,
                                }
                            ]}
                        >
                            @{item.sellerName}
                        </Text>

                        <Text
                            style={[
                                styles.itemPrice,
                                {
                                    color: colors.primary.dark,
                                    fontSize: typography.fontSize.md,
                                    fontWeight: 'bold',
                                }
                            ]}
                        >
                            {item.price}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            {
                                backgroundColor: colors.semantic.error + '20', // 20% opacity
                                marginBottom: spacing.sm,
                            }
                        ]}
                        onPress={() => navigation.navigate('Chat', { sellerId: item.sellerName })}
                    >
                        <Ionicons name="chatbubble" size={20} color={colors.semantic.error} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            {
                                backgroundColor: colors.primary.main + '20', // 20% opacity
                            }
                        ]}
                    >
                        <Ionicons name="cart" size={20} color={colors.primary.main} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.neutral.offWhite }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[
                styles.header,
                {
                    backgroundColor: colors.neutral.white,
                    ...shadows.sm,
                    borderBottomLeftRadius: borderRadius.lg,
                    borderBottomRightRadius: borderRadius.lg,
                }
            ]}>
                <Text style={[styles.logo, { color: colors.neutral.charcoal }]}>LOGO</Text>

                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.headerIconButton}>
                        <Ionicons name="notifications" size={24} color={colors.neutral.charcoal} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIconButton}>
                        <Ionicons name="settings" size={24} color={colors.neutral.charcoal} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.titleContainer, { padding: spacing.md }]}>
                <Text style={[
                    styles.screenTitle,
                    { color: colors.neutral.charcoal, fontSize: typography.fontSize.xl }
                ]}>
                    Saved Items
                </Text>
            </View>

            {SAVED_ITEMS.length > 0 ? (
                <FlatList
                    data={SAVED_ITEMS}
                    renderItem={renderSavedItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 90 }}
                />
            ) : (
                <View style={[styles.emptyState, { paddingTop: spacing.xxxl }]}>
                    <Ionicons name="heart" size={80} color={colors.neutral.lightGray} />
                    <Text style={[
                        styles.emptyStateTitle,
                        {
                            color: colors.neutral.darkGray,
                            fontSize: typography.fontSize.lg,
                            marginTop: spacing.lg,
                        }
                    ]}>
                        No saved items yet
                    </Text>
                    <Text style={[
                        styles.emptyStateSubtitle,
                        {
                            color: colors.neutral.mediumGray,
                            fontSize: typography.fontSize.md,
                            marginTop: spacing.sm,
                            textAlign: 'center',
                        }
                    ]}>
                        Items you like will appear here. Start browsing to find sustainable treasures!
                    </Text>
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
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerIcons: {
        flexDirection: 'row',
    },
    headerIconButton: {
        marginLeft: 16,
    },
    titleContainer: {
        marginBottom: 8,
    },
    screenTitle: {
        fontWeight: 'bold',
    },
    savedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemImage: {
        width: 80,
        height: 80,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontWeight: '600',
    },
    sellerName: {
        fontWeight: '400',
    },
    itemPrice: {
        marginTop: 'auto',
    },
    actionButtons: {
        alignItems: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        fontWeight: 'bold',
    },
    emptyStateSubtitle: {
        lineHeight: 22,
    },
});

export default SavedItemsScreen; 