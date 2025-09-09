import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Step 8: Core Business
export const Step8CoreBusiness = ({ formData, setFormData }: any) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">
      Wat is jullie core business?
    </h2>
    
    <div className="space-y-6">
      <div>
        <Label htmlFor="sector" className="text-lg font-bold text-white">In welke sector opereren jullie?</Label>
        <Select value={formData.industry} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, industry: value }))}>
          <SelectTrigger className="bg-white/5 border-white/20 text-white mt-2">
            <SelectValue placeholder="Selecteer sector..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="retail">Retail/E-commerce</SelectItem>
            <SelectItem value="logistics">Logistiek/Transport</SelectItem>
            <SelectItem value="healthcare">Zorg/Healthcare</SelectItem>
            <SelectItem value="financial">Finance/Banking</SelectItem>
            <SelectItem value="technology">Technology/Software</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="consulting">Consulting/Advies</SelectItem>
            <SelectItem value="education">Education/Training</SelectItem>
            <SelectItem value="government">Government/Public</SelectItem>
            <SelectItem value="construction">Bouw/Construction</SelectItem>
            <SelectItem value="other">Anders</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="businessDesc" className="text-lg font-bold text-white">
          Omschrijf in één zin wat jullie doen
        </Label>
        <p className="text-white/60 text-sm mb-2">Voorbeeld: &quot;We leveren IT hardware aan MKB bedrijven&quot;</p>
        <Input
          id="businessDesc"
          value={formData.businessDescription}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, businessDescription: e.target.value }))}
          className="bg-white/5 border-white/20 text-white"
          placeholder="We zijn een [type bedrijf] die [wat jullie doen] voor [doelgroep]"
        />
      </div>
    </div>
  </div>
);

// Step 9: Customer Interactions
export const Step9CustomerInteractions = ({ formData, setFormData }: any) => {
  const interactionTypes = [
    'Verkoop producten/diensten',
    'Klantenservice/support',
    'Advies/consultancy',
    'Projecten/maatwerk',
    'Subscription/SaaS',
    'Training/education',
    'Anders'
  ];

  const handleInteractionToggle = (interaction: string, checked: boolean) => {
    if (checked) {
      setFormData((prev: any) => ({
        ...prev,
        customerInteractions: [...prev.customerInteractions, interaction]
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        customerInteractions: prev.customerInteractions.filter((i: string) => i !== interaction)
      }));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">
        Wat zijn jullie belangrijkste klantinteracties?
      </h2>
      <p className="text-white/70 mb-6">Selecteer alle die van toepassing zijn</p>
      
      <div className="space-y-4">
        {interactionTypes.map((interaction) => (
          <div key={interaction} className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={interaction}
              checked={formData.customerInteractions.includes(interaction)}
              onChange={(e) => handleInteractionToggle(interaction, e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5"
              style={{ accentColor: '#F87315' }}
            />
            <Label htmlFor={interaction} className="text-white/80 text-sm cursor-pointer">
              {interaction}
            </Label>
          </div>
        ))}
      </div>

      {formData.customerInteractions.includes('Anders') && (
        <div className="mt-4">
          <Input
            placeholder="Andere klantinteracties..."
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
      )}
    </div>
  );
};

// Step 10: Customer Channels
export const Step10CustomerChannels = ({ formData, setFormData }: any) => {
  const channels = [
    'Website/webshop',
    'Email',
    'Telefoon', 
    'WhatsApp/chat',
    'Face-to-face',
    'Via partners',
    'API/integraties',
    'Mobile app',
    'Social media'
  ];

  const handleChannelToggle = (channel: string, checked: boolean) => {
    if (checked) {
      setFormData((prev: any) => ({
        ...prev,
        customerChannels: [...prev.customerChannels, channel]
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        customerChannels: prev.customerChannels.filter((c: string) => c !== channel)
      }));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">
        Hoe interacteren klanten met jullie?
      </h2>
      <p className="text-white/70 mb-6">Selecteer alle kanalen die jullie gebruiken</p>
      
      <div className="grid md:grid-cols-2 gap-4">
        {channels.map((channel) => (
          <div key={channel} className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={channel}
              checked={formData.customerChannels.includes(channel)}
              onChange={(e) => handleChannelToggle(channel, e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5"
              style={{ accentColor: '#F87315' }}
            />
            <Label htmlFor={channel} className="text-white/80 text-sm cursor-pointer">
              {channel}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};