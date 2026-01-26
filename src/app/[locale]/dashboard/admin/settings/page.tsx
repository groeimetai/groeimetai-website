'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { companySettingsService } from '@/services/companySettingsService';
import { adminSettingsService } from '@/services/adminSettingsService';
import { teamManagementService } from '@/services/teamManagementService';
import {
  CompanySettings as CompanySettingsType,
  AdminEmailTemplate,
  AdminService,
  AdminNotificationSettings,
  AdminApiKey,
  TeamMember,
} from '@/types';
import {
  Settings,
  Building,
  Mail,
  Users,
  CreditCard,
  Bell,
  Key,
  Shield,
  Save,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Check,
  X,
  Globe,
  Palette,
  Database,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  Send,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Local interfaces for editing (before saving to backend)
interface EditingEmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  isSystem: boolean;
}

interface EditingService {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  priceType: 'fixed' | 'hourly' | 'custom';
  isActive: boolean;
}

interface ApiKeyWithFullKey extends AdminApiKey {
  fullKey?: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Company settings (loaded from Firestore)
  const [companySettings, setCompanySettings] = useState<CompanySettingsType | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Email templates (loaded from Firestore)
  const [emailTemplates, setEmailTemplates] = useState<AdminEmailTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  // Team members (loaded from Firestore)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);

