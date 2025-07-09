'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
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

interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logo: string;
  vat: string;
  registration: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  active: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  priceType: 'fixed' | 'hourly' | 'custom';
  active: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  newQuotes: boolean;
  projectUpdates: boolean;
  userRegistrations: boolean;
  systemAlerts: boolean;
  weeklyReport: boolean;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Company settings
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'GroeimetAI',
    email: 'info@groeimetai.nl',
    phone: '+31 6 12345678',
    address: 'Amsterdam, Netherlands',
    website: 'https://groeimetai.nl',
    logo: '',
    vat: 'NL123456789B01',
    registration: 'KVK 12345678',
  });

  // Email templates
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Quote Approved',
      subject: 'Your quote has been approved - {{projectName}}',
      body: 'Dear {{clientName}},\n\nWe are pleased to inform you that your quote for {{projectName}} has been approved.\n\nBest regards,\n{{companyName}}',
      variables: ['clientName', 'projectName', 'companyName'],
    },
    {
      id: '2',
      name: 'New User Welcome',
      subject: 'Welcome to GroeimetAI',
      body: "Welcome {{userName}}!\n\nThank you for joining GroeimetAI. We're excited to help you grow with AI.\n\nBest regards,\nThe GroeimetAI Team",
      variables: ['userName'],
    },
  ]);

  // Team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@groeimetai.nl',
      role: 'Administrator',
      permissions: ['all'],
      active: true,
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john@groeimetai.nl',
      role: 'Project Manager',
      permissions: ['projects', 'quotes', 'users'],
      active: true,
    },
  ]);

  // Services
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'AI Consulting',
      description: 'Strategic AI implementation consulting',
      basePrice: 2500,
      priceType: 'fixed',
      active: true,
    },
    {
      id: '2',
      name: 'Chatbot Development',
      description: 'Custom chatbot development and integration',
      basePrice: 150,
      priceType: 'hourly',
      active: true,
    },
    {
      id: '3',
      name: 'Process Automation',
      description: 'Business process automation with AI',
      basePrice: 0,
      priceType: 'custom',
      active: true,
    },
  ]);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    newQuotes: true,
    projectUpdates: true,
    userRegistrations: true,
    systemAlerts: true,
    weeklyReport: false,
  });

  // API Keys
  const [apiKeys, setApiKeys] = useState([
    {
      id: '1',
      name: 'Production API',
      key: 'sk-...abc123',
      created: '2024-01-01',
      lastUsed: '2024-01-15',
    },
    {
      id: '2',
      name: 'Development API',
      key: 'sk-...def456',
      created: '2024-01-10',
      lastUsed: '2024-01-14',
    },
  ]);

  // Dialog states
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

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
      // Simulate saving to database
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSaveMessage(`${section} settings saved successfully!`);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addEmailTemplate = () => {
    setEditingTemplate({
      id: '',
      name: '',
      subject: '',
      body: '',
      variables: [],
    });
    setIsTemplateDialogOpen(true);
  };

  const saveEmailTemplate = () => {
    if (!editingTemplate) return;

    if (editingTemplate.id) {
      setEmailTemplates((templates) =>
        templates.map((t) => (t.id === editingTemplate.id ? editingTemplate : t))
      );
    } else {
      setEmailTemplates((templates) => [
        ...templates,
        { ...editingTemplate, id: Date.now().toString() },
      ]);
    }

    setIsTemplateDialogOpen(false);
    setEditingTemplate(null);
  };

  const deleteEmailTemplate = (id: string) => {
    setEmailTemplates((templates) => templates.filter((t) => t.id !== id));
  };

  const addTeamMember = () => {
    setEditingMember({
      id: '',
      name: '',
      email: '',
      role: 'Project Manager',
      permissions: [],
      active: true,
    });
    setIsTeamDialogOpen(true);
  };

  const saveTeamMember = () => {
    if (!editingMember) return;

    if (editingMember.id) {
      setTeamMembers((members) =>
        members.map((m) => (m.id === editingMember.id ? editingMember : m))
      );
    } else {
      setTeamMembers((members) => [...members, { ...editingMember, id: Date.now().toString() }]);
    }

    setIsTeamDialogOpen(false);
    setEditingMember(null);
  };

  const deleteTeamMember = (id: string) => {
    setTeamMembers((members) => members.filter((m) => m.id !== id));
  };

  const addService = () => {
    setEditingService({
      id: '',
      name: '',
      description: '',
      basePrice: 0,
      priceType: 'fixed',
      active: true,
    });
    setIsServiceDialogOpen(true);
  };

  const saveService = () => {
    if (!editingService) return;

    if (editingService.id) {
      setServices((services) =>
        services.map((s) => (s.id === editingService.id ? editingService : s))
      );
    } else {
      setServices((services) => [...services, { ...editingService, id: Date.now().toString() }]);
    }

    setIsServiceDialogOpen(false);
    setEditingService(null);
  };

  const deleteService = (id: string) => {
    setServices((services) => services.filter((s) => s.id !== id));
  };

  const generateApiKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: `API Key ${apiKeys.length + 1}`,
      key: `sk-...${Math.random().toString(36).substr(2, 9)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
    };
    setApiKeys([...apiKeys, newKey]);
  };

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange mx-auto" />
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
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
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Company Information</CardTitle>
                <CardDescription className="text-white/60">
                  Basic information about your company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company-name" className="text-white/80">
                      Company Name
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
                    <Label htmlFor="company-email" className="text-white/80">
                      Contact Email
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
                      Phone Number
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
                  <div className="md:col-span-2">
                    <Label htmlFor="company-address" className="text-white/80">
                      Address
                    </Label>
                    <Textarea
                      id="company-address"
                      value={companySettings.address}
                      onChange={(e) =>
                        setCompanySettings({ ...companySettings, address: e.target.value })
                      }
                      className="mt-1 bg-white/5 border-white/10 text-white"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-vat" className="text-white/80">
                      VAT Number
                    </Label>
                    <Input
                      id="company-vat"
                      value={companySettings.vat}
                      onChange={(e) =>
                        setCompanySettings({ ...companySettings, vat: e.target.value })
                      }
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-registration" className="text-white/80">
                      Registration Number
                    </Label>
                    <Input
                      id="company-registration"
                      value={companySettings.registration}
                      onChange={(e) =>
                        setCompanySettings({ ...companySettings, registration: e.target.value })
                      }
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => saveSettings('Company')}
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
              </CardContent>
            </Card>
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
                <div className="space-y-4">
                  {emailTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{template.name}</h4>
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
                            onClick={() => {
                              setEditingTemplate(template);
                              setIsTemplateDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteEmailTemplate(template.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <Button
                    onClick={addTeamMember}
                    size="sm"
                    className="bg-orange hover:bg-orange/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
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
                                .join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{member.name}</h4>
                            <p className="text-sm text-white/60">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{member.role}</Badge>
                          <Switch
                            checked={member.active}
                            onCheckedChange={(checked) => {
                              setTeamMembers((members) =>
                                members.map((m) =>
                                  m.id === member.id ? { ...m, active: checked } : m
                                )
                              );
                            }}
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
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTeamMember(member.id)}
                            disabled={member.email === 'admin@groeimetai.nl'}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{service.name}</h4>
                          <p className="text-sm text-white/60 mt-1">{service.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            {service.priceType !== 'custom' && (
                              <span className="text-white">
                                €{service.basePrice}{' '}
                                {service.priceType === 'hourly' ? '/ hour' : ''}
                              </span>
                            )}
                            <Badge variant="outline">{service.priceType}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={service.active}
                            onCheckedChange={(checked) => {
                              setServices((services) =>
                                services.map((s) =>
                                  s.id === service.id ? { ...s, active: checked } : s
                                )
                              );
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingService(service);
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
                        checked={notificationSettings.newQuotes}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, newQuotes: checked })
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
                        checked={notificationSettings.projectUpdates}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            projectUpdates: checked,
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
                        checked={notificationSettings.userRegistrations}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            userRegistrations: checked,
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
                        checked={notificationSettings.systemAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            systemAlerts: checked,
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
                        checked={notificationSettings.weeklyReport}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            weeklyReport: checked,
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
                    onClick={generateApiKey}
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
                    control.
                  </AlertDescription>
                </Alert>
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-white">{apiKey.name}</h4>
                          <p className="text-sm text-white/60 font-mono mt-1">{apiKey.key}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
                            <span>Created: {apiKey.created}</span>
                            <span>Last used: {apiKey.lastUsed}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setApiKeys((keys) => keys.filter((k) => k.id !== apiKey.id))
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Email Template Dialog */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="bg-black/95 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>{editingTemplate?.id ? 'Edit' : 'Add'} Email Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-white/80">Template Name</Label>
                <Input
                  value={editingTemplate?.name || ''}
                  onChange={(e) =>
                    setEditingTemplate((prev) => (prev ? { ...prev, name: e.target.value } : null))
                  }
                  className="mt-1 bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-white/80">Subject</Label>
                <Input
                  value={editingTemplate?.subject || ''}
                  onChange={(e) =>
                    setEditingTemplate((prev) =>
                      prev ? { ...prev, subject: e.target.value } : null
                    )
                  }
                  className="mt-1 bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-white/80">Body</Label>
                <Textarea
                  value={editingTemplate?.body || ''}
                  onChange={(e) =>
                    setEditingTemplate((prev) => (prev ? { ...prev, body: e.target.value } : null))
                  }
                  rows={6}
                  className="mt-1 bg-white/5 border-white/10 text-white"
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
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveEmailTemplate} className="bg-orange hover:bg-orange/90">
                Save Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Team Member Dialog */}
        <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
          <DialogContent className="bg-black/95 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>{editingMember?.id ? 'Edit' : 'Add'} Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-white/80">Name</Label>
                <Input
                  value={editingMember?.name || ''}
                  onChange={(e) =>
                    setEditingMember((prev) => (prev ? { ...prev, name: e.target.value } : null))
                  }
                  className="mt-1 bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-white/80">Email</Label>
                <Input
                  type="email"
                  value={editingMember?.email || ''}
                  onChange={(e) =>
                    setEditingMember((prev) => (prev ? { ...prev, email: e.target.value } : null))
                  }
                  className="mt-1 bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-white/80">Role</Label>
                <Select
                  value={editingMember?.role || 'Project Manager'}
                  onValueChange={(value: string) =>
                    setEditingMember((prev) => (prev ? { ...prev, role: value } : null))
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Project Manager">Project Manager</SelectItem>
                    <SelectItem value="Developer">Developer</SelectItem>
                    <SelectItem value="Designer">Designer</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsTeamDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveTeamMember} className="bg-orange hover:bg-orange/90">
                Save Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Service Dialog */}
        <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
          <DialogContent className="bg-black/95 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>{editingService?.id ? 'Edit' : 'Add'} Service</DialogTitle>
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
                  <Label className="text-white/80">Base Price (EUR)</Label>
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
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveService} className="bg-orange hover:bg-orange/90">
                Save Service
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
