import { z } from 'zod';

interface Device {
  id: string;
  name: string;
  type: string;
  room: string;
  status: 'on' | 'off' | 'active' | 'idle';
  value?: number;
  unit?: string;
  brand: string;
  connected: boolean;
}

interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  enabled: boolean;
  lastTriggered?: Date;
}

interface EnergyData {
  device: string;
  consumption: number;
  cost: number;
  trend: 'up' | 'down' | 'stable';
}

export class DemoSmartHomeTool {
  private devices: Map<string, Device> = new Map();
  private automations: Map<string, Automation> = new Map();
  private scenes: Map<string, any> = new Map();
  
  constructor() {
    this.initializeDevices();
    this.initializeAutomations();
    this.initializeScenes();
  }

  private initializeDevices() {
    const defaultDevices: Device[] = [
      // Verlichting
      { id: 'light-1', name: 'Woonkamer Plafond', type: 'light', room: 'Woonkamer', status: 'on', value: 75, unit: '%', brand: 'Philips Hue', connected: true },
      { id: 'light-2', name: 'Slaapkamer Lamp', type: 'light', room: 'Slaapkamer', status: 'off', value: 0, unit: '%', brand: 'Philips Hue', connected: true },
      { id: 'light-3', name: 'Keuken Spots', type: 'light', room: 'Keuken', status: 'on', value: 100, unit: '%', brand: 'IKEA Tradfri', connected: true },
      { id: 'light-4', name: 'Badkamer', type: 'light', room: 'Badkamer', status: 'off', value: 0, unit: '%', brand: 'Philips Hue', connected: true },
      
      // Thermostaat
      { id: 'thermo-1', name: 'Nest Thermostaat', type: 'thermostat', room: 'Hal', status: 'active', value: 21, unit: '°C', brand: 'Google Nest', connected: true },
      
      // Sloten
      { id: 'lock-1', name: 'Voordeur Slot', type: 'lock', room: 'Hal', status: 'on', brand: 'Yale', connected: true },
      { id: 'lock-2', name: 'Achterdeur Slot', type: 'lock', room: 'Keuken', status: 'on', brand: 'Yale', connected: true },
      
      // Camera's
      { id: 'cam-1', name: 'Voordeur Camera', type: 'camera', room: 'Buiten', status: 'active', brand: 'Ring', connected: true },
      { id: 'cam-2', name: 'Achtertuin Camera', type: 'camera', room: 'Buiten', status: 'active', brand: 'Arlo', connected: true },
      
      // Speakers
      { id: 'speaker-1', name: 'Sonos Woonkamer', type: 'speaker', room: 'Woonkamer', status: 'idle', value: 30, unit: '%', brand: 'Sonos', connected: true },
      { id: 'speaker-2', name: 'Google Home', type: 'speaker', room: 'Keuken', status: 'idle', value: 40, unit: '%', brand: 'Google', connected: true },
      
      // Sensoren
      { id: 'sensor-1', name: 'Bewegingssensor Hal', type: 'motion', room: 'Hal', status: 'idle', brand: 'Philips Hue', connected: true },
      { id: 'sensor-2', name: 'Raam Sensor Woonkamer', type: 'window', room: 'Woonkamer', status: 'off', brand: 'Aqara', connected: true },
      { id: 'sensor-3', name: 'Rookmelder', type: 'smoke', room: 'Hal', status: 'idle', brand: 'Nest Protect', connected: true },
      
      // Apparaten
      { id: 'tv-1', name: 'Samsung TV', type: 'tv', room: 'Woonkamer', status: 'off', brand: 'Samsung', connected: true },
      { id: 'blinds-1', name: 'Elektrische Gordijnen', type: 'blinds', room: 'Woonkamer', status: 'off', value: 50, unit: '%', brand: 'Somfy', connected: true },
      { id: 'vacuum-1', name: 'Roomba', type: 'vacuum', room: 'Woonkamer', status: 'idle', brand: 'iRobot', connected: true },
    ];
    
    defaultDevices.forEach(device => {
      this.devices.set(device.id, device);
    });
  }

