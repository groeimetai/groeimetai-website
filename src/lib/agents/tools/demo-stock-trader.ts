import { z } from 'zod';

interface StockPosition {
  symbol: string;
  shares: number;
  buyPrice: number;
  currentPrice: number;
  change: number;
  changePercent: number;
}

interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  change: number;
  bid: number;
  ask: number;
  high: number;
  low: number;
}

export class DemoStockTraderTool {
  private portfolio: Map<string, StockPosition> = new Map();
  private balance: number = 100000; // Start with €100k demo money
  private transactionHistory: any[] = [];
  
  // Fake stock data with Dutch and tech companies
  private stocks = {
    'ASML': { name: 'ASML Holding', price: 650.50, volatility: 0.03 },
    'ADYEN': { name: 'Adyen NV', price: 1250.75, volatility: 0.04 },
    'INGA': { name: 'ING Group', price: 12.85, volatility: 0.02 },
    'RDSA': { name: 'Shell', price: 28.50, volatility: 0.025 },
    'UNA': { name: 'Unilever', price: 48.20, volatility: 0.015 },
    'MSFT': { name: 'Microsoft', price: 380.50, volatility: 0.025 },
    'GOOGL': { name: 'Google', price: 145.30, volatility: 0.03 },
    'NVDA': { name: 'NVIDIA', price: 480.25, volatility: 0.05 },
    'TSLA': { name: 'Tesla', price: 245.80, volatility: 0.06 },
    'AAPL': { name: 'Apple', price: 185.50, volatility: 0.02 },
  };

  constructor() {
    // Initialize with some positions
    this.portfolio.set('ASML', {
      symbol: 'ASML',
      shares: 10,
      buyPrice: 620.00,
      currentPrice: 650.50,
      change: 30.50,
      changePercent: 4.92,
    });
    
    this.portfolio.set('ADYEN', {
      symbol: 'ADYEN',
      shares: 5,
      buyPrice: 1300.00,
      currentPrice: 1250.75,
      change: -49.25,
      changePercent: -3.79,
    });
  }

