import { z } from 'zod';

interface Flight {
  id: string;
  airline: string;
  from: string;
  to: string;
  departure: Date;
  arrival: Date;
  price: number;
  class: 'economy' | 'business' | 'first';
  duration: string;
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  pricePerNight: number;
  amenities: string[];
  roomType: string;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  location: string;
  price: number;
  duration: string;
  rating: number;
  category: string;
}

export class DemoTravelPlannerTool {
  private bookings: any[] = [];
  private savedTrips: Map<string, any> = new Map();
  
  // Mock data
  private destinations = {
    'Amsterdam': { country: 'Nederland', timezone: 'CET', currency: 'EUR' },
    'Parijs': { country: 'Frankrijk', timezone: 'CET', currency: 'EUR' },
    'Londen': { country: 'Verenigd Koninkrijk', timezone: 'GMT', currency: 'GBP' },
    'New York': { country: 'Verenigde Staten', timezone: 'EST', currency: 'USD' },
    'Barcelona': { country: 'Spanje', timezone: 'CET', currency: 'EUR' },
    'Rome': { country: 'Italië', timezone: 'CET', currency: 'EUR' },
    'Tokyo': { country: 'Japan', timezone: 'JST', currency: 'JPY' },
    'Dubai': { country: 'VAE', timezone: 'GST', currency: 'AED' },
  };
  
  private airlines = ['KLM', 'Air France', 'Lufthansa', 'British Airways', 'Emirates', 'Ryanair', 'EasyJet'];
  
  private hotelChains = [
    { name: 'Hilton', rating: 4.5 },
    { name: 'Marriott', rating: 4.4 },
    { name: 'NH Hotels', rating: 4.2 },
    { name: 'Accor', rating: 4.3 },
    { name: 'InterContinental', rating: 4.6 },
    { name: 'Radisson', rating: 4.1 },
  ];

  async searchFlights(params: {
    from: string;
    to: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
    class?: 'economy' | 'business' | 'first';
  }): Promise<string> {
    const { from, to, departureDate, returnDate, passengers, class: flightClass = 'economy' } = params;
    
    // Generate mock flights
    const flights: Flight[] = [];
    const basePrice = this.calculateBasePrice(from, to);
    
    for (let i = 0; i < 5; i++) {
      const airline = this.airlines[Math.floor(Math.random() * this.airlines.length)];
      const departure = new Date(departureDate);
      departure.setHours(6 + i * 3, Math.floor(Math.random() * 60));
      
      const duration = this.calculateFlightDuration(from, to);
      const arrival = new Date(departure.getTime() + duration * 60 * 60 * 1000);
      
      const priceMultiplier = flightClass === 'business' ? 3 : flightClass === 'first' ? 5 : 1;
      const price = (basePrice + Math.random() * 200 - 100) * priceMultiplier * passengers;
      
      flights.push({
        id: `FL-${Date.now()}-${i}`,
        airline,
        from,
        to,
        departure,
        arrival,
        price,
        class: flightClass,
        duration: `${duration}u ${Math.floor(Math.random() * 60)}m`,
      });
    }
    
    let response = `✈️ **VLUCHT ZOEKRESULTATEN**\n\n`;
    response += `🛫 ${from} → ${to}\n`;
    response += `📅 ${departureDate}\n`;
    response += `👥 ${passengers} passagier(s), ${flightClass}\n\n`;
    
    response += '**Beschikbare vluchten:**\n';
    
    for (const flight of flights) {
      const emoji = flight.price < basePrice ? '💚' : flight.price < basePrice * 1.2 ? '🟡' : '🔴';
      
      response += `\n${emoji} **${flight.airline}**\n`;
      response += `• Vertrek: ${flight.departure.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}\n`;
      response += `• Aankomst: ${flight.arrival.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}\n`;
      response += `• Duur: ${flight.duration}\n`;
      response += `• Prijs: €${flight.price.toFixed(2)}\n`;
      response += `• ID: ${flight.id}\n`;
    }
    
    if (returnDate) {
      response += `\n📅 Retourvlucht: ${returnDate}\n`;
      response += `*Gebruik 'book_flight' met return datum voor retourprijzen*\n`;
    }
    
    response += `\n💡 Tip: Boek nu voor de beste prijzen!`;
    
    return response;
  }