  private initializeAutomations() {
    const defaultAutomations: Automation[] = [
      {
        id: 'auto-1',
        name: 'Goede Morgen',
        trigger: '07:00',
        actions: ['Lichten aan', 'Thermostaat naar 21°C', 'Nieuws afspelen'],
        enabled: true,
      },
      {
        id: 'auto-2',
        name: 'Welkom Thuis',
        trigger: 'Voordeur ontgrendeld',
        actions: ['Hal licht aan', 'Woonkamer licht aan', 'Thermostaat naar comfort'],
        enabled: true,
      },
      {
        id: 'auto-3',
        name: 'Slaaptijd',
        trigger: '23:00',
        actions: ['Alle lichten uit', 'Deuren vergrendelen', 'Thermostaat naar 18°C'],
        enabled: true,
      },
      {
        id: 'auto-4',
        name: 'Beweging Gedetecteerd',
        trigger: 'Bewegingssensor actief',
        actions: ['Camera opnemen', 'Notificatie sturen', 'Buitenlicht aan'],
        enabled: false,
      },
    ];
    
    defaultAutomations.forEach(auto => {
      this.automations.set(auto.id, auto);
    });
  }

  private initializeScenes() {
    this.scenes.set('movie', {
      name: 'Film Kijken',
      devices: [
        { id: 'light-1', value: 10 },
        { id: 'tv-1', status: 'on' },
        { id: 'blinds-1', value: 0 },
      ],
    });
    
    this.scenes.set('dinner', {
      name: 'Diner',
      devices: [
        { id: 'light-1', value: 60 },
        { id: 'light-3', value: 80 },
        { id: 'speaker-1', status: 'on', value: 20 },
      ],
    });
    
    this.scenes.set('away', {
      name: 'Afwezig',
      devices: [
        { id: 'lock-1', status: 'on' },
        { id: 'lock-2', status: 'on' },
        { id: 'cam-1', status: 'active' },
        { id: 'cam-2', status: 'active' },
        { id: 'thermo-1', value: 16 },
      ],
    });
  }

  async controlDevice(params: {
    deviceId?: string;
    deviceName?: string;
    action: 'on' | 'off' | 'set' | 'toggle';
    value?: number;
  }): Promise<string> {
    const { deviceId, deviceName, action, value } = params;
    
    // Find device by ID or name
    let device: Device | undefined;
    if (deviceId) {
      device = this.devices.get(deviceId);
    } else if (deviceName) {
      device = Array.from(this.devices.values()).find(d => 
        d.name.toLowerCase().includes(deviceName.toLowerCase())
      );
    }
    
    if (!device) {
      return `❌ Apparaat niet gevonden. Gebruik 'list_devices' om beschikbare apparaten te zien.`;
    }
    
    // Simulate action delay
    await this.delay(500);
    
    // Execute action
    let previousState = device.status;
    let previousValue = device.value;
    
    switch (action) {
      case 'on':
        device.status = 'on';
        if (device.type === 'light' && !device.value) {
          device.value = 100;
        }
        break;
      case 'off':
        device.status = 'off';
        if (device.type === 'light') {
          device.value = 0;
        }
        break;
      case 'toggle':
        device.status = device.status === 'on' ? 'off' : 'on';
        if (device.type === 'light') {
          device.value = device.status === 'on' ? 100 : 0;
        }
        break;
      case 'set':
        if (value !== undefined) {
          device.value = value;
          device.status = value > 0 ? 'on' : 'off';
        }
        break;
    }
    
    const emoji = device.status === 'on' ? '🟢' : '🔴';
    
    return `
${emoji} **APPARAAT BESTURING**
──────────────────
**Apparaat**: ${device.name}
**Type**: ${device.type}
**Locatie**: ${device.room}
**Actie**: ${action}
${device.value !== undefined ? `**Waarde**: ${device.value}${device.unit || ''}` : ''}

📊 **Status Update**:
• Vorige status: ${previousState}
${previousValue !== undefined ? `• Vorige waarde: ${previousValue}${device.unit || ''}` : ''}
• Nieuwe status: ${device.status}
${device.value !== undefined ? `• Nieuwe waarde: ${device.value}${device.unit || ''}` : ''}

✅ Commando succesvol uitgevoerd
⏰ ${new Date().toLocaleTimeString('nl-NL')}
`;
  }

