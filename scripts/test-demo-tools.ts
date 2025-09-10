#!/usr/bin/env tsx

import chalk from 'chalk';
import { DemoStockTraderTool } from '../src/lib/agents/tools/demo-stock-trader';
import { DemoShoppingTool } from '../src/lib/agents/tools/demo-shopping';
import { DemoTravelPlannerTool } from '../src/lib/agents/tools/demo-travel-planner';
import { DemoSmartHomeTool } from '../src/lib/agents/tools/demo-smart-home';

async function testStockTrader() {
  console.log(chalk.cyan.bold('\n📈 Testing Stock Trader Tool\n'));
  console.log(chalk.gray('═══════════════════════════════════════\n'));
  
  const trader = new DemoStockTraderTool();
  
  // Test portfolio view
  console.log(chalk.yellow('Testing portfolio view...'));
  const portfolio = await trader.getPortfolio();
  console.log(portfolio.substring(0, 200) + '...\n');
  
  // Test market data
  console.log(chalk.yellow('Testing market data...'));
  const marketData = await trader.getMarketData(['ASML', 'NVDA', 'TSLA']);
  console.log(marketData.substring(0, 200) + '...\n');
  
  // Test order execution
  console.log(chalk.yellow('Testing order execution...'));
  const order = await trader.executeOrder({
    action: 'buy',
    symbol: 'ASML',
    quantity: 5,
    orderType: 'market'
  });
  console.log(order.substring(0, 200) + '...\n');
  
  console.log(chalk.green('✅ Stock Trader Tool working!\n'));
}

async function testShopping() {
  console.log(chalk.cyan.bold('\n🛒 Testing Shopping Tool\n'));
  console.log(chalk.gray('═══════════════════════════════════════\n'));
  
  const shopping = new DemoShoppingTool();
  
  // Test product search
  console.log(chalk.yellow('Testing product search...'));
  const products = await shopping.searchProducts('laptop');
  console.log(products.substring(0, 200) + '...\n');
  
  // Test add to cart
  console.log(chalk.yellow('Testing add to cart...'));
  const cartAdd = await shopping.addToCart('PROD-001', 1);
  console.log(cartAdd.substring(0, 200) + '...\n');
  
  // Test view cart
  console.log(chalk.yellow('Testing view cart...'));
  const cart = await shopping.viewCart();
  console.log(cart.substring(0, 200) + '...\n');
  
  console.log(chalk.green('✅ Shopping Tool working!\n'));
}

async function testTravelPlanner() {
  console.log(chalk.cyan.bold('\n✈️ Testing Travel Planner Tool\n'));
  console.log(chalk.gray('═══════════════════════════════════════\n'));
  
  const travel = new DemoTravelPlannerTool();
  
  // Test flight search
  console.log(chalk.yellow('Testing flight search...'));
  const flights = await travel.searchFlights({
    from: 'AMS',
    to: 'NYC',
    date: '2024-03-15',
    passengers: 2
  });
  console.log(flights.substring(0, 200) + '...\n');
  
  // Test hotel search
  console.log(chalk.yellow('Testing hotel search...'));
  const hotels = await travel.searchHotels({
    destination: 'New York',
    checkIn: '2024-03-15',
    checkOut: '2024-03-20',
    guests: 2
  });
  console.log(hotels.substring(0, 200) + '...\n');
  
  console.log(chalk.green('✅ Travel Planner Tool working!\n'));
}

async function testSmartHome() {
  console.log(chalk.cyan.bold('\n🏠 Testing Smart Home Tool\n'));
  console.log(chalk.gray('═══════════════════════════════════════\n'));
  
  const smartHome = new DemoSmartHomeTool();
  
  // Test device control
  console.log(chalk.yellow('Testing device control...'));
  const control = await smartHome.controlDevice('light-001', 'on');
  console.log(control.substring(0, 200) + '...\n');
  
  // Test scene setting
  console.log(chalk.yellow('Testing scene setting...'));
  const scene = await smartHome.activateScene('avond');
  console.log(scene.substring(0, 200) + '...\n');
  
  // Test status
  console.log(chalk.yellow('Testing status...'));
  const status = await smartHome.getRoomStatus('woonkamer');
  console.log(status.substring(0, 200) + '...\n');
  
  console.log(chalk.green('✅ Smart Home Tool working!\n'));
}

async function main() {
  console.log(chalk.magenta.bold('🚀 GroeimetAI Demo Tools Test Suite\n'));
  
  try {
    await testStockTrader();
    await testShopping();
    await testTravelPlanner();
    await testSmartHome();
    
    console.log(chalk.green.bold('✨ All demo tools tested successfully!\n'));
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('\n❌ Test failed:'), error);
    process.exit(1);
  }
}

main();