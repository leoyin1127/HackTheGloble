-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    shipping_address TEXT,
    preferences JSONB DEFAULT '[]'::JSONB,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    condition VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    size VARCHAR(50),
    material VARCHAR(100),
    color VARCHAR(50),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_ids UUID[] DEFAULT ARRAY[]::UUID[],
    sustainability_info JSONB DEFAULT '{}'::JSONB,
    sustainability INTEGER DEFAULT 0,
    sustainability_badges TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    shipping_method VARCHAR(100) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES products(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(20) NOT NULL DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved items table
CREATE TABLE IF NOT EXISTS saved_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

-- Seller reviews table
CREATE TABLE IF NOT EXISTS seller_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(seller_id, reviewer_id)
);

-- Function to create an order with items
CREATE OR REPLACE FUNCTION create_order(
    p_user_id UUID,
    p_total_amount DECIMAL,
    p_shipping_address TEXT,
    p_shipping_method VARCHAR,
    p_payment_method VARCHAR,
    p_items JSONB
) RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_item JSONB;
BEGIN
    -- Insert order
    INSERT INTO orders (
        user_id,
        total_amount,
        shipping_address,
        shipping_method,
        payment_method
    ) VALUES (
        p_user_id,
        p_total_amount,
        p_shipping_address,
        p_shipping_method,
        p_payment_method
    ) RETURNING id INTO v_order_id;
    
    -- Insert order items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            price,
            subtotal
        ) VALUES (
            v_order_id,
            (v_item->>'product_id')::UUID,
            (v_item->>'quantity')::INTEGER,
            (v_item->>'price')::DECIMAL,
            (v_item->>'subtotal')::DECIMAL
        );
    END LOOP;
    
    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get chat list with latest message per chat and unread count
CREATE OR REPLACE FUNCTION get_chat_list(p_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    message_id UUID,
    sender_id UUID,
    recipient_id UUID,
    item_id UUID,
    text TEXT,
    images TEXT[],
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH chat_partners AS (
        -- Find all users the current user has chatted with
        SELECT DISTINCT
            CASE
                WHEN sender_id = p_user_id THEN recipient_id
                ELSE sender_id
            END AS partner_id
        FROM messages
        WHERE sender_id = p_user_id OR recipient_id = p_user_id
    ),
    latest_messages AS (
        -- Get the latest message for each chat partner
        SELECT DISTINCT ON (partner_id)
            cp.partner_id,
            m.id,
            m.sender_id,
            m.recipient_id,
            m.item_id,
            m.text,
            m.images,
            m.status,
            m.created_at
        FROM chat_partners cp
        JOIN messages m ON (m.sender_id = cp.partner_id AND m.recipient_id = p_user_id)
            OR (m.sender_id = p_user_id AND m.recipient_id = cp.partner_id)
        ORDER BY cp.partner_id, m.created_at DESC
    ),
    unread_counts AS (
        -- Count unread messages for each chat partner
        SELECT
            sender_id,
            COUNT(*) AS count
        FROM messages
        WHERE recipient_id = p_user_id AND status = 'unread'
        GROUP BY sender_id
    )
    SELECT
        lm.partner_id,
        lm.id,
        lm.sender_id,
        lm.recipient_id,
        lm.item_id,
        lm.text,
        lm.images,
        lm.status,
        lm.created_at,
        COALESCE(uc.count, 0) AS unread_count
    FROM latest_messages lm
    LEFT JOIN unread_counts uc ON lm.partner_id = uc.sender_id
    ORDER BY lm.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert some initial categories
INSERT INTO categories (name, description) VALUES
('Clothing', 'Sustainable and second-hand clothing items'),
('Home', 'Eco-friendly home goods and decor'),
('Electronics', 'Refurbished and energy-efficient electronics'),
('Books', 'Used books and publications'),
('Toys', 'Second-hand toys and games'),
('Sports', 'Pre-owned sports equipment'),
('Art', 'Handmade and upcycled art pieces'),
('Jewelry', 'Sustainable and vintage jewelry')
ON CONFLICT (name) DO NOTHING; 