  async listDevices(room?: string): Promise<string> {
    const devices = room 
      ? Array.from(this.devices.values()).filter(d => d.room.toLowerCase() === room.toLowerCase())
      : Array.from(this.devices.values());
    
    if (devices.length === 0) {
      return `❌ Geen apparaten gevonden${room ? ` in ${room}` : ''}.`;
    }
    
    let response = `🏠 **SMART HOME APPARATEN**\n`;
    if (room) {
      response += `📍 Locatie: ${room}\n`;
    }
    response += '\n';
    
    // Group by room if not filtered
    const grouped = new Map<string, Device[]>();
    devices.forEach(device => {
      if (!grouped.has(device.room)) {
        grouped.set(device.room, []);
      }
      grouped.get(device.room)!.push(device);
    });
    
    for (const [roomName, roomDevices] of grouped) {
      response += `**${roomName}**\n`;
      
      for (const device of roomDevices) {
        const statusEmoji = device.status === 'on' || device.status === 'active' ? '🟢' : '🔴';
        const connectionEmoji = device.connected ? '📶' : '⚠️';
        
        response += `${statusEmoji} ${device.name}\n`;
        response += `  • Type: ${device.type}\n`;
        response += `  • Merk: ${device.brand}\n`;
        if (device.value !== undefined) {
          response += `  • Waarde: ${device.value}${device.unit || ''}\n`;
        }
        response += `  • Status: ${device.status} ${connectionEmoji}\n`;
        response += `  • ID: ${device.id}\n\n`;
      }
    }
    
    response += `\n📊 Totaal: ${devices.length} apparaten`;
    
    return response;
  }

  async activateScene(sceneName: string): Promise<string> {
    const scene = Array.from(this.scenes.entries()).find(([key, s]) => 
      key === sceneName || s.name.toLowerCase().includes(sceneName.toLowerCase())
    );
    
    if (!scene) {
      return `❌ Scene '${sceneName}' niet gevonden. Beschikbare scenes: ${Array.from(this.scenes.values()).map(s => s.name).join(', ')}`;
    }
    
    const [sceneKey, sceneData] = scene;
    
    // Apply scene settings
    let changedDevices = [];
    for (const setting of sceneData.devices) {
      const device = this.devices.get(setting.id);
      if (device) {
        if (setting.status !== undefined) {
          device.status = setting.status;
        }
        if (setting.value !== undefined) {
          device.value = setting.value;
        }
        changedDevices.push(device.name);
      }
    }
    
    await this.delay(1000);
    
    return `
🎬 **SCENE GEACTIVEERD**
──────────────────
**Scene**: ${sceneData.name}
**Apparaten aangepast**: ${changedDevices.length}

📋 **Uitgevoerde acties**:
${changedDevices.map(d => `• ${d}`).join('\n')}

✨ Scene succesvol geactiveerd!
⏰ ${new Date().toLocaleTimeString('nl-NL')}

💡 Tip: Gebruik 'deactivate_scene' om terug te keren naar normale instellingen.
`;
  }

