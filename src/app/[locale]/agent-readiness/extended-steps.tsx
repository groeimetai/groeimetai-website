// Extended Assessment Steps - 15 Questions for Substantial Report

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Step 6: Weekly Hours
export const Step6WeeklyHours = ({ formData, setFormData }: any) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">
      Hoeveel uur per week besteedt je team aan deze taken?
    </h2>
    
    <RadioGroup value={formData.weeklyHours} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, weeklyHours: value }))}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="<10" id="hours-low" />
          <Label htmlFor="hours-low" className="text-white/80">&lt; 10 uur per week</Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="10-40" id="hours-medium" />
          <Label htmlFor="hours-medium" className="text-white/80">10-40 uur per week</Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="40-100" id="hours-high" />
          <Label htmlFor="hours-high" className="text-white/80">40-100 uur per week</Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="100+" id="hours-extreme" />
          <Label htmlFor="hours-extreme" className="text-white/80">100+ uur per week</Label>
        </div>
      </div>
    </RadioGroup>
  </div>
);

// Step 7: Main Bottleneck
export const Step7MainBottleneck = ({ formData, setFormData }: any) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">
      Wat is je grootste operationele bottleneck?
    </h2>
    
    <RadioGroup value={formData.mainBottleneck} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, mainBottleneck: value }))}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="response-time" id="bottleneck-response" />
          <Label htmlFor="bottleneck-response" className="text-white/80">Response tijd naar klanten</Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="data-silos" id="bottleneck-silos" />
          <Label htmlFor="bottleneck-silos" className="text-white/80">Data in silo's</Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="manual-entry" id="bottleneck-manual" />
          <Label htmlFor="bottleneck-manual" className="text-white/80">Handmatige data entry</Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="coordination" id="bottleneck-coordination" />
          <Label htmlFor="bottleneck-coordination" className="text-white/80">Proces coördinatie</Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="other" id="bottleneck-other" />
          <Label htmlFor="bottleneck-other" className="text-white/80">Anders:</Label>
          {formData.mainBottleneck === 'other' && (
            <Input
              placeholder="Beschrijf je bottleneck..."
              className="bg-white/5 border-white/20 text-white ml-3"
            />
          )}
        </div>
      </div>
    </RadioGroup>
  </div>
);

// Step 10: Adoption Speed
export const Step10AdoptionSpeed = ({ formData, setFormData }: any) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">
      Hoe snel kan je organisatie nieuwe tech adopteren?
    </h2>
    
    <RadioGroup value={formData.adoptionSpeed} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, adoptionSpeed: value }))}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="very-fast" id="adoption-very-fast" />
          <Label htmlFor="adoption-very-fast" className="text-white/80">Zeer snel (weken)</Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="reasonable" id="adoption-reasonable" />
          <Label htmlFor="adoption-reasonable" className="text-white/80">Redelijk (maanden)</Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="slow" id="adoption-slow" />
          <Label htmlFor="adoption-slow" className="text-white/80">Traag (kwartalen)</Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="very-slow" id="adoption-very-slow" />
          <Label htmlFor="adoption-very-slow" className="text-white/80">Zeer traag (jaren)</Label>
        </div>
      </div>
    </RadioGroup>
  </div>
);

// Step 11: Decision Maker
export const Step11DecisionMaker = ({ formData, setFormData }: any) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">
      Wie moet akkoord geven voor dit soort projecten?
    </h2>
    
    <RadioGroup value={formData.decisionMaker} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, decisionMaker: value }))}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="self" id="decision-self" />
          <Label htmlFor="decision-self" className="text-white/80">Ik beslis zelf</Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="manager" id="decision-manager" />
          <Label htmlFor="decision-manager" className="text-white/80">Mijn manager</Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="c-level" id="decision-c-level" />
          <Label htmlFor="decision-c-level" className="text-white/80">C-level/directie</Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="board" id="decision-board" />
          <Label htmlFor="decision-board" className="text-white/80">Board/RvC</Label>
        </div>
      </div>
    </RadioGroup>
  </div>
);

// Step 14: Industry & Automation Level
export const Step14Context = ({ formData, setFormData }: any) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">
      Laatste context vragen
    </h2>
    
    <div className="space-y-8">
      <div>
        <Label htmlFor="industry" className="text-lg font-bold text-white">Industrie</Label>
        <Select value={formData.industry} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, industry: value }))}>
          <SelectTrigger className="bg-white/5 border-white/20 text-white">
            <SelectValue placeholder="Selecteer industrie..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technology">Technology/Software</SelectItem>
            <SelectItem value="financial">Financial Services</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="retail">Retail/E-commerce</SelectItem>
            <SelectItem value="consulting">Consulting</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="government">Government/Public</SelectItem>
            <SelectItem value="logistics">Logistics/Transport</SelectItem>
            <SelectItem value="other">Anders</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-lg font-bold text-white">Huidige automatisering niveau</Label>
        <RadioGroup value={formData.automationLevel} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, automationLevel: value }))}>
          <div className="space-y-3 mt-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="none" id="automation-none" />
              <Label htmlFor="automation-none" className="text-white/80">Geen automatisering</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="basic" id="automation-basic" />
              <Label htmlFor="automation-basic" className="text-white/80">Basis (email/Excel)</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="average" id="automation-average" />
              <Label htmlFor="automation-average" className="text-white/80">Gemiddeld (enkele tools)</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="advanced" id="automation-advanced" />
              <Label htmlFor="automation-advanced" className="text-white/80">Gevorderd (geïntegreerde systemen)</Label>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  </div>
);

// Progress save functionality
export const ProgressSaveOption = ({ formData, currentStep }: any) => (
  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
    <p className="text-blue-400 text-sm mb-3">
      💾 Lange vragenlijst? Maak een account om je voortgang te bewaren
    </p>
    <button className="text-blue-400 hover:text-blue-300 text-sm underline">
      Account aanmaken om voortgang te bewaren
    </button>
  </div>
);