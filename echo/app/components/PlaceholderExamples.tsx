import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import PlaceholderImage from './PlaceholderImage';

const PlaceholderExamples = () => {
    const { colors, spacing, borderRadius, typography } = useTheme();

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            <Text style={[styles.title, { color: colors.neutral.charcoal }]}>
                Placeholder Images
            </Text>

            {/* Product Placeholders */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.neutral.darkGray }]}>
                    Product Placeholders
                </Text>
                <View style={styles.row}>
                    <View style={styles.placeholderItem}>
                        <PlaceholderImage
                            type="product"
                            width={80}
                            height={80}
                            text="Small"
                        />
                        <Text style={styles.label}>Small</Text>
                    </View>

                    <View style={styles.placeholderItem}>
                        <PlaceholderImage
                            type="product"
                            width={120}
                            height={120}
                            text="Medium"
                        />
                        <Text style={styles.label}>Medium</Text>
                    </View>

                    <View style={styles.placeholderItem}>
                        <PlaceholderImage
                            type="product"
                            width={160}
                            height={160}
                            text="Large"
                        />
                        <Text style={styles.label}>Large</Text>
                    </View>
                </View>
            </View>

            {/* Avatar Placeholders */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.neutral.darkGray }]}>
                    Avatar Placeholders
                </Text>
                <View style={styles.row}>
                    <View style={styles.placeholderItem}>
                        <PlaceholderImage
                            type="avatar"
                            width={50}
                            height={50}
                            borderRadius={borderRadius.round}
                        />
                        <Text style={styles.label}>Round</Text>
                    </View>

                    <View style={styles.placeholderItem}>
                        <PlaceholderImage
                            type="avatar"
                            width={50}
                            height={50}
                            borderRadius={borderRadius.md}
                        />
                        <Text style={styles.label}>Rounded</Text>
                    </View>

                    <View style={styles.placeholderItem}>
                        <PlaceholderImage
                            type="avatar"
                            width={50}
                            height={50}
                            borderRadius={0}
                        />
                        <Text style={styles.label}>Square</Text>
                    </View>
                </View>
            </View>

            {/* Banner Placeholders */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.neutral.darkGray }]}>
                    Banner Placeholders
                </Text>
                <View style={styles.column}>
                    <View style={styles.placeholderItem}>
                        <PlaceholderImage
                            type="banner"
                            width="100%"
                            height={120}
                            borderRadius={borderRadius.md}
                            text="Full-width Banner"
                        />
                        <Text style={styles.label}>Full Width</Text>
                    </View>

                    <View style={styles.placeholderItem}>
                        <PlaceholderImage
                            type="banner"
                            width="90%"
                            height={100}
                            borderRadius={borderRadius.lg}
                            text="Card Banner"
                        />
                        <Text style={styles.label}>Card Width</Text>
                    </View>
                </View>
            </View>

            {/* Category Placeholders */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.neutral.darkGray }]}>
                    Category Placeholders
                </Text>
                <View style={styles.row}>
                    <View style={styles.placeholderItem}>
                        <PlaceholderImage
                            type="category"
                            width={80}
                            height={80}
                            borderRadius={borderRadius.lg}
                            text="Food"
                        />
                        <Text style={styles.label}>Food</Text>
                    </View>

                    <View style={styles.placeholderItem}>
                        <PlaceholderImage
                            type="category"
                            width={80}
                            height={80}
                            borderRadius={borderRadius.lg}
                            text="Fashion"
                        />
                        <Text style={styles.label}>Fashion</Text>
                    </View>

                    <View style={styles.placeholderItem}>
                        <PlaceholderImage
                            type="category"
                            width={80}
                            height={80}
                            borderRadius={borderRadius.lg}
                            text="Electronics"
                        />
                        <Text style={styles.label}>Electronics</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    column: {
        flexDirection: 'column',
    },
    placeholderItem: {
        alignItems: 'center',
        marginBottom: 16,
        marginRight: 8,
    },
    label: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
});

export default PlaceholderExamples; 