  async getEnergyUsage(): Promise<string> {
    // Simulate energy data
    const energyData: EnergyData[] = [];
    let totalConsumption = 0;
    let totalCost = 0;
    
    for (const device of this.devices.values()) {
      if (device.status === 'on' || device.status === 'active') {
        const consumption = this.getDeviceConsumption(device);
        const cost = consumption * 0.25; // €0.25 per kWh
        
        energyData.push({
          device: device.name,
          consumption,
          cost,
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
        });
        
        totalConsumption += consumption;
        totalCost += cost;
      }
    }
    
    let response = `⚡ **ENERGIE VERBRUIK**\n\n`;
    response += `📅 ${new Date().toLocaleDateString('nl-NL')}\n`;
    response += `⏰ ${new Date().toLocaleTimeString('nl-NL')}\n\n`;
    
    response += `**Huidige Verbruik**: ${totalConsumption.toFixed(2)} kWh\n`;
    response += `**Geschatte Kosten**: €${totalCost.toFixed(2)} per uur\n\n`;
    
    response += `**Per Apparaat**:\n`;
    
    for (const data of energyData.sort((a, b) => b.consumption - a.consumption).slice(0, 5)) {
      const trendEmoji = data.trend === 'up' ? '📈' : data.trend === 'down' ? '📉' : '➡️';
      response += `• ${data.device}: ${data.consumption.toFixed(3)} kWh ${trendEmoji}\n`;
    }
    
    response += `\n**💡 Besparingstips**:\n`;
    
    if (totalConsumption > 2) {
      response += `• ⚠️ Hoog verbruik gedetecteerd!\n`;
      response += `• Overweeg om enkele apparaten uit te schakelen\n`;
    }
    
    const lightsOn = Array.from(this.devices.values()).filter(d => d.type === 'light' && d.status === 'on').length;
    if (lightsOn > 3) {
      response += `• ${lightsOn} lampen staan aan - schakel onnodige verlichting uit\n`;
    }
    
    const thermostat = this.devices.get('thermo-1');
    if (thermostat && thermostat.value && thermostat.value > 21) {
      response += `• Thermostaat staat op ${thermostat.value}°C - 1°C lager bespaart 7% energie\n`;
    }
    
    response += `\n📊 **Maandelijkse projectie**: €${(totalCost * 24 * 30).toFixed(2)}`;
    
    return response;
  }

  async createAutomation(params: {
    name: string;
    trigger: string;
    actions: string[];
  }): Promise<string> {
    const automationId = `auto-${Date.now()}`;
    
    const automation: Automation = {
      id: automationId,
      name: params.name,
      trigger: params.trigger,
      actions: params.actions,
      enabled: true,
      lastTriggered: undefined,
    };
    
    this.automations.set(automationId, automation);
    
    return `
🤖 **AUTOMATISERING AANGEMAAKT**
──────────────────────────────
**Naam**: ${params.name}
**ID**: ${automationId}
**Trigger**: ${params.trigger}
**Status**: ✅ Ingeschakeld

📋 **Acties** (${params.actions.length}):
${params.actions.map(a => `• ${a}`).join('\n')}

⚙️ De automatisering is nu actief en zal uitgevoerd worden wanneer de trigger conditie wordt vervuld.

💡 Gebruik 'toggle_automation ${automationId}' om in/uit te schakelen.
`;
  }

