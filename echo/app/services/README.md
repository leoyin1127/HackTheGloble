# API Services for Frontend

This directory contains service modules that handle API communication between the frontend and the Supabase backend.

## ProductService

The `ProductService` provides a clean interface for interacting with product data stored in Supabase. It handles data fetching, transformation, and normalization to ensure the front-end components receive properly formatted data.

### Features

- **Data Fetching**: Retrieves product data from Supabase with support for filtering, sorting, and pagination
- **Data Transformation**: Formats product records into a consistent structure for the UI components
- **Category Filtering**: Support for finding products by category
- **Sustainability Scoring**: Properly formats and displays sustainability metrics

### Usage

Import the service in your components:

```typescript
import ProductService, { Product, ProductFilters } from '../services/ProductService';
```

#### Fetching Products with Filters

```typescript
// Define filters (all fields are optional)
const filters: ProductFilters = {
  category: 'Clothing',
  minPrice: 20,
  maxPrice: 100,
  minSustainability: 70,
  searchQuery: 'organic',
  sortBy: 'price_asc',
  limit: 20
};

// Fetch products with filters
const products = await ProductService.getProducts(filters);
```

#### Getting a Single Product

```typescript
const product = await ProductService.getProductById('product-id-123');
```

#### Featured Products

```typescript
const featuredProducts = await ProductService.getFeaturedProducts(10);
```

### Using with ProductContext

For most cases, you should use the `ProductContext` provider and `useProducts` hook, which already implements this service:

```typescript
import { useProducts } from '../context/ProductContext';

function MyComponent() {
  const { 
    products, 
    featuredProducts, 
    loading, 
    error, 
    fetchProducts 
  } = useProducts();
  
  useEffect(() => {
    // Load products when component mounts
    fetchProducts({ category: 'Clothing' });
  }, []);
  
  return (
    <View>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </View>
  );
}
```

## Configuration

The service is already configured to connect to the Supabase backend using the credentials in `app/utils/supabase.ts`. If you need to change the Supabase project URL or key, edit that file.

## Error Handling

All service methods include proper error handling and will log errors to the console. In a production environment, you might want to add more sophisticated error reporting. 