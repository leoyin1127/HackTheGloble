import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import PlaceholderImage from '../../components/PlaceholderImage';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { colors, spacing, borderRadius, typography, shadows } = useTheme();
    const { signOut } = useAuth();

    const menuItems = [
        { icon: 'heart-outline', label: 'Saved Items', screen: 'Saved' },
        { icon: 'cart-outline', label: 'My Orders', screen: 'Cart' },
        { icon: 'settings-outline', label: 'Settings' },
        { icon: 'help-circle-outline', label: 'Help & Support' },
        { icon: 'log-out-outline', label: 'Log Out' },
    ];

    const handleMenuItemPress = async (item: typeof menuItems[0]) => {
        if (item.screen) {
            navigation.navigate(item.screen as never);
        } else if (item.label === 'Log Out') {
            try {
                await signOut();
                // Navigate to SignUp screen
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'SignUp' as never }]
                });
            } catch (error) {
                console.error('Error signing out:', error);
            }
        }
    };

    const renderMenuItem = (item: typeof menuItems[0], index: number) => (
        <TouchableOpacity
            key={index}
            style={[
                styles.menuItem,
                {
                    backgroundColor: colors.neutral.white,
                    borderRadius: borderRadius.md,
                    marginBottom: spacing.sm,
                    ...shadows.sm,
                },
            ]}
            onPress={() => handleMenuItemPress(item)}
        >
            <View style={styles.menuItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary.light}30` }]}>
                    <Ionicons name={item.icon as any} size={22} color={colors.primary.main} />
                </View>
                <Text style={[styles.menuItemLabel, { color: colors.neutral.charcoal }]}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral.mediumGray} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.neutral.offWhite }]}>
            <StatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.xl }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.neutral.charcoal} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="notifications-outline" size={24} color={colors.neutral.charcoal} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.profileSection, { marginTop: spacing.xl, marginHorizontal: spacing.lg }]}>
                    <PlaceholderImage
                        type="avatar"
                        width={100}
                        height={100}
                        borderRadius={borderRadius.round}
                    />
                    <View style={[styles.profileInfo, { marginLeft: spacing.lg }]}>
                        <Text style={[styles.profileName, { color: colors.neutral.charcoal, fontSize: typography.fontSize.xl }]}>
                            Clara Wilson
                        </Text>
                        <Text style={[styles.profileEmail, { color: colors.neutral.darkGray, fontSize: typography.fontSize.sm }]}>
                            clara.wilson@example.com
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.editButton,
                                {
                                    backgroundColor: colors.neutral.white,
                                    borderRadius: borderRadius.sm,
                                    borderColor: colors.primary.main,
                                    marginTop: spacing.sm
                                }
                            ]}
                        >
                            <Text style={{ color: colors.primary.main, fontSize: typography.fontSize.sm }}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.statsSection, { marginTop: spacing.xl, marginHorizontal: spacing.lg }]}>
                    <View style={[
                        styles.statCard,
                        {
                            backgroundColor: colors.neutral.white,
                            borderRadius: borderRadius.md,
                            ...shadows.sm,
                            marginRight: spacing.sm
                        }
                    ]}>
                        <Text style={[styles.statNumber, { color: colors.primary.main }]}>12</Text>
                        <Text style={[styles.statLabel, { color: colors.neutral.darkGray }]}>Orders</Text>
                    </View>
                    <View style={[
                        styles.statCard,
                        {
                            backgroundColor: colors.neutral.white,
                            borderRadius: borderRadius.md,
                            ...shadows.sm
                        }
                    ]}>
                        <Text style={[styles.statNumber, { color: colors.primary.main }]}>85%</Text>
                        <Text style={[styles.statLabel, { color: colors.neutral.darkGray }]}>Sustainability</Text>
                    </View>
                </View>

                <View style={[styles.menuSection, { marginTop: spacing.xl, marginHorizontal: spacing.lg }]}>
                    <Text style={[styles.sectionTitle, { color: colors.neutral.charcoal, marginBottom: spacing.md }]}>
                        Account Settings
                    </Text>
                    {menuItems.map(renderMenuItem)}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontWeight: 'bold',
    },
    profileEmail: {
        marginTop: 4,
    },
    editButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    statsSection: {
        flexDirection: 'row',
    },
    statCard: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 14,
        marginTop: 4,
    },
    menuSection: {},
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuItemLabel: {
        fontSize: 16,
    },
});

export default ProfileScreen; 