  async getSecurityStatus(): Promise<string> {
    const locks = Array.from(this.devices.values()).filter(d => d.type === 'lock');
    const cameras = Array.from(this.devices.values()).filter(d => d.type === 'camera');
    const sensors = Array.from(this.devices.values()).filter(d => 
      d.type === 'motion' || d.type === 'window' || d.type === 'smoke'
    );
    
    const allLocked = locks.every(l => l.status === 'on');
    const camerasActive = cameras.filter(c => c.status === 'active').length;
    const sensorsActive = sensors.filter(s => s.status === 'active' || s.status === 'on').length;
    
    const securityLevel = allLocked && camerasActive === cameras.length ? 'HOOG' : 
                          allLocked ? 'NORMAAL' : 'LAAG';
    
    const levelEmoji = securityLevel === 'HOOG' ? '🟢' : 
                       securityLevel === 'NORMAAL' ? '🟡' : '🔴';
    
    let response = `🔒 **BEVEILIGINGSSTATUS**\n\n`;
    response += `${levelEmoji} Beveiligingsniveau: **${securityLevel}**\n\n`;
    
    response += `**🔐 Sloten** (${locks.length}):\n`;
    for (const lock of locks) {
      const emoji = lock.status === 'on' ? '✅' : '❌';
      response += `${emoji} ${lock.name}: ${lock.status === 'on' ? 'Vergrendeld' : 'Ontgrendeld'}\n`;
    }
    
    response += `\n**📹 Camera's** (${cameras.length}):\n`;
    for (const camera of cameras) {
      const emoji = camera.status === 'active' ? '🔴' : '⚫';
      response += `${emoji} ${camera.name}: ${camera.status === 'active' ? 'Opnemen' : 'Stand-by'}\n`;
    }
    
    response += `\n**🚨 Sensoren** (${sensors.length}):\n`;
    for (const sensor of sensors) {
      const emoji = sensor.status === 'idle' ? '✅' : '⚠️';
      response += `${emoji} ${sensor.name}: ${sensor.status}\n`;
    }
    
    // Recent events (simulated)
    response += `\n**📅 Recente Gebeurtenissen**:\n`;
    response += `• 15:32 - Voordeur ontgrendeld (sleutel)\n`;
    response += `• 14:15 - Beweging gedetecteerd (achtertuin)\n`;
    response += `• 09:00 - Alarm uitgeschakeld\n`;
    
    if (securityLevel !== 'HOOG') {
      response += `\n⚠️ **Aanbevelingen**:\n`;
      if (!allLocked) {
        response += `• Vergrendel alle deuren voor optimale beveiliging\n`;
      }
      if (camerasActive < cameras.length) {
        response += `• Activeer alle camera's voor complete dekking\n`;
      }
    }
    
    return response;
  }

  async getRoomStatus(room: string): Promise<string> {
    const devices = Array.from(this.devices.values()).filter(d => 
      d.room.toLowerCase() === room.toLowerCase()
    );
    
    if (devices.length === 0) {
      return `❌ Kamer '${room}' niet gevonden of heeft geen apparaten.`;
    }
    
    const activeDevices = devices.filter(d => d.status === 'on' || d.status === 'active');
    const temperature = devices.find(d => d.type === 'thermostat')?.value;
    const lightLevel = devices.filter(d => d.type === 'light' && d.status === 'on')
      .reduce((sum, d) => sum + (d.value || 0), 0) / devices.filter(d => d.type === 'light').length;
    
    let response = `🏠 **${room.toUpperCase()} STATUS**\n\n`;
    
    response += `📊 **Overzicht**:\n`;
    response += `• Apparaten: ${devices.length} totaal, ${activeDevices.length} actief\n`;
    if (temperature) {
      response += `• Temperatuur: ${temperature}°C\n`;
    }
    if (!isNaN(lightLevel)) {
      response += `• Verlichting: ${lightLevel.toFixed(0)}%\n`;
    }
    
    response += `\n**Actieve Apparaten**:\n`;
    for (const device of activeDevices) {
      response += `• ${device.name}`;
      if (device.value !== undefined) {
        response += ` (${device.value}${device.unit || ''})`;
      }
      response += '\n';
    }
    
    return response;
  }

  private getDeviceConsumption(device: Device): number {
    const consumptionMap: Record<string, number> = {
      'light': 0.01 * (device.value || 100) / 100,
      'thermostat': 2.5,
      'tv': 0.15,
      'speaker': 0.02,
      'camera': 0.005,
      'vacuum': 0.05,
    };
    
    return consumptionMap[device.type] || 0.01;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}