  async executeOrder(params: {
    action: 'buy' | 'sell' | 'short' | 'cover';
    symbol: string;
    quantity: number;
    orderType: 'market' | 'limit' | 'stop-loss';
    limitPrice?: number;
  }): Promise<string> {
    const { action, symbol, quantity, orderType, limitPrice } = params;
    
    // Simulate market price with some randomness
    const stock = this.stocks[symbol as keyof typeof this.stocks];
    if (!stock) {
      return `❌ Symbool ${symbol} niet gevonden. Beschikbare symbolen: ${Object.keys(this.stocks).join(', ')}`;
    }
    
    const basePrice = stock.price;
    const variation = (Math.random() - 0.5) * stock.volatility * basePrice;
    const currentPrice = basePrice + variation;
    
    // Simulate order execution
    await this.delay(Math.random() * 2000 + 1000); // 1-3 second delay
    
    let executionPrice = currentPrice;
    let executed = true;
    
    if (orderType === 'limit' && limitPrice) {
      if (action === 'buy' && currentPrice > limitPrice) {
        executed = false;
      } else if (action === 'sell' && currentPrice < limitPrice) {
        executed = false;
      } else {
        executionPrice = limitPrice;
      }
    }
    
    if (!executed) {
      return `⏳ Limit order geplaatst: ${action.toUpperCase()} ${quantity} ${symbol} @ €${limitPrice?.toFixed(2)}
Huidige marktprijs: €${currentPrice.toFixed(2)}
Status: PENDING`;
    }
    
    const totalValue = executionPrice * quantity;
    
    if (action === 'buy') {
      if (totalValue > this.balance) {
        return `❌ Onvoldoende saldo. Beschikbaar: €${this.balance.toFixed(2)}, Benodigd: €${totalValue.toFixed(2)}`;
      }
      
      this.balance -= totalValue;
      
      // Update or add position
      const existing = this.portfolio.get(symbol);
      if (existing) {
        const totalShares = existing.shares + quantity;
        const avgPrice = ((existing.shares * existing.buyPrice) + (quantity * executionPrice)) / totalShares;
        existing.shares = totalShares;
        existing.buyPrice = avgPrice;
        existing.currentPrice = currentPrice;
      } else {
        this.portfolio.set(symbol, {
          symbol,
          shares: quantity,
          buyPrice: executionPrice,
          currentPrice,
          change: 0,
          changePercent: 0,
        });
      }
    } else if (action === 'sell') {
      const position = this.portfolio.get(symbol);
      if (!position || position.shares < quantity) {
        return `❌ Onvoldoende aandelen. Beschikbaar: ${position?.shares || 0} ${symbol}`;
      }
      
      this.balance += totalValue;
      position.shares -= quantity;
      
      if (position.shares === 0) {
        this.portfolio.delete(symbol);
      }
    }
    
    // Record transaction
    const transaction = {
      id: `TRX-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      symbol,
      quantity,
      price: executionPrice,
      total: totalValue,
      orderType,
    };
    
    this.transactionHistory.push(transaction);
    
    // Generate realistic response
    const emoji = action === 'buy' ? '🟢' : '🔴';
    const dutchAction = action === 'buy' ? 'GEKOCHT' : 'VERKOCHT';
    
    return `
${emoji} **ORDER UITGEVOERD**
────────────────────
**${dutchAction}**: ${quantity}x ${symbol} (${stock.name})
**Uitvoeringsprijs**: €${executionPrice.toFixed(2)}
**Totale waarde**: €${totalValue.toFixed(2)}
**Order Type**: ${orderType.toUpperCase()}
**Transactie ID**: ${transaction.id}

📊 **Portfolio Update**:
• Nieuw saldo: €${this.balance.toFixed(2)}
• Positie ${symbol}: ${this.portfolio.get(symbol)?.shares || 0} aandelen
• Gemiddelde aankoopprijs: €${this.portfolio.get(symbol)?.buyPrice.toFixed(2) || '0.00'}

⏰ Uitgevoerd om: ${new Date().toLocaleTimeString('nl-NL')}
`;
  }

  async getMarketData(symbols: string[]): Promise<string> {
    const data: MarketData[] = [];
    
    for (const symbol of symbols) {
      const stock = this.stocks[symbol as keyof typeof this.stocks];
      if (!stock) continue;
      
      const basePrice = stock.price;
      const variation = (Math.random() - 0.5) * stock.volatility * basePrice;
      const currentPrice = basePrice + variation;
      const change = variation;
      const changePercent = (variation / basePrice) * 100;
      
      data.push({
        symbol,
        price: currentPrice,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        change,
        bid: currentPrice - 0.05,
        ask: currentPrice + 0.05,
        high: basePrice + Math.abs(variation) * 2,
        low: basePrice - Math.abs(variation) * 2,
      });
    }
    
    let response = '📈 **LIVE MARKTDATA**\n';
    response += '```\n';
    response += 'Symbol  | Prijs     | Verandering | Volume    | Bid/Ask\n';
    response += '--------|-----------|-------------|-----------|-------------\n';
    
    for (const item of data) {
      const changeEmoji = item.change >= 0 ? '🟢' : '🔴';
      response += `${item.symbol.padEnd(7)} | €${item.price.toFixed(2).padEnd(8)} | ${changeEmoji} ${item.change >= 0 ? '+' : ''}${item.changePercent.toFixed(2)}% | ${(item.volume / 1000000).toFixed(1)}M | ${item.bid.toFixed(2)}/${item.ask.toFixed(2)}\n`;
    }
    response += '```';
    
    return response;
  }

  async getPortfolio(): Promise<string> {
    if (this.portfolio.size === 0) {
      return '📊 Portfolio is leeg. Begin met handelen om posities op te bouwen!';
    }
    
    let totalValue = this.balance;
    let totalGainLoss = 0;
    
    let response = '💼 **PORTFOLIO OVERZICHT**\n\n';
    response += '**Cash Balance**: €' + this.balance.toFixed(2) + '\n\n';
    response += '**Posities:**\n';
    
    for (const [symbol, position] of this.portfolio) {
      const stock = this.stocks[symbol as keyof typeof this.stocks];
      if (!stock) continue;
      
      // Simulate current price
      const variation = (Math.random() - 0.5) * stock.volatility * stock.price;
      const currentPrice = stock.price + variation;
      position.currentPrice = currentPrice;
      
      const positionValue = position.shares * currentPrice;
      const gainLoss = (currentPrice - position.buyPrice) * position.shares;
      const gainLossPercent = ((currentPrice - position.buyPrice) / position.buyPrice) * 100;
      
      totalValue += positionValue;
      totalGainLoss += gainLoss;
      
      const emoji = gainLoss >= 0 ? '🟢' : '🔴';
      
      response += `
${emoji} **${symbol}** (${stock.name})
• Aandelen: ${position.shares}
• Gem. Aankoopprijs: €${position.buyPrice.toFixed(2)}
• Huidige Prijs: €${currentPrice.toFixed(2)}
• Positie Waarde: €${positionValue.toFixed(2)}
• Winst/Verlies: €${gainLoss.toFixed(2)} (${gainLossPercent >= 0 ? '+' : ''}${gainLossPercent.toFixed(2)}%)
`;
    }
    
    const totalReturn = ((totalValue - 100000) / 100000) * 100;
    
    response += `
────────────────────
📊 **TOTAAL**
• Portfolio Waarde: €${totalValue.toFixed(2)}
• Totale W/V: €${totalGainLoss.toFixed(2)}
• Totaal Rendement: ${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%
• Start Kapitaal: €100,000.00
`;
    
    return response;
  }

  async executeTradingStrategy(strategy: string): Promise<string> {
    // Simulate different trading strategies
    const strategies: Record<string, () => Promise<string>> = {
      'momentum': async () => {
        // Find trending stocks
        const trending = ['NVDA', 'ASML', 'MSFT'];
        const symbol = trending[Math.floor(Math.random() * trending.length)];
        const quantity = Math.floor(Math.random() * 10) + 5;
        
        return await this.executeOrder({
          action: 'buy',
          symbol,
          quantity,
          orderType: 'market',
        }) + '\n\n🚀 Momentum strategie: Kopen van stijgende aandelen';
      },
      
      'value': async () => {
        // Find undervalued stocks
        const value = ['INGA', 'RDSA', 'UNA'];
        const symbol = value[Math.floor(Math.random() * value.length)];
        const quantity = Math.floor(Math.random() * 50) + 20;
        
        return await this.executeOrder({
          action: 'buy',
          symbol,
          quantity,
          orderType: 'limit',
          limitPrice: this.stocks[symbol as keyof typeof this.stocks].price * 0.98,
        }) + '\n\n💎 Value strategie: Kopen van ondergewaardeerde aandelen';
      },
      
      'daytrading': async () => {
        // Quick in and out trades
        const volatile = ['TSLA', 'NVDA', 'ADYEN'];
        const symbol = volatile[Math.floor(Math.random() * volatile.length)];
        const action = Math.random() > 0.5 ? 'buy' : 'sell';
        const quantity = Math.floor(Math.random() * 20) + 10;
        
        if (action === 'sell' && !this.portfolio.has(symbol)) {
          return '⚠️ Geen positie in ' + symbol + ' om te verkopen. Probeer een andere strategie.';
        }
        
        return await this.executeOrder({
          action: action as 'buy' | 'sell',
          symbol,
          quantity,
          orderType: 'market',
        }) + '\n\n⚡ Day trading strategie: Snelle trades op volatiliteit';
      },
    };
    
    const executor = strategies[strategy] || strategies['momentum'];
    return await executor();
  }

  async getRecommendations(): Promise<string> {
    const recommendations = [
      { symbol: 'ASML', action: 'BUY', target: 680, reason: 'Sterke chip sector groei' },
      { symbol: 'ADYEN', action: 'HOLD', target: 1300, reason: 'Afwachten Q4 resultaten' },
      { symbol: 'NVDA', action: 'BUY', target: 520, reason: 'AI boom continues' },
      { symbol: 'TSLA', action: 'SELL', target: 220, reason: 'Toenemende competitie' },
      { symbol: 'INGA', action: 'BUY', target: 14, reason: 'Ondergewaardeerd, hoge dividend' },
    ];
    
    let response = '🎯 **AI TRADING AANBEVELINGEN**\n\n';
    
    for (const rec of recommendations.slice(0, 3)) {
      const emoji = rec.action === 'BUY' ? '🟢' : rec.action === 'SELL' ? '🔴' : '🟡';
      response += `${emoji} **${rec.symbol}** - ${rec.action}\n`;
      response += `• Target: €${rec.target}\n`;
      response += `• Reden: ${rec.reason}\n\n`;
    }
    
    response += '⚠️ *Dit zijn demo aanbevelingen voor illustratieve doeleinden*';
    
    return response;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}