  async searchHotels(params: {
    location: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    minRating?: number;
    maxPrice?: number;
  }): Promise<string> {
    const { location, checkIn, checkOut, guests, minRating = 3, maxPrice = 500 } = params;
    
    // Calculate nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate mock hotels
    const hotels: Hotel[] = [];
    
    for (const chain of this.hotelChains) {
      if (chain.rating < minRating) continue;
      
      const basePrice = 80 + Math.random() * 200;
      if (basePrice > maxPrice) continue;
      
      hotels.push({
        id: `HTL-${Date.now()}-${hotels.length}`,
        name: `${chain.name} ${location}`,
        location: `${location} Centrum`,
        rating: chain.rating,
        pricePerNight: basePrice,
        amenities: this.getRandomAmenities(),
        roomType: guests > 2 ? 'Family Suite' : 'Double Room',
      });
    }
    
    let response = `🏨 **HOTEL ZOEKRESULTATEN**\n\n`;
    response += `📍 ${location}\n`;
    response += `📅 ${checkIn} - ${checkOut} (${nights} nachten)\n`;
    response += `👥 ${guests} gast(en)\n\n`;
    
    for (const hotel of hotels) {
      const totalPrice = hotel.pricePerNight * nights;
      const stars = '⭐'.repeat(Math.floor(hotel.rating));
      
      response += `**${hotel.name}** ${stars}\n`;
      response += `• Locatie: ${hotel.location}\n`;
      response += `• Kamertype: ${hotel.roomType}\n`;
      response += `• Prijs per nacht: €${hotel.pricePerNight.toFixed(2)}\n`;
      response += `• Totaal (${nights} nachten): €${totalPrice.toFixed(2)}\n`;
      response += `• Faciliteiten: ${hotel.amenities.slice(0, 3).join(', ')}\n`;
      response += `• ID: ${hotel.id}\n\n`;
    }
    
    response += `🔥 ${hotels.length} hotels gevonden die aan je criteria voldoen`;
    
    return response;
  }

  async planItinerary(params: {
    destination: string;
    days: number;
    interests: string[];
    budget: 'budget' | 'moderate' | 'luxury';
  }): Promise<string> {
    const { destination, days, interests, budget } = params;
    
    const activities = this.generateActivities(destination, interests, budget);
    const dailyBudget = budget === 'luxury' ? 500 : budget === 'moderate' ? 200 : 100;
    
    let response = `🗺️ **${days}-DAAGSE REIS NAAR ${destination.toUpperCase()}**\n\n`;
    response += `💰 Budget niveau: ${budget}\n`;
    response += `🎯 Interesses: ${interests.join(', ')}\n\n`;
    
    for (let day = 1; day <= days; day++) {
      response += `📅 **DAG ${day}**\n`;
      
      // Morning activity
      const morning = activities[Math.floor(Math.random() * activities.length)];
      response += `🌅 **Ochtend** (09:00 - 12:00)\n`;
      response += `• ${morning.name}\n`;
      response += `  ${morning.description}\n`;
      response += `  💰 €${morning.price.toFixed(2)}\n\n`;
      
      // Lunch recommendation
      response += `🍽️ **Lunch** (12:30 - 14:00)\n`;
      response += `• ${this.getRestaurantRecommendation(destination, budget)}\n\n`;
      
      // Afternoon activity
      const afternoon = activities[Math.floor(Math.random() * activities.length)];
      response += `☀️ **Middag** (14:30 - 17:30)\n`;
      response += `• ${afternoon.name}\n`;
      response += `  ${afternoon.description}\n`;
      response += `  💰 €${afternoon.price.toFixed(2)}\n\n`;
      
      // Evening
      response += `🌙 **Avond** (19:00 - 22:00)\n`;
      response += `• ${this.getEveningActivity(destination, budget)}\n\n`;
      
      response += `──────────────\n`;
      response += `Dagbudget: €${dailyBudget}\n`;
      response += `Geschatte kosten: €${(morning.price + afternoon.price + dailyBudget * 0.6).toFixed(2)}\n\n`;
    }
    
    response += `📊 **TOTAAL OVERZICHT**\n`;
    response += `• Geschatte totale kosten: €${(dailyBudget * days).toFixed(2)}\n`;
    response += `• Exclusief vluchten en accommodatie\n`;
    response += `• Inclusief activiteiten, eten en transport\n\n`;
    
    response += `💡 *Dit is een AI-gegenereerd reisplan. Pas het aan naar je wensen!*`;
    
    return response;
  }