  // Services (loaded from Firestore)
  const [services, setServices] = useState<AdminService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  // Notification settings (loaded from Firestore)
  const [notificationSettings, setNotificationSettings] = useState<AdminNotificationSettings | null>(null);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  // API Keys (loaded from Firestore)
  const [apiKeys, setApiKeys] = useState<ApiKeyWithFullKey[]>([]);
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(true);
  const [newKeyFullKey, setNewKeyFullKey] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);

  // Test email state
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // Dialog states
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EditingEmailTemplate | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingService, setEditingService] = useState<EditingService | null>(null);
  const [newApiKeyName, setNewApiKeyName] = useState('');

  // Load all data functions
  const loadCompanySettings = useCallback(async () => {
    try {
      setIsLoadingSettings(true);
      const settings = await companySettingsService.getCompanySettings();
      setCompanySettings(settings);
    } catch (error) {
      console.error('Error loading company settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  const loadEmailTemplates = useCallback(async () => {
    try {
      setIsLoadingTemplates(true);
      const templates = await adminSettingsService.getEmailTemplates();
      setEmailTemplates(templates);
    } catch (error) {
      console.error('Error loading email templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  const loadTeamMembers = useCallback(async () => {
    try {
      setIsLoadingTeam(true);
      const members = await teamManagementService.getTeamMembers();
      setTeamMembers(members);
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setIsLoadingTeam(false);
    }
  }, []);

  const loadServices = useCallback(async () => {
    try {
      setIsLoadingServices(true);
      const servicesList = await adminSettingsService.getServices();
      setServices(servicesList);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoadingServices(false);
    }
  }, []);

  const loadNotificationSettings = useCallback(async () => {
    try {
      setIsLoadingNotifications(true);
      const settings = await adminSettingsService.getNotificationSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  const loadApiKeys = useCallback(async () => {
    try {
      setIsLoadingApiKeys(true);
      const response = await fetch('/api/admin/api-keys');
      const data = await response.json();
      if (data.success) {
        setApiKeys(data.data);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setIsLoadingApiKeys(false);
    }
  }, []);

  // Load all settings on mount
  useEffect(() => {
    if (user && isAdmin) {
      loadCompanySettings();
      loadEmailTemplates();
      loadTeamMembers();
      loadServices();
      loadNotificationSettings();
      loadApiKeys();
    }
  }, [user, isAdmin, loadCompanySettings, loadEmailTemplates, loadTeamMembers, loadServices, loadNotificationSettings, loadApiKeys]);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  const saveSettings = async (section: string) => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      if (section === 'Company' && companySettings && user) {
        await companySettingsService.updateCompanySettings(companySettings, user.uid);
      } else if (section === 'Notifications' && notificationSettings && user) {
        await adminSettingsService.updateNotificationSettings(notificationSettings, user.uid);
      }

      setSaveMessage(`${section} settings saved successfully!`);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Email Template CRUD
  const addEmailTemplate = () => {
    setEditingTemplate({
      id: '',
      name: '',
      slug: '',
      subject: '',
      body: '',
      variables: [],
      isActive: true,
      isSystem: false,
    });
    setIsTemplateDialogOpen(true);
  };

  const saveEmailTemplate = async () => {
    if (!editingTemplate || !user) return;

    setIsSaving(true);
    try {
      if (editingTemplate.id) {
        await adminSettingsService.updateEmailTemplate(editingTemplate.id, editingTemplate, user.uid);
      } else {
        await adminSettingsService.addEmailTemplate(
          {
            name: editingTemplate.name,
            slug: editingTemplate.slug || editingTemplate.name.toLowerCase().replace(/\s+/g, '-'),
            subject: editingTemplate.subject,
            body: editingTemplate.body,
            variables: editingTemplate.variables,
            isActive: editingTemplate.isActive,
            isSystem: false,
          },
          user.uid
        );
      }

      await loadEmailTemplates();
      setIsTemplateDialogOpen(false);
      setEditingTemplate(null);
      setSaveMessage('Email template saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving email template:', error);
      setSaveMessage('Error saving email template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEmailTemplate = async (id: string) => {
    if (!user) return;

    try {
      await adminSettingsService.deleteEmailTemplate(id, user.uid);
      await loadEmailTemplates();
      setSaveMessage('Email template deleted successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
      console.error('Error deleting email template:', error);
      setSaveMessage(error.message || 'Error deleting email template.');
    }
  };

  const sendTestEmail = async (template: AdminEmailTemplate) => {
    if (!testEmailAddress) {
      setSaveMessage('Please enter a test email address');
      return;
    }

    setIsSendingTestEmail(true);
    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmailAddress,
          subject: template.subject,
          body: template.body,
          variables: {},
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSaveMessage(`Test email sent to ${testEmailAddress}!`);
      } else {
        setSaveMessage(data.error || 'Failed to send test email');
      }
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error sending test email:', error);
      setSaveMessage('Error sending test email. Please try again.');
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Team Member operations
  const addTeamMember = () => {
    setEditingMember({
      id: '',
      userId: '',
      name: '',
      email: '',
      role: 'project_manager',
      permissions: [],
      isActive: true,
    });
    setIsTeamDialogOpen(true);
  };

  const saveTeamMember = async () => {
    if (!editingMember || !user) return;

    setIsSaving(true);
    try {
      if (editingMember.id) {
        // Update existing member role
        await teamManagementService.updateMemberRole(
          editingMember.userId,
          editingMember.role as TeamMember['role'],
          editingMember.permissions
        );
        await loadTeamMembers();
        setSaveMessage('Team member updated successfully!');
      } else {
        // Send invitation to new member
        const response = await fetch('/api/admin/invite-team-member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: editingMember.email,
            role: editingMember.role,
            invitedBy: user.uid,
            invitedByName: user.displayName || user.email,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setSaveMessage('Invitation sent successfully!');
        } else {
          throw new Error(data.error || 'Failed to send invitation');
        }
      }

      setIsTeamDialogOpen(false);
      setEditingMember(null);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
      console.error('Error saving team member:', error);
      setSaveMessage(error.message || 'Error saving team member. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMemberActive = async (member: TeamMember) => {
    try {
      if (member.isActive) {
        await teamManagementService.deactivateMember(member.userId);
      } else {
        await teamManagementService.reactivateMember(member.userId);
      }
      await loadTeamMembers();
    } catch (error) {
      console.error('Error toggling member status:', error);
    }
  };

  // Service CRUD
  const addService = () => {
    setEditingService({
      id: '',
      name: '',
      description: '',
      basePrice: 0,
      priceType: 'fixed',
      isActive: true,
    });
    setIsServiceDialogOpen(true);
  };

  const saveService = async () => {
    if (!editingService || !user) return;

    setIsSaving(true);
    try {
      if (editingService.id) {
        await adminSettingsService.updateService(editingService.id, editingService, user.uid);
      } else {
        await adminSettingsService.addService(
          {
            name: editingService.name,
            description: editingService.description,
            basePrice: editingService.basePrice,
            priceType: editingService.priceType,
            isActive: editingService.isActive,
            sortOrder: services.length + 1,
          },
          user.uid
        );
      }

      await loadServices();
      setIsServiceDialogOpen(false);
      setEditingService(null);
      setSaveMessage('Service saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving service:', error);
      setSaveMessage('Error saving service. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!user) return;

    try {
      await adminSettingsService.deleteService(id, user.uid);
      await loadServices();
      setSaveMessage('Service deleted successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting service:', error);
      setSaveMessage('Error deleting service. Please try again.');
    }
  };

  const toggleServiceActive = async (service: AdminService) => {
    if (!user) return;

    try {
      await adminSettingsService.updateService(service.id, { isActive: !service.isActive }, user.uid);
      await loadServices();
    } catch (error) {
      console.error('Error toggling service status:', error);
    }
  };

  // API Key operations
  const generateApiKey = async () => {
    if (!newApiKeyName || !user) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newApiKeyName,
          permissions: ['read', 'write'],
          createdBy: user.uid,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewKeyFullKey(data.data.fullKey);
        setShowNewKey(true);
        await loadApiKeys();
        setNewApiKeyName('');
        setIsApiKeyDialogOpen(false);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      setSaveMessage('Error generating API key. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/admin/api-keys?id=${keyId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        await loadApiKeys();
        setSaveMessage('API key revoked successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSaveMessage('Copied to clipboard!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080D14' }}>
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange mx-auto" />
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Settings</h1>
          <p className="text-white/60">Configure your platform settings and preferences</p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <Alert className="mb-6 bg-green-500/10 border-green-500/30">
            <Check className="w-4 h-4 text-green-500" />
            <AlertDescription className="text-white">{saveMessage}</AlertDescription>
          </Alert>
        )}

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border-white/10 mb-6">
            <TabsTrigger value="company" className="data-[state=active]:bg-orange">
              <Building className="w-4 h-4 mr-2" />
              Company
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-orange">
              <Mail className="w-4 h-4 mr-2" />
              Email Templates
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-orange">
              <Users className="w-4 h-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-orange">
              <CreditCard className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-orange">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-orange">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
          </TabsList>

          {/* Company Settings */}
          <TabsContent value="company">
            {isLoadingSettings ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-12 flex items-center justify-center">
                  <Loader2 className="animate-spin h-8 w-8 text-orange" />
                </CardContent>
              </Card>
            ) : companySettings ? (
              <div className="space-y-6">
                {/* Basic Company Info */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Bedrijfsgegevens</CardTitle>
                    <CardDescription className="text-white/60">
                      Basisinformatie over je bedrijf (verschijnt op facturen)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="company-name" className="text-white/80">
                          Bedrijfsnaam
                        </Label>
                        <Input
                          id="company-name"
                          value={companySettings.name}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, name: e.target.value })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company-legal-name" className="text-white/80">
                          Juridische naam
                        </Label>
                        <Input
                          id="company-legal-name"
                          value={companySettings.legalName}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, legalName: e.target.value })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                          placeholder="bijv. GroeimetAI B.V."
                        />
                      </div>
                      <div>
                        <Label htmlFor="company-email" className="text-white/80">
                          E-mailadres
                        </Label>
                        <Input
                          id="company-email"
                          type="email"
                          value={companySettings.email}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, email: e.target.value })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company-phone" className="text-white/80">
                          Telefoonnummer
                        </Label>
                        <Input
                          id="company-phone"
                          value={companySettings.phone}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, phone: e.target.value })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company-website" className="text-white/80">
                          Website
                        </Label>
                        <Input
                          id="company-website"
                          value={companySettings.website}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, website: e.target.value })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Adres</CardTitle>
                    <CardDescription className="text-white/60">
                      Vestigingsadres voor facturen
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label htmlFor="company-street" className="text-white/80">
                          Straat en huisnummer
                        </Label>
                        <Input
                          id="company-street"
                          value={companySettings.street}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, street: e.target.value })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                          placeholder="bijv. Herengracht 100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company-postal" className="text-white/80">
                          Postcode
                        </Label>
                        <Input
                          id="company-postal"
                          value={companySettings.postalCode}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, postalCode: e.target.value })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                          placeholder="bijv. 1015 BS"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company-city" className="text-white/80">
                          Plaats
                        </Label>
                        <Input
                          id="company-city"
                          value={companySettings.city}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, city: e.target.value })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company-country" className="text-white/80">
                          Land
                        </Label>
                        <Input
                          id="company-country"
                          value={companySettings.country}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, country: e.target.value })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dutch Registration (KvK & BTW) */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Registratie</CardTitle>
                    <CardDescription className="text-white/60">
                      KvK en BTW-nummer (verplicht op Nederlandse facturen)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="company-kvk" className="text-white/80">
                          KvK-nummer
                        </Label>
                        <Input
                          id="company-kvk"
                          value={companySettings.kvkNumber}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, kvkNumber: e.target.value })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                          placeholder="bijv. 12345678"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company-btw" className="text-white/80">
                          BTW-nummer
                        </Label>
                        <Input
                          id="company-btw"
                          value={companySettings.btwNumber}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, btwNumber: e.target.value })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                          placeholder="bijv. NL123456789B01"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Banking Details */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Bankgegevens</CardTitle>
                    <CardDescription className="text-white/60">
                      Bankrekening voor betalingen (verschijnt op facturen)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="company-bank" className="text-white/80">
                          Bank
                        </Label>
                        <Input
                          id="company-bank"
                          value={companySettings.bankName}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, bankName: e.target.value })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                          placeholder="bijv. ABN AMRO"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company-iban" className="text-white/80">
                          IBAN
                        </Label>
                        <Input
                          id="company-iban"
                          value={companySettings.iban}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, iban: e.target.value })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                          placeholder="bijv. NL91 ABNA 0417 1643 00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company-bic" className="text-white/80">
                          BIC/SWIFT
                        </Label>
                        <Input
                          id="company-bic"
                          value={companySettings.bic}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, bic: e.target.value })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                          placeholder="bijv. ABNANL2A"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Invoice Settings */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Factuurinstellingen</CardTitle>
                    <CardDescription className="text-white/60">
                      Standaard instellingen voor nieuwe facturen
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="company-payment-terms" className="text-white/80">
                          Betalingstermijn (dagen)
                        </Label>
                        <Input
                          id="company-payment-terms"
                          type="number"
                          value={companySettings.defaultPaymentTermsDays}
                          onChange={(e) =>
                            setCompanySettings({
                              ...companySettings,
                              defaultPaymentTermsDays: parseInt(e.target.value) || 30,
                            })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company-tax-rate" className="text-white/80">
                          Standaard BTW-tarief (%)
                        </Label>
                        <Input
                          id="company-tax-rate"
                          type="number"
                          value={companySettings.defaultTaxRate}
                          onChange={(e) =>
                            setCompanySettings({
                              ...companySettings,
                              defaultTaxRate: parseInt(e.target.value) || 21,
                            })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company-invoice-prefix" className="text-white/80">
                          Factuurnummer prefix
                        </Label>
                        <Input
                          id="company-invoice-prefix"
                          value={companySettings.invoicePrefix}
                          onChange={(e) =>
                            setCompanySettings({ ...companySettings, invoicePrefix: e.target.value })
                          }
                          className="mt-1 bg-white/5 border-white/10 text-white"
                          placeholder="bijv. INV"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => saveSettings('Company')}
                    disabled={isSaving}
                    className="bg-orange hover:bg-orange/90"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                        Opslaan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Wijzigingen opslaan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-white/60">Kon bedrijfsgegevens niet laden</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Email Templates */}
          <TabsContent value="email">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Email Templates</CardTitle>
                    <CardDescription className="text-white/60">
                      Manage email templates for automated communications
                    </CardDescription>
                  </div>
                  <Button
                    onClick={addEmailTemplate}
                    size="sm"
                    className="bg-orange hover:bg-orange/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Test Email Address Input */}
                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <Label className="text-white/80">Test Email Address</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="email"
                      placeholder="Enter email for testing templates"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-1">
                    Enter an email address to send test emails with sample data
                  </p>
                </div>

                {isLoadingTemplates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin h-8 w-8 text-orange" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {emailTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-white">{template.name}</h4>
                              {template.isSystem && (
                                <Badge variant="outline" className="text-xs bg-blue-500/20 border-blue-500/30">
                                  System
                                </Badge>
                              )}
                              {!template.isActive && (
                                <Badge variant="outline" className="text-xs bg-red-500/20 border-red-500/30">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-white/60 mt-1">{template.subject}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {template.variables.map((variable) => (
                                <Badge key={variable} variant="outline" className="text-xs">
                                  {`{{${variable}}}`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => sendTestEmail(template)}
                              disabled={!testEmailAddress || isSendingTestEmail}
                              title="Send test email"
                            >
                              {isSendingTestEmail ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingTemplate({
                                  id: template.id,
                                  name: template.name,
                                  slug: template.slug,
                                  subject: template.subject,
                                  body: template.body,
                                  variables: template.variables,
                                  isActive: template.isActive,
                                  isSystem: template.isSystem,
                                });
                                setIsTemplateDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!template.isSystem && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteEmailTemplate(template.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Management */}
          <TabsContent value="team">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Team Members</CardTitle>
                    <CardDescription className="text-white/60">
                      Manage team members and their permissions
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={loadTeamMembers}
                      size="sm"
                      variant="outline"
                      disabled={isLoadingTeam}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingTeam ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button
                      onClick={addTeamMember}
                      size="sm"
                      className="bg-orange hover:bg-orange/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingTeam ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin h-8 w-8 text-orange" />
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No team members found</p>
                    <p className="text-sm text-white/40">Invite team members to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-orange/20 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {member.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{member.name}</h4>
                              <p className="text-sm text-white/60">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">
                              {teamManagementService.getRoleDisplayName(member.role)}
                            </Badge>
                            <Switch
                              checked={member.isActive}
                              onCheckedChange={() => toggleMemberActive(member)}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingMember(member);
                                setIsTeamDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services & Pricing */}
          <TabsContent value="services">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Services & Pricing</CardTitle>
                    <CardDescription className="text-white/60">
                      Configure services and pricing options
                    </CardDescription>
                  </div>
                  <Button onClick={addService} size="sm" className="bg-orange hover:bg-orange/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingServices ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin h-8 w-8 text-orange" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-white">{service.name}</h4>
                              {!service.isActive && (
                                <Badge variant="outline" className="text-xs bg-red-500/20 border-red-500/30">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-white/60 mt-1">{service.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              {service.priceType !== 'custom' && (
                                <span className="text-white">
                                  €{service.basePrice.toLocaleString('nl-NL')}{' '}
                                  {service.priceType === 'hourly' ? '/ hour' : ''}
                                </span>
                              )}
                              <Badge variant="outline">{service.priceType}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Switch
                              checked={service.isActive}
                              onCheckedChange={() => toggleServiceActive(service)}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingService({
                                  id: service.id,
                                  name: service.name,
                                  description: service.description,
                                  basePrice: service.basePrice,
                                  priceType: service.priceType,
                                  isActive: service.isActive,
                                });
                                setIsServiceDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteService(service.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Notification Settings</CardTitle>
                <CardDescription className="text-white/60">
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingNotifications || !notificationSettings ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin h-8 w-8 text-orange" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications" className="text-white">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-white/60">Receive notifications via email</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: checked,
                            })
                          }
                        />
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="new-quotes" className="text-white">
                              New Quotes
                            </Label>
                            <p className="text-sm text-white/60">
                              Get notified when new quotes are submitted
                            </p>
                          </div>
                          <Switch
                            id="new-quotes"
                            checked={notificationSettings.events.newQuotes}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                events: { ...notificationSettings.events, newQuotes: checked },
                              })
                            }
                            disabled={!notificationSettings.emailNotifications}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="project-updates" className="text-white">
                              Project Updates
                            </Label>
                            <p className="text-sm text-white/60">
                              Notifications for project status changes
                            </p>
                          </div>
                          <Switch
                            id="project-updates"
                            checked={notificationSettings.events.projectUpdates}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                events: { ...notificationSettings.events, projectUpdates: checked },
                              })
                            }
                            disabled={!notificationSettings.emailNotifications}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="user-registrations" className="text-white">
                              User Registrations
                            </Label>
                            <p className="text-sm text-white/60">New user sign-ups</p>
                          </div>
                          <Switch
                            id="user-registrations"
                            checked={notificationSettings.events.userRegistrations}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                events: { ...notificationSettings.events, userRegistrations: checked },
                              })
                            }
                            disabled={!notificationSettings.emailNotifications}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="system-alerts" className="text-white">
                              System Alerts
                            </Label>
                            <p className="text-sm text-white/60">Important system notifications</p>
                          </div>
                          <Switch
                            id="system-alerts"
                            checked={notificationSettings.events.systemAlerts}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                events: { ...notificationSettings.events, systemAlerts: checked },
                              })
                            }
                            disabled={!notificationSettings.emailNotifications}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="weekly-report" className="text-white">
                              Weekly Report
                            </Label>
                            <p className="text-sm text-white/60">Receive weekly summary reports</p>
                          </div>
                          <Switch
                            id="weekly-report"
                            checked={notificationSettings.events.weeklyReport}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                events: { ...notificationSettings.events, weeklyReport: checked },
                              })
                            }
                            disabled={!notificationSettings.emailNotifications}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="invoice-payments" className="text-white">
                              Invoice Payments
                            </Label>
                            <p className="text-sm text-white/60">Get notified when invoices are paid</p>
                          </div>
                          <Switch
                            id="invoice-payments"
                            checked={notificationSettings.events.invoicePayments}
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                events: { ...notificationSettings.events, invoicePayments: checked },
                              })
                            }
                            disabled={!notificationSettings.emailNotifications}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => saveSettings('Notifications')}
                        disabled={isSaving}
                        className="bg-orange hover:bg-orange/90"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="animate-spin w-4 h-4 mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys */}
          <TabsContent value="api">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">API Keys</CardTitle>
                    <CardDescription className="text-white/60">
                      Manage API keys for external integrations
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsApiKeyDialogOpen(true)}
                    size="sm"
                    className="bg-orange hover:bg-orange/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/30">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <AlertDescription className="text-white">
                    Keep your API keys secure. Never share them publicly or commit them to version
                    control. Full keys are shown only once when created.
                  </AlertDescription>
                </Alert>

                {/* Show newly generated key */}
                {newKeyFullKey && (
                  <Alert className="mb-6 bg-green-500/10 border-green-500/30">
                    <Key className="w-4 h-4 text-green-500" />
                    <AlertDescription className="text-white">
                      <p className="font-medium mb-2">New API Key Generated!</p>
                      <p className="text-sm text-white/80 mb-2">
                        Copy this key now. It will not be shown again.
                      </p>
                      <div className="flex items-center gap-2 bg-black/30 p-2 rounded font-mono text-sm">
                        {showNewKey ? (
                          <span className="flex-1 break-all">{newKeyFullKey}</span>
                        ) : (
                          <span className="flex-1">••••••••••••••••••••••••••••</span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowNewKey(!showNewKey)}
                        >
                          {showNewKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(newKeyFullKey)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          setNewKeyFullKey(null);
                          setShowNewKey(false);
                        }}
                      >
                        Dismiss
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {isLoadingApiKeys ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin h-8 w-8 text-orange" />
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="text-center py-8">
                    <Key className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No API keys yet</p>
                    <p className="text-sm text-white/40">Generate a key to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                      <div
                        key={apiKey.id}
                        className={`p-4 bg-white/5 rounded-lg border ${
                          apiKey.isActive ? 'border-white/10' : 'border-red-500/30 opacity-60'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-white">{apiKey.name}</h4>
                              {!apiKey.isActive && (
                                <Badge variant="outline" className="text-xs bg-red-500/20 border-red-500/30">
                                  Revoked
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-white/60 font-mono mt-1">{apiKey.keyPrefix}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
                              <span>
                                Created:{' '}
                                {apiKey.createdAt
                                  ? new Date(apiKey.createdAt).toLocaleDateString('nl-NL')
                                  : 'Unknown'}
                              </span>
                              {apiKey.lastUsedAt && (
                                <span>
                                  Last used: {new Date(apiKey.lastUsedAt).toLocaleDateString('nl-NL')}
                                </span>
                              )}
                            </div>
                          </div>
                          {apiKey.isActive && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => revokeApiKey(apiKey.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Email Template Dialog */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="bg-black/95 border-white/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTemplate?.id ? 'Edit' : 'Add'} Email Template</DialogTitle>
              <DialogDescription className="text-white/60">
                {editingTemplate?.isSystem
                  ? 'System templates can be edited but not deleted.'
                  : 'Create custom email templates for automated communications.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Template Name</Label>
                  <Input
                    value={editingTemplate?.name || ''}
                    onChange={(e) =>
                      setEditingTemplate((prev) => (prev ? { ...prev, name: e.target.value } : null))
                    }
                    className="mt-1 bg-white/5 border-white/10 text-white"
                    placeholder="e.g., Quote Approved"
                  />
                </div>
                <div>
                  <Label className="text-white/80">Slug (URL-friendly)</Label>
                  <Input
                    value={editingTemplate?.slug || ''}
                    onChange={(e) =>
                      setEditingTemplate((prev) => (prev ? { ...prev, slug: e.target.value } : null))
                    }
                    className="mt-1 bg-white/5 border-white/10 text-white"
                    placeholder="e.g., quote-approved"
                  />
                </div>
              </div>
              <div>
                <Label className="text-white/80">Subject Line</Label>
                <Input
                  value={editingTemplate?.subject || ''}
                  onChange={(e) =>
                    setEditingTemplate((prev) =>
                      prev ? { ...prev, subject: e.target.value } : null
                    )
                  }
                  className="mt-1 bg-white/5 border-white/10 text-white"
                  placeholder="e.g., Your quote has been approved - {{projectName}}"
                />
              </div>
              <div>
                <Label className="text-white/80">Email Body</Label>
                <Textarea
                  value={editingTemplate?.body || ''}
                  onChange={(e) =>
                    setEditingTemplate((prev) => (prev ? { ...prev, body: e.target.value } : null))
                  }
                  rows={8}
                  className="mt-1 bg-white/5 border-white/10 text-white font-mono text-sm"
                  placeholder="Dear {{clientName}},&#10;&#10;Your message here...&#10;&#10;Best regards,&#10;{{companyName}}"
                />
              </div>
              <div>
                <Label className="text-white/80">Variables (comma separated)</Label>
                <Input
                  value={editingTemplate?.variables.join(', ') || ''}
                  onChange={(e) =>
                    setEditingTemplate((prev) =>
                      prev
                        ? {
                            ...prev,
                            variables: e.target.value
                              .split(',')
                              .map((v) => v.trim())
                              .filter(Boolean),
                          }
                        : null
                    )
                  }
                  className="mt-1 bg-white/5 border-white/10 text-white"
                  placeholder="clientName, projectName, companyName"
                />
                <p className="text-xs text-white/40 mt-1">
                  Use {'{{variableName}}'} in subject and body to insert dynamic values
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingTemplate?.isActive ?? true}
                  onCheckedChange={(checked) =>
                    setEditingTemplate((prev) => (prev ? { ...prev, isActive: checked } : null))
                  }
                />
                <Label className="text-white/80">Active</Label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={saveEmailTemplate}
                className="bg-orange hover:bg-orange/90"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Template'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Team Member Dialog */}
        <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
          <DialogContent className="bg-black/95 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>
                {editingMember?.id ? 'Edit Team Member' : 'Invite New Team Member'}
              </DialogTitle>
              <DialogDescription className="text-white/60">
                {editingMember?.id
                  ? 'Update team member role and permissions.'
                  : 'Send an invitation to join your team.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {editingMember?.id ? (
                // Editing existing member - show name (readonly)
                <div>
                  <Label className="text-white/80">Name</Label>
                  <Input
                    value={editingMember?.name || ''}
                    disabled
                    className="mt-1 bg-white/5 border-white/10 text-white/60"
                  />
                </div>
              ) : null}
              <div>
                <Label className="text-white/80">Email</Label>
                <Input
                  type="email"
                  value={editingMember?.email || ''}
                  onChange={(e) =>
                    setEditingMember((prev) => (prev ? { ...prev, email: e.target.value } : null))
                  }
                  disabled={!!editingMember?.id}
                  className="mt-1 bg-white/5 border-white/10 text-white"
                  placeholder="team.member@company.com"
                />
              </div>
              <div>
                <Label className="text-white/80">Role</Label>
                <Select
                  value={editingMember?.role || 'project_manager'}
                  onValueChange={(value) =>
                    setEditingMember((prev) =>
                      prev ? { ...prev, role: value as TeamMember['role'] } : null
                    )
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="project_manager">Project Manager</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsTeamDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={saveTeamMember}
                className="bg-orange hover:bg-orange/90"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    {editingMember?.id ? 'Saving...' : 'Sending Invite...'}
                  </>
                ) : editingMember?.id ? (
                  'Save Changes'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Service Dialog */}
        <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
          <DialogContent className="bg-black/95 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>{editingService?.id ? 'Edit' : 'Add'} Service</DialogTitle>
              <DialogDescription className="text-white/60">
                Configure service details and pricing options.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-white/80">Service Name</Label>
                <Input
                  value={editingService?.name || ''}
                  onChange={(e) =>
                    setEditingService((prev) => (prev ? { ...prev, name: e.target.value } : null))
                  }
                  className="mt-1 bg-white/5 border-white/10 text-white"
                  placeholder="e.g., AI Consulting"
                />
              </div>
              <div>
                <Label className="text-white/80">Description</Label>
                <Textarea
                  value={editingService?.description || ''}
                  onChange={(e) =>
                    setEditingService((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  rows={3}
                  className="mt-1 bg-white/5 border-white/10 text-white"
                  placeholder="Brief description of the service..."
                />
              </div>
              <div>
                <Label className="text-white/80">Pricing Type</Label>
                <Select
                  value={editingService?.priceType || 'fixed'}
                  onValueChange={(value) =>
                    setEditingService((prev) =>
                      prev ? { ...prev, priceType: value as 'fixed' | 'hourly' | 'custom' } : null
                    )
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                    <SelectItem value="custom">Custom Quote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingService?.priceType !== 'custom' && (
                <div>
                  <Label className="text-white/80">
                    Base Price (EUR) {editingService?.priceType === 'hourly' && '/ hour'}
                  </Label>
                  <Input
                    type="number"
                    value={editingService?.basePrice || 0}
                    onChange={(e) =>
                      setEditingService((prev) =>
                        prev ? { ...prev, basePrice: parseInt(e.target.value) || 0 } : null
                      )
                    }
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingService?.isActive ?? true}
                  onCheckedChange={(checked) =>
                    setEditingService((prev) => (prev ? { ...prev, isActive: checked } : null))
                  }
                />
                <Label className="text-white/80">Active</Label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={saveService}
                className="bg-orange hover:bg-orange/90"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Service'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* API Key Dialog */}
        <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
          <DialogContent className="bg-black/95 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>Generate New API Key</DialogTitle>
              <DialogDescription className="text-white/60">
                Create a new API key for external integrations. The full key will only be shown once.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-white/80">Key Name</Label>
                <Input
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                  className="mt-1 bg-white/5 border-white/10 text-white"
                  placeholder="e.g., Production API, Development API"
                />
                <p className="text-xs text-white/40 mt-1">
                  Give your key a descriptive name so you can identify it later.
                </p>
              </div>
            </div>
            <Alert className="mt-4 bg-yellow-500/10 border-yellow-500/30">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <AlertDescription className="text-white text-sm">
                The API key will only be displayed once after generation. Make sure to copy and
                store it securely.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={generateApiKey}
                className="bg-orange hover:bg-orange/90"
                disabled={isSaving || !newApiKeyName}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Generate Key
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
