import { supabase } from '../config/supabase';

export interface Message {
    id: string;
    senderId: string;
    recipientId: string;
    itemId?: string;
    text: string;
    images?: string[];
    status: 'read' | 'unread' | 'sending';
    createdAt: string;
}

export interface ChatSummary {
    userId: string;
    lastMessage: Message;
    unreadCount: number;
}

export interface MessageInput {
    senderId: string;
    recipientId: string;
    itemId?: string;
    text: string;
    images?: string[];
}

export class ChatModel {
    /**
     * Send a new message
     */
    static async sendMessage(messageData: MessageInput): Promise<Message> {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                sender_id: messageData.senderId,
                recipient_id: messageData.recipientId,
                item_id: messageData.itemId || null,
                text: messageData.text,
                images: messageData.images || [],
                status: 'unread',
                created_at: new Date(),
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return {
            id: data.id,
            senderId: data.sender_id,
            recipientId: data.recipient_id,
            itemId: data.item_id,
            text: data.text,
            images: data.images,
            status: data.status,
            createdAt: data.created_at,
        };
    }

    /**
     * Get conversation between two users
     */
    static async getConversation(
        userId: string,
        otherUserId: string,
        itemId?: string
    ): Promise<Message[]> {
        let query = supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
            .order('created_at', { ascending: true });

        if (itemId) {
            query = query.eq('item_id', itemId);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        return data.map((message: any) => ({
            id: message.id,
            senderId: message.sender_id,
            recipientId: message.recipient_id,
            itemId: message.item_id,
            text: message.text,
            images: message.images,
            status: message.status,
            createdAt: message.created_at,
        }));
    }

    /**
     * Mark messages as read
     */
    static async markAsRead(userId: string, otherUserId: string): Promise<boolean> {
        const { error } = await supabase
            .from('messages')
            .update({ status: 'read' })
            .eq('sender_id', otherUserId)
            .eq('recipient_id', userId)
            .eq('status', 'unread');

        if (error) {
            throw error;
        }

        return true;
    }

    /**
     * Get user's chat list with most recent message per chat
     */
    static async getChatList(userId: string): Promise<ChatSummary[]> {
        // Custom query to get the most recent message and unread count for each chat partner
        const { data, error } = await supabase.rpc('get_chat_list', {
            p_user_id: userId
        });

        if (error) {
            throw error;
        }

        return data.map((chat: any) => ({
            userId: chat.user_id,
            lastMessage: {
                id: chat.message_id,
                senderId: chat.sender_id,
                recipientId: chat.recipient_id,
                itemId: chat.item_id,
                text: chat.text,
                images: chat.images,
                status: chat.status,
                createdAt: chat.created_at,
            },
            unreadCount: chat.unread_count,
        }));
    }

    /**
     * Get unread message count for a user
     */
    static async getUnreadCount(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', userId)
            .eq('status', 'unread');

        if (error) {
            throw error;
        }

        return count || 0;
    }

    /**
     * Delete a message
     */
    static async deleteMessage(messageId: string, userId: string): Promise<boolean> {
        // Only allow deletion if user is sender
        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', messageId)
            .eq('sender_id', userId);

        if (error) {
            throw error;
        }

        return true;
    }
} 