import { z } from 'zod';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  image?: string;
  features?: string[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

export class DemoShoppingTool {
  private cart: Map<string, CartItem> = new Map();
  private orderHistory: any[] = [];
  private wishlist: Set<string> = new Set();
  
  // Fake product catalog with Dutch and international products
  private products: Record<string, Product> = {
    'MAC-M3-PRO': {
      id: 'MAC-M3-PRO',
      name: 'MacBook Pro M3',
      brand: 'Apple',
      price: 2499.99,
      category: 'Laptops',
      rating: 4.8,
      reviews: 1247,
      inStock: true,
      features: ['M3 Pro chip', '16GB RAM', '512GB SSD', '14-inch display'],
    },
    'IPHONE-15-PRO': {
      id: 'IPHONE-15-PRO',
      name: 'iPhone 15 Pro',
      brand: 'Apple',
      price: 1329.00,
      category: 'Smartphones',
      rating: 4.7,
      reviews: 3421,
      inStock: true,
      features: ['A17 Pro chip', 'Titanium design', '256GB', 'Action button'],
    },
    'SONY-WH1000XM5': {
      id: 'SONY-WH1000XM5',
      name: 'Sony WH-1000XM5',
      brand: 'Sony',
      price: 379.99,
      category: 'Audio',
      rating: 4.6,
      reviews: 892,
      inStock: true,
      features: ['Noise cancelling', '30hr battery', 'Multipoint connection'],
    },
    'PHILIPS-HUE-KIT': {
      id: 'PHILIPS-HUE-KIT',
      name: 'Philips Hue Starter Kit',
      brand: 'Philips',
      price: 199.99,
      category: 'Smart Home',
      rating: 4.5,
      reviews: 2156,
      inStock: true,
      features: ['4 bulbs', 'Bridge included', '16M colors', 'Voice control'],
    },
    'NESPRESSO-VERTUO': {
      id: 'NESPRESSO-VERTUO',
      name: 'Nespresso Vertuo Plus',
      brand: 'Nespresso',
      price: 149.99,
      category: 'Kitchen',
      rating: 4.4,
      reviews: 1823,
      inStock: true,
      features: ['5 cup sizes', 'Automatic blend', '40oz water tank'],
    },
    'DYSON-V15': {
      id: 'DYSON-V15',
      name: 'Dyson V15 Detect',
      brand: 'Dyson',
      price: 699.99,
      category: 'Home Appliances',
      rating: 4.7,
      reviews: 987,
      inStock: false,
      features: ['Laser detection', '60min runtime', 'LCD screen', 'HEPA filter'],
    },
    'SAMSUNG-OLED-55': {
      id: 'SAMSUNG-OLED-55',
      name: 'Samsung S95C OLED 55"',
      brand: 'Samsung',
      price: 1899.99,
      category: 'TVs',
      rating: 4.9,
      reviews: 456,
      inStock: true,
      features: ['4K OLED', 'Quantum HDR', '144Hz gaming', 'Smart TV'],
    },
    'NVIDIA-RTX4090': {
      id: 'NVIDIA-RTX4090',
      name: 'NVIDIA RTX 4090',
      brand: 'NVIDIA',
      price: 1799.99,
      category: 'Computer Parts',
      rating: 4.8,
      reviews: 234,
      inStock: false,
      features: ['24GB GDDR6X', 'DLSS 3', 'Ray tracing', 'AV1 encode'],
    },
  };

  async searchProducts(params: {
    query?: string;
    category?: string;
    maxPrice?: number;
    minRating?: number;
  }): Promise<string> {
    const { query, category, maxPrice, minRating } = params;
    
    let results = Object.values(this.products);
    
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.brand.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
      );
    }
    
    if (category) {
      results = results.filter(p => p.category === category);
    }
    
    if (maxPrice) {
      results = results.filter(p => p.price <= maxPrice);
    }
    
    if (minRating) {
      results = results.filter(p => p.rating >= minRating);
    }
    
    if (results.length === 0) {
      return '🔍 Geen producten gevonden met deze criteria. Probeer andere zoektermen.';
    }
    
    let response = '🛍️ **ZOEKRESULTATEN**\n\n';
    
    for (const product of results.slice(0, 5)) {
      const stockEmoji = product.inStock ? '✅' : '❌';
      const ratingStars = '⭐'.repeat(Math.round(product.rating));
      
      response += `**${product.name}**\n`;
      response += `• Merk: ${product.brand}\n`;
      response += `• Prijs: €${product.price.toFixed(2)}\n`;
      response += `• Rating: ${ratingStars} ${product.rating} (${product.reviews} reviews)\n`;
      response += `• Voorraad: ${stockEmoji} ${product.inStock ? 'Op voorraad' : 'Uitverkocht'}\n`;
      response += `• ID: ${product.id}\n\n`;
    }
    
    if (results.length > 5) {
      response += `... en ${results.length - 5} andere producten\n`;
    }
    
    return response;
  }

  async addToCart(productId: string, quantity: number = 1): Promise<string> {
    const product = this.products[productId];
    
    if (!product) {
      return `❌ Product ${productId} niet gevonden. Gebruik 'search_products' om beschikbare producten te vinden.`;
    }
    
    if (!product.inStock) {
      return `❌ ${product.name} is momenteel uitverkocht. We kunnen het aan je wishlist toevoegen.`;
    }
    
    if (this.cart.has(productId)) {
      const item = this.cart.get(productId)!;
      item.quantity += quantity;
    } else {
      this.cart.set(productId, { product, quantity });
    }
    
    const total = this.calculateCartTotal();
    
    return `
✅ **TOEGEVOEGD AAN WINKELWAGEN**
────────────────────
**Product**: ${product.name}
**Aantal**: ${quantity}
**Prijs per stuk**: €${product.price.toFixed(2)}
**Subtotaal**: €${(product.price * quantity).toFixed(2)}

🛒 **Winkelwagen Status**:
• Items in winkelwagen: ${this.cart.size}
• Totaal aantal producten: ${Array.from(this.cart.values()).reduce((sum, item) => sum + item.quantity, 0)}
• Totaalbedrag: €${total.toFixed(2)}

💡 Tip: Gebruik 'checkout' om je bestelling af te ronden!
`;
  }

  async viewCart(): Promise<string> {
    if (this.cart.size === 0) {
      return '🛒 Je winkelwagen is leeg. Begin met winkelen!';
    }
    
    let response = '🛒 **WINKELWAGEN**\n\n';
    let total = 0;
    
    for (const [id, item] of this.cart) {
      const subtotal = item.product.price * item.quantity;
      total += subtotal;
      
      response += `**${item.product.name}**\n`;
      response += `• Aantal: ${item.quantity}x\n`;
      response += `• Prijs: €${item.product.price.toFixed(2)} per stuk\n`;
      response += `• Subtotaal: €${subtotal.toFixed(2)}\n\n`;
    }
    
    const tax = total * 0.21; // 21% BTW
    const shipping = total > 50 ? 0 : 4.99;
    const grandTotal = total + tax + shipping;
    
    response += `────────────────────\n`;
    response += `Subtotaal: €${total.toFixed(2)}\n`;
    response += `BTW (21%): €${tax.toFixed(2)}\n`;
    response += `Verzending: €${shipping.toFixed(2)} ${total > 50 ? '(Gratis boven €50)' : ''}\n`;
    response += `**TOTAAL: €${grandTotal.toFixed(2)}**\n`;
    
    return response;
  }

  async checkout(params: {
    name: string;
    email: string;
    address: string;
    paymentMethod: 'ideal' | 'creditcard' | 'paypal' | 'klarna';
  }): Promise<string> {
    if (this.cart.size === 0) {
      return '❌ Je winkelwagen is leeg. Voeg eerst producten toe.';
    }
    
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const total = this.calculateCartTotal();
    const tax = total * 0.21;
    const shipping = total > 50 ? 0 : 4.99;
    const grandTotal = total + tax + shipping;
    
    // Create order
    const order = {
      id: orderId,
      timestamp: new Date().toISOString(),
      customer: {
        name: params.name,
        email: params.email,
        address: params.address,
      },
      items: Array.from(this.cart.values()),
      totals: {
        subtotal: total,
        tax,
        shipping,
        total: grandTotal,
      },
      paymentMethod: params.paymentMethod,
      status: 'processing',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
    };
    
    this.orderHistory.push(order);
    
    // Clear cart after order
    this.cart.clear();
    
    // Simulate payment processing
    await this.delay(2000);
    
    const paymentEmojis = {
      ideal: '🏦',
      creditcard: '💳',
      paypal: '🅿️',
      klarna: '🛍️',
    };
    
    return `
✅ **BESTELLING GEPLAATST!**
════════════════════════

📦 **Order ID**: ${orderId}

👤 **Klantgegevens**:
• Naam: ${params.name}
• Email: ${params.email}
• Adres: ${params.address}

📋 **Bestelde items**: ${order.items.length} product(en)

💰 **Betaling**:
• Subtotaal: €${total.toFixed(2)}
• BTW: €${tax.toFixed(2)}
• Verzending: €${shipping.toFixed(2)}
• **TOTAAL: €${grandTotal.toFixed(2)}**
• Betaalmethode: ${paymentEmojis[params.paymentMethod]} ${params.paymentMethod.toUpperCase()}

📅 **Levering**:
• Geschatte leverdatum: ${order.estimatedDelivery}
• Track & Trace wordt per email verstuurd

✉️ **Bevestiging**:
Een orderbevestiging is verzonden naar ${params.email}

🙏 Bedankt voor je bestelling bij AI Shopping Demo!
`;
  }

  async trackOrder(orderId: string): Promise<string> {
    const order = this.orderHistory.find(o => o.id === orderId);
    
    if (!order) {
      return `❌ Order ${orderId} niet gevonden. Controleer je order ID.`;
    }
    
    // Simulate tracking statuses
    const trackingSteps = [
      { status: 'confirmed', emoji: '✅', description: 'Bestelling bevestigd', time: '2 uur geleden' },
      { status: 'processing', emoji: '📦', description: 'Order wordt ingepakt', time: '1 uur geleden' },
      { status: 'shipped', emoji: '🚚', description: 'Onderweg naar sorteercentrum', time: '30 min geleden' },
      { status: 'out_for_delivery', emoji: '🚐', description: 'Uit voor levering', time: 'Binnenkort' },
      { status: 'delivered', emoji: '📬', description: 'Afgeleverd', time: '-' },
    ];
    
    const currentStep = Math.floor(Math.random() * 4); // Random status
    
    let response = `📦 **TRACK & TRACE**\n\n`;
    response += `Order: ${orderId}\n`;
    response += `Datum: ${new Date(order.timestamp).toLocaleDateString('nl-NL')}\n\n`;
    
    for (let i = 0; i < trackingSteps.length; i++) {
      const step = trackingSteps[i];
      const isComplete = i <= currentStep;
      const isCurrent = i === currentStep;
      
      response += `${isComplete ? step.emoji : '⭕'} ${step.description}\n`;
      if (isComplete) {
        response += `   ${isCurrent ? '👉' : '  '} ${step.time}\n`;
      }
      response += '\n';
    }
    
    response += `📍 **Huidige locatie**: ${['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven'][Math.floor(Math.random() * 4)]} sorteercentrum\n`;
    response += `🚚 **Pakketdienst**: PostNL / DHL\n`;
    response += `📅 **Verwachte levering**: ${order.estimatedDelivery}`;
    
    return response;
  }

  async getRecommendations(category?: string): Promise<string> {
    const allProducts = Object.values(this.products);
    const recommendations = category 
      ? allProducts.filter(p => p.category === category)
      : allProducts.sort((a, b) => b.rating - a.rating);
    
    let response = '🎯 **AANBEVOLEN VOOR JOU**\n\n';
    response += 'Op basis van AI-analyse en trending producten:\n\n';
    
    for (const product of recommendations.slice(0, 3)) {
      const discount = Math.floor(Math.random() * 20) + 5;
      const salePrice = product.price * (1 - discount / 100);
      
      response += `🏷️ **${product.name}**\n`;
      response += `• ${product.brand} | ${product.category}\n`;
      response += `• ⭐ ${product.rating} (${product.reviews} reviews)\n`;
      response += `• 💰 ~~€${product.price.toFixed(2)}~~ **€${salePrice.toFixed(2)}** (-${discount}%)\n`;
      
      if (product.features && product.features.length > 0) {
        response += `• ✨ ${product.features.slice(0, 2).join(', ')}\n`;
      }
      
      response += `• 🔥 ${Math.floor(Math.random() * 50) + 10} mensen bekijken dit nu\n\n`;
    }
    
    response += '💡 *Aanbevelingen gebaseerd op populaire items en je interesses*';
    
    return response;
  }

  async compareProducts(productIds: string[]): Promise<string> {
    if (productIds.length < 2) {
      return '❌ Geef minimaal 2 producten op om te vergelijken.';
    }
    
    const productsToCompare = productIds
      .map(id => this.products[id])
      .filter(p => p !== undefined);
    
    if (productsToCompare.length < 2) {
      return '❌ Een of meer product IDs niet gevonden.';
    }
    
    let response = '⚖️ **PRODUCTVERGELIJKING**\n\n';
    
    // Price comparison
    response += '**💰 Prijs:**\n';
    productsToCompare.forEach(p => {
      response += `• ${p.name}: €${p.price.toFixed(2)}\n`;
    });
    
    // Rating comparison
    response += '\n**⭐ Rating:**\n';
    productsToCompare.forEach(p => {
      response += `• ${p.name}: ${p.rating} (${p.reviews} reviews)\n`;
    });
    
    // Availability
    response += '\n**📦 Beschikbaarheid:**\n';
    productsToCompare.forEach(p => {
      response += `• ${p.name}: ${p.inStock ? '✅ Op voorraad' : '❌ Uitverkocht'}\n`;
    });
    
    // Features
    response += '\n**✨ Belangrijkste features:**\n';
    productsToCompare.forEach(p => {
      if (p.features && p.features.length > 0) {
        response += `• ${p.name}: ${p.features.slice(0, 2).join(', ')}\n`;
      }
    });
    
    // Recommendation
    const bestValue = productsToCompare.reduce((best, current) => 
      (current.rating / current.price) > (best.rating / best.price) ? current : best
    );
    
    response += `\n🏆 **Beste koop**: ${bestValue.name} (beste prijs-kwaliteit verhouding)`;
    
    return response;
  }

  private calculateCartTotal(): number {
    let total = 0;
    for (const item of this.cart.values()) {
      total += item.product.price * item.quantity;
    }
    return total;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}