  async bookComplete(params: {
    destination: string;
    from: string;
    departureDate: string;
    returnDate: string;
    travelers: number;
    hotelClass: 'budget' | 'moderate' | 'luxury';
  }): Promise<string> {
    const { destination, from, departureDate, returnDate, travelers, hotelClass } = params;
    
    // Calculate trip details
    const nights = Math.ceil((new Date(returnDate).getTime() - new Date(departureDate).getTime()) / (1000 * 60 * 60 * 24));
    const flightPrice = this.calculateBasePrice(from, destination) * travelers * 2; // Return flight
    const hotelPrice = (hotelClass === 'luxury' ? 250 : hotelClass === 'moderate' ? 150 : 80) * nights;
    const activitiesPrice = 100 * nights * travelers;
    const totalPrice = flightPrice + hotelPrice + activitiesPrice;
    
    // Create booking
    const bookingId = `BKG-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    const booking = {
      id: bookingId,
      destination,
      from,
      departureDate,
      returnDate,
      travelers,
      nights,
      hotelClass,
      prices: {
        flights: flightPrice,
        hotel: hotelPrice,
        activities: activitiesPrice,
        total: totalPrice,
      },
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    
    this.bookings.push(booking);
    
    // Simulate booking process
    await this.delay(2000);
    
    return `
✅ **COMPLETE REIS GEBOEKT!**
════════════════════════════

🎫 **Booking ID**: ${bookingId}

📍 **Reisdetails**:
• Bestemming: ${destination}
• Vertrek vanaf: ${from}
• Periode: ${departureDate} - ${returnDate}
• Duur: ${nights} nachten
• Reizigers: ${travelers} personen

✈️ **Vluchten**:
• Heenvlucht: ${from} → ${destination} op ${departureDate}
• Terugvlucht: ${destination} → ${from} op ${returnDate}
• Totaal: €${flightPrice.toFixed(2)}

🏨 **Accommodatie**:
• Hotel klasse: ${hotelClass}
• ${nights} nachten
• Totaal: €${hotelPrice.toFixed(2)}

🎭 **Activiteiten & Extras**:
• Basis activiteitenpakket inbegrepen
• Totaal: €${activitiesPrice.toFixed(2)}

💰 **TOTAAL BEDRAG**: €${totalPrice.toFixed(2)}

📧 **Bevestiging**:
• E-tickets worden binnen 24 uur gemaild
• Hotel vouchers bij check-in
• Activiteiten kunnen ter plaatse geboekt worden

✈️ **Check-in herinnering**:
We sturen je 24 uur voor vertrek een check-in herinnering!

🌟 Goede reis en geniet van ${destination}!
`;
  }

  async getWeather(destination: string, date?: string): Promise<string> {
    // Mock weather data
    const seasons = {
      'winter': { temp: 5, condition: 'Bewolkt', emoji: '☁️' },
      'spring': { temp: 15, condition: 'Zonnig', emoji: '☀️' },
      'summer': { temp: 25, condition: 'Zonnig', emoji: '☀️' },
      'autumn': { temp: 12, condition: 'Regenachtig', emoji: '🌧️' },
    };
    
    const month = date ? new Date(date).getMonth() : new Date().getMonth();
    const season = month < 3 ? 'winter' : month < 6 ? 'spring' : month < 9 ? 'summer' : 'autumn';
    const weather = seasons[season];
    
    // Add some randomness
    const temp = weather.temp + Math.floor(Math.random() * 10 - 5);
    
    let response = `🌡️ **WEER IN ${destination.toUpperCase()}**\n\n`;
    
    if (date) {
      response += `📅 Voorspelling voor ${date}\n\n`;
    } else {
      response += `📅 Huidige weer\n\n`;
    }
    
    response += `${weather.emoji} ${weather.condition}\n`;
    response += `🌡️ ${temp}°C\n`;
    response += `💨 Wind: ${Math.floor(Math.random() * 20 + 5)} km/u\n`;
    response += `💧 Luchtvochtigheid: ${Math.floor(Math.random() * 30 + 50)}%\n`;
    response += `👁️ Zicht: ${Math.floor(Math.random() * 5 + 5)} km\n\n`;
    
    // 5-day forecast
    response += `**5-daagse voorspelling:**\n`;
    for (let i = 1; i <= 5; i++) {
      const futureTemp = temp + Math.floor(Math.random() * 6 - 3);
      const conditions = ['☀️', '⛅', '☁️', '🌧️'];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      
      response += `${futureDate.toLocaleDateString('nl-NL', { weekday: 'short' })}: ${condition} ${futureTemp}°C\n`;
    }
    
    response += `\n💡 Tip: ${temp < 10 ? 'Neem warme kleding mee!' : temp > 20 ? 'Vergeet je zonnebrand niet!' : 'Perfect weer voor sightseeing!'}`;
    
    return response;
  }

  async getCurrencyExchange(from: string, to: string, amount: number): Promise<string> {
    // Mock exchange rates
    const rates: Record<string, number> = {
      'EUR-USD': 1.08,
      'EUR-GBP': 0.86,
      'EUR-JPY': 162.50,
      'EUR-AED': 3.97,
      'USD-EUR': 0.93,
      'GBP-EUR': 1.16,
    };
    
    const key = `${from}-${to}`;
    const reverseKey = `${to}-${from}`;
    
    let rate = rates[key] || (rates[reverseKey] ? 1 / rates[reverseKey] : 1);
    
    // Add small variation
    rate = rate * (1 + (Math.random() - 0.5) * 0.02);
    
    const converted = amount * rate;
    
    return `
💱 **VALUTA CALCULATOR**
──────────────────
**Van**: ${amount.toFixed(2)} ${from}
**Naar**: ${converted.toFixed(2)} ${to}

📊 **Wisselkoers**: 1 ${from} = ${rate.toFixed(4)} ${to}
📅 **Datum**: ${new Date().toLocaleDateString('nl-NL')}
⏰ **Tijd**: ${new Date().toLocaleTimeString('nl-NL')}

💳 **Tips**:
• Wissel op het vliegveld: +3-5% kosten
• Lokale bank/ATM: +1-2% kosten
• Creditcard: Check je bank voor kosten
• Wise/Revolut: Vaak beste koers

📈 Koers kan fluctueren. Dit is een indicatie.
`;
  }

  private calculateBasePrice(from: string, to: string): number {
    // Simple distance-based pricing
    const prices: Record<string, number> = {
      'Amsterdam-Parijs': 150,
      'Amsterdam-Londen': 120,
      'Amsterdam-Barcelona': 180,
      'Amsterdam-Rome': 200,
      'Amsterdam-New York': 450,
      'Amsterdam-Tokyo': 750,
      'Amsterdam-Dubai': 380,
    };
    
    const key = `${from}-${to}`;
    const reverseKey = `${to}-${from}`;
    
    return prices[key] || prices[reverseKey] || 250;
  }

  private calculateFlightDuration(from: string, to: string): number {
    const durations: Record<string, number> = {
      'Amsterdam-Parijs': 1.5,
      'Amsterdam-Londen': 1.25,
      'Amsterdam-Barcelona': 2.5,
      'Amsterdam-Rome': 2.75,
      'Amsterdam-New York': 8.5,
      'Amsterdam-Tokyo': 11.5,
      'Amsterdam-Dubai': 7,
    };
    
    const key = `${from}-${to}`;
    const reverseKey = `${to}-${from}`;
    
    return durations[key] || durations[reverseKey] || 3;
  }

  private getRandomAmenities(): string[] {
    const allAmenities = [
      'WiFi', 'Zwembad', 'Fitness', 'Spa', 'Restaurant', 
      'Bar', 'Room Service', 'Parking', 'Shuttle', 'Ontbijt'
    ];
    
    const count = Math.floor(Math.random() * 4) + 3;
    return allAmenities.sort(() => Math.random() - 0.5).slice(0, count);
  }

  private generateActivities(destination: string, interests: string[], budget: string): Activity[] {
    const activities: Activity[] = [
      {
        id: 'ACT-001',
        name: `${destination} Stadstour`,
        description: 'Ontdek de hoogtepunten met een lokale gids',
        location: destination,
        price: budget === 'luxury' ? 75 : budget === 'moderate' ? 45 : 25,
        duration: '3 uur',
        rating: 4.5,
        category: 'Tour',
      },
      {
        id: 'ACT-002',
        name: 'Museum Bezoek',
        description: 'Topmuseum met kunst en geschiedenis',
        location: destination,
        price: budget === 'luxury' ? 35 : budget === 'moderate' ? 25 : 15,
        duration: '2 uur',
        rating: 4.6,
        category: 'Cultuur',
      },
      {
        id: 'ACT-003',
        name: 'Food Tour',
        description: 'Proef lokale specialiteiten',
        location: destination,
        price: budget === 'luxury' ? 95 : budget === 'moderate' ? 55 : 35,
        duration: '4 uur',
        rating: 4.8,
        category: 'Eten',
      },
    ];
    
    return activities;
  }

  private getRestaurantRecommendation(destination: string, budget: string): string {
    const restaurants = {
      luxury: ['Michelin restaurant', 'Fine dining', 'Chef\'s table'],
      moderate: ['Lokaal favoriet', 'Trendy bistro', 'Gezellig restaurant'],
      budget: ['Street food markt', 'Lokale snackbar', 'Food court'],
    };
    
    const options = restaurants[budget as keyof typeof restaurants];
    return options[Math.floor(Math.random() * options.length)] + ` in ${destination}`;
  }

  private getEveningActivity(destination: string, budget: string): string {
    const activities = {
      luxury: ['Theater voorstelling', 'Concert in opera', 'Sunset cruise'],
      moderate: ['Lokale bar tour', 'Live muziek café', 'Avondmarkt'],
      budget: ['Wandeling oude stad', 'Gratis concert', 'Locals ontmoeten'],
    };
    
    const options = activities[budget as keyof typeof activities];
    return options[Math.floor(Math.random() * options.length)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}