'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building,
  Bell,
  ChevronLeft,
  Save,
  Camera,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { userSettingsService } from '@/services/userSettingsService-firebase';
import { UserSettings } from '@/types';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, updateUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading states
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Success/Error states
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [avatarMessage, setAvatarMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // User settings state
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  // Profile settings
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);

  const fetchUserData = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingSettings(true);

      // Fetch user settings from service
      const settings = await userSettingsService.get();
      setUserSettings(settings);

      // Pre-fill form with user data
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email);
      setPhone(user.phoneNumber || '');
      setCompany(user.company || '');
      setAvatarUrl(user.photoURL || '');

      // Pre-fill notification settings
      if (settings?.notifications) {
        setEmailNotifications(settings.notifications.email.enabled);
        setProjectUpdates(settings.notifications.email.types.projectUpdates);
        setMeetingReminders(settings.notifications.email.types.deadlines);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingSettings(false);
    }
  }, [user]);

  // Fetch user settings and data on component mount
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchUserData();
    }
  }, [user, loading, router, fetchUserData]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange mx-auto" />
          <p className="mt-4 text-white/60">Laden...</p>
        </div>
      </div>
    );
  }

  const handleProfileUpdate = async () => {
    if (!user) return;

    setSavingProfile(true);
    setProfileMessage(null);

    try {
      // Update user profile in Firestore
      await updateUserProfile({
        firstName,
        lastName,
        phoneNumber: phone,
        company,
      });

      setProfileMessage({ type: 'success', text: 'Profiel succesvol bijgewerkt!' });

      // Clear message after 3 seconds
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setProfileMessage({ type: 'error', text: error.message || 'Kon profiel niet bijwerken' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setSavingNotifications(true);
    setNotificationMessage(null);

    try {
      // Update notification settings
      await userSettingsService.updateNotifications({
        email: {
          enabled: emailNotifications,
          frequency: 'instant',
          types: {
            messages: true,
            projectUpdates,
            taskAssignments: true,
            mentions: true,
            deadlines: meetingReminders,
            systemAlerts: true,
            marketing: false,
          },
        },
        push: {
          enabled: true,
          types: {
            messages: true,
            projectUpdates,
            taskAssignments: true,
            mentions: true,
            deadlines: meetingReminders,
            systemAlerts: true,
            marketing: false,
          },
        },
        sms: {
          enabled: false,
          types: {
            messages: false,
            projectUpdates: false,
            taskAssignments: false,
            mentions: false,
            deadlines: false,
            systemAlerts: false,
            marketing: false,
          },
        },
        inApp: {
          enabled: true,
          sound: true,
          desktop: true,
          types: {
            messages: true,
            projectUpdates: true,
            taskAssignments: true,
            mentions: true,
            deadlines: true,
            systemAlerts: true,
            marketing: true,
          },
        },
      });

      setNotificationMessage({ type: 'success', text: 'Notificatie-instellingen opgeslagen!' });

      // Clear message after 3 seconds
      setTimeout(() => setNotificationMessage(null), 3000);
    } catch (error: any) {
      console.error('Error updating notifications:', error);
      setNotificationMessage({
        type: 'error',
        text: error.message || 'Kon notificaties niet bijwerken',
      });
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setAvatarMessage({ type: 'error', text: 'Upload een afbeelding' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarMessage({ type: 'error', text: 'Afbeelding mag maximaal 5MB zijn' });
      return;
    }

    setUploadingAvatar(true);
    setAvatarMessage(null);

    try {
      // Create storage reference
      const storageRef = ref(storage, `avatars/${user.uid}-${Date.now()}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update user profile with new photo URL
      await updateUserProfile({ photoURL: downloadURL });

      setAvatarUrl(downloadURL);
      setAvatarMessage({ type: 'success', text: 'Profielfoto bijgewerkt!' });

      // Clear message after 3 seconds
      setTimeout(() => setAvatarMessage(null), 3000);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setAvatarMessage({ type: 'error', text: error.message || 'Kon foto niet uploaden' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white/60 hover:text-white mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Terug naar Dashboard
          </Link>

          <h1 className="text-3xl font-bold text-white">Instellingen</h1>
          <p className="text-white/60 mt-2">Beheer je account en voorkeuren</p>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange/20 rounded-lg">
                  <User className="w-5 h-5 text-orange" />
                </div>
                <h2 className="text-xl font-semibold text-white">Profiel</h2>
              </div>

              {/* Success/Error Messages */}
              <AnimatePresence>
                {profileMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6"
                  >
                    <Alert
                      className={
                        profileMessage.type === 'success'
                          ? 'bg-green-500/10 border-green-500/50'
                          : 'bg-red-500/10 border-red-500/50'
                      }
                    >
                      {profileMessage.type === 'success' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <AlertDescription
                        className={
                          profileMessage.type === 'success' ? 'text-green-500' : 'text-red-500'
                        }
                      >
                        {profileMessage.text}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Avatar */}
              <div className="flex items-center space-x-6 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarUrl || user.photoURL || ''} alt="Profile" />
                  <AvatarFallback className="bg-orange text-white text-xl">
                    {firstName[0] || user.email[0].toUpperCase()}
                    {lastName[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 mr-2" />
                    )}
                    Foto wijzigen
                  </Button>
                  <p className="text-xs text-white/40 mt-2">JPG, PNG of GIF. Max 5MB</p>
                  {avatarMessage && (
                    <p
                      className={`text-xs mt-1 ${avatarMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {avatarMessage.text}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-white">
                    Voornaam
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-2 bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-white">
                    Achternaam
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-2 bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    className="mt-2 bg-white/5 border-white/20 text-white/60"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white">
                    Telefoon
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="company" className="text-white">
                    Bedrijf
                  </Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-2 bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleProfileUpdate}
                  className="bg-orange hover:bg-orange/90"
                  disabled={savingProfile || loadingSettings}
                >
                  {savingProfile ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Opslaan
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Bell className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold text-white">Notificaties</h2>
              </div>

              {/* Success/Error Messages */}
              <AnimatePresence>
                {notificationMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6"
                  >
                    <Alert
                      className={
                        notificationMessage.type === 'success'
                          ? 'bg-green-500/10 border-green-500/50'
                          : 'bg-red-500/10 border-red-500/50'
                      }
                    >
                      {notificationMessage.type === 'success' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <AlertDescription
                        className={
                          notificationMessage.type === 'success'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }
                      >
                        {notificationMessage.text}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="text-white">E-mail notificaties</p>
                      <p className="text-sm text-white/60">Ontvang updates via e-mail</p>
                    </div>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="font-medium text-white mb-4">Notificatie types</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Project updates</p>
                        <p className="text-sm text-white/60">Updates over je projectvoortgang</p>
                      </div>
                      <Switch checked={projectUpdates} onCheckedChange={setProjectUpdates} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Meeting herinneringen</p>
                        <p className="text-sm text-white/60">Herinneringen voor geplande meetings</p>
                      </div>
                      <Switch checked={meetingReminders} onCheckedChange={setMeetingReminders} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleNotificationUpdate}
                    className="bg-orange hover:bg-orange/90"
                    disabled={savingNotifications}
                  >
                    {savingNotifications ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Opslaan
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
