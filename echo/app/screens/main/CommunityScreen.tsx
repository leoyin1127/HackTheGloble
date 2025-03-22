import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface CommunityPost {
    id: string;
    user: string;
    avatar: string;
    image: string;
    title: string;
    content: string;
    likes: number;
    comments: number;
}

const CommunityScreen = () => {
    // Mock data for community posts
    const communityPosts: CommunityPost[] = [
        {
            id: '1',
            user: 'EcoFashion',
            avatar: 'https://placehold.co/100x100/45B69C/FFFFFF?text=EF',
            image: 'https://placehold.co/600x400/E0F7FA/2C3E50?text=Upcycled+Fashion',
            title: 'Upcycled Denim Workshop',
            content: 'Join us for a workshop on how to transform old denim into new accessories. Learn valuable skills and contribute to reducing textile waste!',
            likes: 34,
            comments: 12,
        },
        {
            id: '2',
            user: 'GreenLiving',
            avatar: 'https://placehold.co/100x100/45B69C/FFFFFF?text=GL',
            image: 'https://placehold.co/600x400/E8F5E9/2C3E50?text=Sustainable+Living',
            title: 'Minimalist Lifestyle Tips',
            content: 'Check out these practical tips for embracing minimalism and reducing consumption without sacrificing quality of life.',
            likes: 56,
            comments: 23,
        },
        {
            id: '3',
            user: 'VintageCollector',
            avatar: 'https://placehold.co/100x100/45B69C/FFFFFF?text=VC',
            image: 'https://placehold.co/600x400/FFF3E0/2C3E50?text=Vintage+Finds',
            title: 'How to Spot Quality Vintage Items',
            content: 'Learn how to identify quality vintage clothing and accessories that will last for years to come. Sustainability through durability!',
            likes: 42,
            comments: 18,
        },
    ];

    const renderPost = (post: CommunityPost) => (
        <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
                <Image source={{ uri: post.avatar }} style={styles.avatar} />
                <Text style={styles.username}>{post.user}</Text>
            </View>
            <Image source={{ uri: post.image }} style={styles.postImage} />
            <View style={styles.postContent}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postText}>{post.content}</Text>
                <View style={styles.postStats}>
                    <TouchableOpacity style={styles.statButton}>
                        <Text style={styles.statText}>❤️ {post.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statButton}>
                        <Text style={styles.statText}>💬 {post.comments}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Community</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.topicsContainer}>
                    <Text style={styles.sectionTitle}>Sustainability Topics</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicsScroll}>
                        <TouchableOpacity style={styles.topicButton}>
                            <Text style={styles.topicText}>Upcycling</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.topicButton}>
                            <Text style={styles.topicText}>Eco-Fashion</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.topicButton}>
                            <Text style={styles.topicText}>Zero Waste</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.topicButton}>
                            <Text style={styles.topicText}>Minimalism</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.topicButton}>
                            <Text style={styles.topicText}>Vintage</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <View style={styles.postsContainer}>
                    <Text style={styles.sectionTitle}>Community Posts</Text>
                    {communityPosts.map(post => renderPost(post))}

                    <TouchableOpacity style={styles.createPostButton}>
                        <Text style={styles.createPostButtonText}>Share Your Sustainable Story</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    topicsContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 16,
    },
    topicsScroll: {
        flexDirection: 'row',
    },
    topicButton: {
        backgroundColor: '#E8F5E9',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
    },
    topicText: {
        color: '#45B69C',
        fontWeight: '500',
    },
    postsContainer: {
        padding: 16,
    },
    postCard: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    username: {
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    postImage: {
        width: '100%',
        height: 200,
    },
    postContent: {
        padding: 16,
    },
    postTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 8,
    },
    postText: {
        fontSize: 14,
        color: '#7F8C8D',
        lineHeight: 20,
        marginBottom: 16,
    },
    postStats: {
        flexDirection: 'row',
    },
    statButton: {
        marginRight: 20,
    },
    statText: {
        color: '#7F8C8D',
    },
    createPostButton: {
        backgroundColor: '#45B69C',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 30,
    },
    createPostButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CommunityScreen; 