import { getCart, getCartCount } from './backend/services/cartService.js';

async function verifyCart() {
    try {
        // Assume customer_id 1 exists from previous seeding
        const customerId = 1;
        console.log(`Testing cart for customer_id: ${customerId}`);
        
        const count = await getCartCount(customerId);
        console.log('Cart count result:', count);
        
        const cart = await getCart(customerId);
        console.log('Cart items found:', cart.length);
        
        process.exit(0);
    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    }
}

verifyCart();
