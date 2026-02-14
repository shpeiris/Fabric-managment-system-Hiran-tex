# Frontend Services Layer

Centralized API service layer for the Fabric Management System frontend.

## Directory Structure

```
src/
├── api/
│   └── client.js          # Axios instance with interceptors
├── services/
│   ├── authService.js     # Authentication APIs
│   ├── userService.js     # User management APIs
│   ├── productService.js  # Product/Fabric APIs
│   ├── orderService.js    # Order management APIs
│   ├── cartService.js     # Shopping cart APIs
│   ├── paymentService.js  # Payment APIs
│   └── index.js           # Service exports
```

## Usage

### Basic Import

```javascript
import { authService, productService, orderService } from "../services";
```

### Authentication

```javascript
// Login
const handleLogin = async (email, password) => {
  try {
    const data = await authService.login({ email, password });
    console.log("User:", data.user);
    navigate(data.redirectTo);
  } catch (error) {
    console.error(error.error);
  }
};

// Register
const data = await authService.register({
  full_name: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  address: "123 Main St",
  username: "johndoe",
  password: "password123",
});

// Logout
await authService.logout();

// Get current user
const user = await authService.getCurrentUser();
```

### Products

```javascript
// Get all products
const products = await productService.getAllProducts();

// Search products
const results = await productService.getAllProducts({ search: "cotton" });

// Get product by ID
const product = await productService.getProductById(1);

// Create product (Admin/Inventory)
const newProduct = await productService.createProduct({
  name: "Cotton Fabric",
  material_type: "Cotton",
  color: "Blue",
  price_per_meter: 250.0,
  stock_quantity: 100,
});

// Update stock
await productService.updateStock(productId, 50);

// Get low stock items
const lowStock = await productService.getLowStockProducts();
```

### Cart

```javascript
// Get cart
const cart = await cartService.getCart();

// Add to cart
await cartService.addToCart({
  fabric_id: 1,
  quantity: 5,
});

// Update cart item
await cartService.updateCartItem(cartItemId, 10);

// Remove from cart
await cartService.removeFromCart(cartItemId);

// Clear cart
await cartService.clearCart();
```

### Orders

```javascript
// Get all orders
const orders = await orderService.getAllOrders();

// Get my orders
const myOrders = await orderService.getMyOrders();

// Create order
const order = await orderService.createOrder({
  customer_id: 1,
  total_amount: 1250.0,
  delivery_address: "123 Main St",
  items: [{ fabric_id: 1, quantity: 5, price_per_meter: 250.0 }],
});

// Update order status
await orderService.updateOrderStatus(orderId, "SHIPPED");

// Cancel order
await orderService.cancelOrder(orderId);
```

### Payments

```javascript
// Get all payments
const payments = await paymentService.getAllPayments();

// Get my payments
const myPayments = await paymentService.getMyPayments();

// Create payment
const payment = await paymentService.createPayment({
  order_id: 1,
  payment_amount: 1250.0,
  payment_method: "Bank Transfer",
});

// Upload payment proof
const formData = new FormData();
formData.append("file", bankSlipFile);
await paymentService.uploadPaymentProof(paymentId, formData);

// Verify payment (Admin)
await paymentService.verifyPayment(paymentId);
```

### Users

```javascript
// Get all users (Admin)
const users = await userService.getAllUsers();

// Create user (Admin)
const newUser = await userService.createUser(userData);

// Update profile
await userService.updateProfile({
  full_name: "Updated Name",
  phone: "9876543210",
});

// Change password
await userService.changePassword({
  currentPassword: "old123",
  newPassword: "new456",
});
```

## Error Handling

All services throw errors that can be caught:

```javascript
try {
  const data = await authService.login(credentials);
  // Success
} catch (error) {
  console.error(error.error); // Error message
  setError(error.error);
}
```

## API Configuration

Base URL can be configured via environment variable:

```bash
# .env
VITE_API_URL=http://localhost:5000
```

## Features

✅ Centralized axios instance  
✅ Request/response interceptors  
✅ Automatic error handling  
✅ Session cookie management  
✅ Type-safe error messages  
✅ Modular service structure  
✅ Easy to mock for testing

## Migration Example

**Before** (Direct fetch):

```javascript
const response = await fetch("http://localhost:5000/login", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const data = await response.json();
```

**After** (Using service):

```javascript
const data = await authService.login({ email, password });
```

Much cleaner and easier to maintain!
