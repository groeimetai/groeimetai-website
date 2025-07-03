'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building,
  Bell,
  Shield,
  CreditCard,
  ChevronLeft,
  Save,
  Camera,
  Lock,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Check,
  X,
  Loader2,
  Upload,
  AlertCircle,
  Trash2,
  AlertTriangle,
  QrCode,
  Copy,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { userSettingsService } from '@/services/userSettingsService';
import { accountDeletionService } from '@/services/accountDeletionService';
import { UserSettings } from '@/types';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth, storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { twoFactorService, TotpSecret } from '@/services/twoFactorService';

export default function SettingsPage() {
  const router = useRouter();
  const { user, firebaseUser, loading, updateUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading states
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
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
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [avatarMessage, setAvatarMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // User settings state
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [billingData, setBillingData] = useState<any>(null);

  // Profile settings
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);
  const [newsletters, setNewsletters] = useState(false);
  const [emailFrequency, setEmailFrequency] = useState<'instant' | 'hourly' | 'daily' | 'weekly'>(
    'instant'
  );

  // Preferences
  const [theme, setTheme] = useState<'light' | 'dark' | 'system' | 'custom'>('system');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Europe/Amsterdam');

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // 2FA State
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FADisable, setShow2FADisable] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [twoFactorMethods, setTwoFactorMethods] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState('');

  // Account deletion
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deletionProgress, setDeletionProgress] = useState<{
    status: string;
    percentage: number;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [dataSummary, setDataSummary] = useState<{
    documentCount: number;
    projectCount: number;
    meetingCount: number;
    storageUsed: number;
  } | null>(null);

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
      setJobTitle(user.jobTitle || '');
      setBio(user.bio || '');
      setAvatarUrl(user.photoURL || '');

      // Pre-fill notification settings
      if (settings?.notifications) {
        setEmailNotifications(settings.notifications.email.enabled);
        setPushNotifications(settings.notifications.push.enabled);
        setSmsNotifications(settings.notifications.sms.enabled);
        setEmailFrequency(settings.notifications.email.frequency || 'instant');
        setProjectUpdates(settings.notifications.email.types.projectUpdates);
        setMeetingReminders(settings.notifications.email.types.deadlines);
        setNewsletters(settings.notifications.email.types.marketing);
      }

      // Pre-fill preferences
      if (settings?.preferences) {
        setTheme(settings.preferences.theme);
        setLanguage(settings.preferences.language);
        setTimezone(settings.preferences.timezone);
      }

      // Fetch billing data if subscription exists
      if (user.subscriptionId) {
        fetchBillingData(user.subscriptionId);
      }

      // Check 2FA status
      if (firebaseUser) {
        const twoFactorStatus = await twoFactorService.checkStatus(firebaseUser);
        setTwoFactorEnabled(twoFactorStatus.enabled);
        setTwoFactorMethods(twoFactorStatus.methods);

        // Update user settings if needed
        if (settings?.security?.twoFactorEnabled !== twoFactorStatus.enabled) {
          await userSettingsService.save({
            security: {
              ...settings?.security,
              twoFactorEnabled: twoFactorStatus.enabled,
              twoFactorMethods: twoFactorStatus.methods,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingSettings(false);
    }
  }, [user, firebaseUser]);

  // Fetch user settings and data on component mount
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchUserData();
    }
  }, [user, loading, router, fetchUserData]);

  const fetchBillingData = async (subscriptionId: string) => {
    try {
      // In a real app, you would fetch this from your billing service
      // For now, we'll check if there's billing data in Firestore
      const billingDoc = await getDoc(doc(db, 'billing', subscriptionId));
      if (billingDoc.exists()) {
        setBillingData(billingDoc.data());
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange mx-auto" />
          <p className="mt-4 text-white/60">Loading...</p>
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
        jobTitle,
        bio,
      });

      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Clear message after 3 seconds
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setProfileMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  // 2FA Functions
  const handle2FAToggle = async (checked: boolean) => {
    if (checked && !twoFactorEnabled) {
      // Start 2FA setup
      setShow2FASetup(true);
      await start2FASetup();
    } else if (!checked && twoFactorEnabled) {
      // Show disable dialog
      setShow2FADisable(true);
    }
  };

  const start2FASetup = async () => {
    if (!firebaseUser) return;

    setLoading2FA(true);
    try {
      // Start TOTP enrollment
      const { session, secret } = await twoFactorService.startTotpEnrollment(firebaseUser);
      setTotpSecret(secret);

      // Generate QR code
      const qrCode = await twoFactorService.generateQRCode(user!.email, secret);
      setQrCodeUrl(qrCode);

      // Generate backup codes
      const codes = twoFactorService.generateBackupCodes();
      setBackupCodes(codes);
    } catch (error: any) {
      console.error('Error starting 2FA setup:', error);
      setShow2FASetup(false);
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to start 2FA setup' });
    } finally {
      setLoading2FA(false);
    }
  };

  const complete2FASetup = async () => {
    if (!firebaseUser || !totpSecret || !verificationCode) return;

    setLoading2FA(true);
    try {
      // Verify and enroll TOTP
      await twoFactorService.completeTotpEnrollment(
        firebaseUser,
        totpSecret,
        verificationCode,
        'Authenticator App'
      );

      // Store backup codes
      await twoFactorService.storeBackupCodes(user!.uid, backupCodes);

      // Update user settings
      await userSettingsService.save({
        security: {
          twoFactorEnabled: true,
          twoFactorMethods: ['totp'],
          backupCodesGeneratedAt: new Date(),
        },
      });

      setTwoFactorEnabled(true);
      setTwoFactorMethods(['totp']);
      setShow2FASetup(false);
      setShowBackupCodes(true);

      setPasswordMessage({ type: 'success', text: '2FA enabled successfully!' });
    } catch (error: any) {
      console.error('Error completing 2FA setup:', error);
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to complete 2FA setup' });
    } finally {
      setLoading2FA(false);
      setVerificationCode('');
    }
  };

  const disable2FA = async () => {
    if (!firebaseUser || !disablePassword) return;

    setLoading2FA(true);
    try {
      await twoFactorService.disable2FA(firebaseUser, disablePassword);

      // Update user settings
      await userSettingsService.save({
        security: {
          twoFactorEnabled: false,
          twoFactorMethods: [],
          backupCodes: [],
        },
      });

      setTwoFactorEnabled(false);
      setTwoFactorMethods([]);
      setShow2FADisable(false);
      setDisablePassword('');

      setPasswordMessage({ type: 'success', text: '2FA disabled successfully!' });
    } catch (error: any) {
      console.error('Error disabling 2FA:', error);
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to disable 2FA' });
    } finally {
      setLoading2FA(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setPasswordMessage({ type: 'success', text: 'Backup codes copied to clipboard!' });
    setTimeout(() => setPasswordMessage(null), 3000);
  };

  const handlePasswordChange = async () => {
    if (!firebaseUser || !currentPassword || !newPassword) return;

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSavingPassword(true);
    setPasswordMessage(null);

    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(user!.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);

      // Update password
      await updatePassword(firebaseUser, newPassword);

      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Clear message after 3 seconds
      setTimeout(() => setPasswordMessage(null), 3000);
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        setPasswordMessage({ type: 'error', text: 'Current password is incorrect' });
      } else {
        setPasswordMessage({ type: 'error', text: error.message || 'Failed to update password' });
      }
    } finally {
      setSavingPassword(false);
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
          frequency: emailFrequency,
          types: {
            messages: true,
            projectUpdates,
            taskAssignments: true,
            mentions: true,
            deadlines: meetingReminders,
            systemAlerts: true,
            marketing: newsletters,
          },
        },
        push: {
          enabled: pushNotifications,
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
          enabled: smsNotifications,
          types: {
            messages: false,
            projectUpdates: false,
            taskAssignments: false,
            mentions: false,
            deadlines: true,
            systemAlerts: true,
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

      setNotificationMessage({ type: 'success', text: 'Notification preferences saved!' });

      // Clear message after 3 seconds
      setTimeout(() => setNotificationMessage(null), 3000);
    } catch (error: any) {
      console.error('Error updating notifications:', error);
      setNotificationMessage({
        type: 'error',
        text: error.message || 'Failed to update notifications',
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
      setAvatarMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarMessage({ type: 'error', text: 'Image must be less than 5MB' });
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
      setAvatarMessage({ type: 'success', text: 'Profile photo updated!' });

      // Clear message after 3 seconds
      setTimeout(() => setAvatarMessage(null), 3000);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setAvatarMessage({ type: 'error', text: error.message || 'Failed to upload photo' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteDialogOpen = async () => {
    setShowDeleteDialog(true);
    setDeleteError(null);
    setDeleteConfirmEmail('');
    setDeletePassword('');
    setDeletionProgress(null);

    // Fetch data summary
    if (user) {
      try {
        const summary = await accountDeletionService.getDataSummary(user.uid);
        setDataSummary(summary);
      } catch (error) {
        console.error('Error fetching data summary:', error);
      }
    }
  };

  const handleAccountDeletion = async () => {
    if (!user || !deletePassword || deleteConfirmEmail !== user.email) {
      setDeleteError('Please enter your email and password correctly');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await accountDeletionService.deleteAccount(
        user.email,
        deletePassword,
        (progress) => setDeletionProgress(progress)
      );

      if (result.success) {
        // Sign out and redirect to home with success message
        await auth.signOut();
        router.push('/?accountDeleted=true');
      } else {
        setDeleteError(result.error || 'Failed to delete account');
        setDeletionProgress(null);
      }
    } catch (error: any) {
      console.error('Account deletion error:', error);
      setDeleteError(error.message || 'An unexpected error occurred');
      setDeletionProgress(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 mt-20 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white/60 hover:text-white mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-white/60 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="profile" className="data-[state=active]:bg-orange">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-orange">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-orange">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            {(user.subscriptionId || billingData) && (
              <TabsTrigger value="billing" className="data-[state=active]:bg-orange">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </TabsTrigger>
            )}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>

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
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarUrl || user.photoURL || ''} alt="Profile" />
                  <AvatarFallback className="bg-orange text-white text-2xl">
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
                    Change Photo
                  </Button>
                  <p className="text-xs text-white/40 mt-2">JPG, PNG or GIF. Max size 5MB</p>
                  {avatarMessage && (
                    <p
                      className={`text-xs mt-1 ${avatarMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {avatarMessage.text}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-white">
                    First Name
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
                    Last Name
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
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 bg-white/5 border-white/20 text-white"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="text-white">
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-2 bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle" className="text-white">
                    Job Title
                  </Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="mt-2 bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bio" className="text-white">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about yourself..."
                    className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    rows={4}
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
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>

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
                          notificationMessage.type === 'success' ? 'text-green-500' : 'text-red-500'
                        }
                      >
                        {notificationMessage.text}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-white mb-4">Notification Channels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-white/60" />
                        <div>
                          <p className="text-white">Email Notifications</p>
                          <p className="text-sm text-white/60">Receive updates via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-white/60" />
                        <div>
                          <p className="text-white">Push Notifications</p>
                          <p className="text-sm text-white/60">Receive browser notifications</p>
                        </div>
                      </div>
                      <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-5 h-5 text-white/60" />
                        <div>
                          <p className="text-white">SMS Notifications</p>
                          <p className="text-sm text-white/60">
                            Receive text messages for urgent updates
                          </p>
                        </div>
                      </div>
                      <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="font-medium text-white mb-4">Notification Types</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Project Updates</p>
                        <p className="text-sm text-white/60">Updates about your project progress</p>
                      </div>
                      <Switch checked={projectUpdates} onCheckedChange={setProjectUpdates} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Meeting Reminders</p>
                        <p className="text-sm text-white/60">Reminders before scheduled meetings</p>
                      </div>
                      <Switch checked={meetingReminders} onCheckedChange={setMeetingReminders} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Newsletters</p>
                        <p className="text-sm text-white/60">Monthly insights and AI trends</p>
                      </div>
                      <Switch checked={newsletters} onCheckedChange={setNewsletters} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="font-medium text-white mb-4">Email Frequency</h3>
                  <RadioGroup
                    value={emailFrequency}
                    onValueChange={(value: any) => setEmailFrequency(value)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="instant" id="instant" />
                        <Label htmlFor="instant" className="text-white cursor-pointer">
                          Instant
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hourly" id="hourly" />
                        <Label htmlFor="hourly" className="text-white cursor-pointer">
                          Hourly digest
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily" className="text-white cursor-pointer">
                          Daily digest
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly" className="text-white cursor-pointer">
                          Weekly digest
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
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
                    Save Preferences
                  </Button>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>

              {/* Success/Error Messages */}
              <AnimatePresence>
                {passwordMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6"
                  >
                    <Alert
                      className={
                        passwordMessage.type === 'success'
                          ? 'bg-green-500/10 border-green-500/50'
                          : 'bg-red-500/10 border-red-500/50'
                      }
                    >
                      {passwordMessage.type === 'success' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <AlertDescription
                        className={
                          passwordMessage.type === 'success' ? 'text-green-500' : 'text-red-500'
                        }
                      >
                        {passwordMessage.text}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-white mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword" className="text-white">
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-2 bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword" className="text-white">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-2 bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-white">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-2 bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <Button
                      onClick={handlePasswordChange}
                      className="bg-orange hover:bg-orange/90"
                      disabled={
                        savingPassword || !currentPassword || !newPassword || !confirmPassword
                      }
                    >
                      {savingPassword ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4 mr-2" />
                      )}
                      Update Password
                    </Button>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="font-medium text-white mb-4">Two-Factor Authentication</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-white/60" />
                        <div>
                          <p className="text-white">Two-Factor Authentication</p>
                          <p className="text-sm text-white/60">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                      </div>
                      <Switch checked={twoFactorEnabled} onCheckedChange={handle2FAToggle} />
                    </div>

                    {twoFactorEnabled && (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center space-x-2 text-green-500">
                          <Check className="w-4 h-4" />
                          <p className="text-sm font-medium">2FA is enabled</p>
                        </div>
                        <p className="text-sm text-white/60 mt-1">
                          Your account is protected with authenticator app verification
                        </p>
                        {twoFactorMethods.includes('totp') && (
                          <div className="mt-3 flex items-center space-x-2">
                            <Smartphone className="w-4 h-4 text-white/60" />
                            <span className="text-sm text-white/60">
                              Authenticator app configured
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 2FA Setup Dialog */}
                  <Dialog open={show2FASetup} onOpenChange={setShow2FASetup}>
                    <DialogContent className="bg-black border-white/10 text-white max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                          Enable Two-Factor Authentication
                        </DialogTitle>
                        <DialogDescription className="text-white/60">
                          Scan the QR code with your authenticator app to set up 2FA
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        {qrCodeUrl && !showBackupCodes && (
                          <>
                            <div className="flex justify-center p-4 bg-white rounded-lg">
                              <Image src={qrCodeUrl} alt="2FA QR Code" width={192} height={192} />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="verificationCode" className="text-white">
                                Enter verification code from your app
                              </Label>
                              <Input
                                id="verificationCode"
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="000000"
                                className="bg-white/5 border-white/20 text-white text-center text-lg"
                                maxLength={6}
                              />
                            </div>
                          </>
                        )}

                        {showBackupCodes && (
                          <div className="space-y-4">
                            <Alert className="bg-green-500/10 border-green-500/50">
                              <Check className="h-4 w-4 text-green-500" />
                              <AlertDescription className="text-green-500">
                                2FA has been successfully enabled!
                              </AlertDescription>
                            </Alert>

                            <div>
                              <h4 className="font-medium text-white mb-2">
                                Save your backup codes
                              </h4>
                              <p className="text-sm text-white/60 mb-4">
                                Store these codes in a safe place. You can use them to access your
                                account if you lose your authenticator device.
                              </p>

                              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                                  {backupCodes.map((code, index) => (
                                    <div key={index} className="text-white/80">
                                      {code}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <Button
                                onClick={copyBackupCodes}
                                variant="outline"
                                size="sm"
                                className="mt-3 w-full"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy backup codes
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        {!showBackupCodes ? (
                          <>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setShow2FASetup(false);
                                setVerificationCode('');
                              }}
                              disabled={loading2FA}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={complete2FASetup}
                              className="bg-orange hover:bg-orange/90"
                              disabled={loading2FA || verificationCode.length !== 6}
                            >
                              {loading2FA ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Shield className="w-4 h-4 mr-2" />
                              )}
                              Verify & Enable
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => {
                              setShow2FASetup(false);
                              setShowBackupCodes(false);
                            }}
                            className="bg-orange hover:bg-orange/90 w-full"
                          >
                            Done
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* 2FA Disable Dialog */}
                  <Dialog open={show2FADisable} onOpenChange={setShow2FADisable}>
                    <DialogContent className="bg-black border-white/10 text-white max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                          Disable Two-Factor Authentication
                        </DialogTitle>
                        <DialogDescription className="text-white/60">
                          Enter your password to disable 2FA. This will make your account less
                          secure.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <Alert className="bg-yellow-500/10 border-yellow-500/50">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <AlertDescription className="text-yellow-500">
                            Disabling 2FA will remove an important security layer from your account
                          </AlertDescription>
                        </Alert>

                        <div>
                          <Label htmlFor="disablePassword" className="text-white">
                            Confirm your password
                          </Label>
                          <Input
                            id="disablePassword"
                            type="password"
                            value={disablePassword}
                            onChange={(e) => setDisablePassword(e.target.value)}
                            className="mt-2 bg-white/5 border-white/20 text-white"
                            placeholder="Enter your password"
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setShow2FADisable(false);
                            setDisablePassword('');
                          }}
                          disabled={loading2FA}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={disable2FA}
                          variant="destructive"
                          disabled={loading2FA || !disablePassword}
                        >
                          {loading2FA ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          Disable 2FA
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="font-medium text-red-500 mb-4">Danger Zone</h3>
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">Delete Account</h4>
                        <p className="text-sm text-white/60 mb-4">
                          Once you delete your account, there is no going back. All your data will
                          be permanently removed.
                        </p>
                        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="bg-red-500/20 border-red-500/50 text-red-500 hover:bg-red-500/30 hover:border-red-500"
                              onClick={handleDeleteDialogOpen}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Account
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-black border-white/10 text-white max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold text-red-500">
                                Delete Account
                              </DialogTitle>
                              <DialogDescription className="text-white/60">
                                This action cannot be undone. This will permanently delete your
                                account and remove all associated data.
                              </DialogDescription>
                            </DialogHeader>

                            {!deletionProgress ? (
                              <div className="space-y-4">
                                {/* Data Summary */}
                                {dataSummary && (
                                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <h4 className="font-medium text-white mb-2">
                                      What will be deleted:
                                    </h4>
                                    <ul className="space-y-1 text-sm text-white/60">
                                      <li>• {dataSummary.documentCount} documents</li>
                                      <li>• {dataSummary.projectCount} projects</li>
                                      <li>• {dataSummary.meetingCount} meetings</li>
                                      <li>
                                        • {formatBytes(dataSummary.storageUsed)} of stored files
                                      </li>
                                      <li>• All personal information and settings</li>
                                      <li>• Your subscription and billing history</li>
                                    </ul>
                                  </div>
                                )}

                                {/* Error Message */}
                                {deleteError && (
                                  <Alert className="bg-red-500/10 border-red-500/50">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <AlertDescription className="text-red-500">
                                      {deleteError}
                                    </AlertDescription>
                                  </Alert>
                                )}

                                {/* Email Confirmation */}
                                <div>
                                  <Label htmlFor="deleteEmail" className="text-white">
                                    Type <span className="font-mono text-orange">{user.email}</span>{' '}
                                    to confirm
                                  </Label>
                                  <Input
                                    id="deleteEmail"
                                    type="email"
                                    value={deleteConfirmEmail}
                                    onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="mt-2 bg-white/5 border-white/20 text-white"
                                  />
                                </div>

                                {/* Password Confirmation */}
                                <div>
                                  <Label htmlFor="deletePassword" className="text-white">
                                    Enter your password
                                  </Label>
                                  <Input
                                    id="deletePassword"
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="mt-2 bg-white/5 border-white/20 text-white"
                                  />
                                </div>

                                <DialogFooter className="mt-6">
                                  <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteDialog(false)}
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleAccountDeletion}
                                    disabled={
                                      isDeleting ||
                                      deleteConfirmEmail !== user.email ||
                                      !deletePassword
                                    }
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    {isDeleting ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Account
                                      </>
                                    )}
                                  </Button>
                                </DialogFooter>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="text-center py-4">
                                  <Loader2 className="w-12 h-12 animate-spin text-orange mx-auto mb-4" />
                                  <p className="text-white font-medium">
                                    {deletionProgress.status}
                                  </p>
                                  <Progress
                                    value={deletionProgress.percentage}
                                    className="mt-4 bg-white/10"
                                  />
                                  <p className="text-sm text-white/60 mt-2">
                                    {deletionProgress.percentage}%
                                  </p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Billing Tab - Only show if user has billing data */}
          {(user.subscriptionId || billingData) && (
            <TabsContent value="billing" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Billing Information</h2>

                {loadingSettings ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-orange" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {user.subscriptionPlan && (
                      <div className="p-4 bg-orange/20 rounded-lg border border-orange/30">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-white">Current Plan</h3>
                          <Badge className="bg-orange text-white capitalize">
                            {user.subscriptionPlan}
                          </Badge>
                        </div>
                        {billingData?.nextBillingDate && (
                          <p className="text-sm text-white/60 mb-4">
                            Your next billing date is{' '}
                            {new Date(
                              billingData.nextBillingDate.seconds * 1000
                            ).toLocaleDateString()}
                          </p>
                        )}
                        <Button variant="outline" size="sm">
                          Manage Subscription
                        </Button>
                      </div>
                    )}

                    {billingData?.paymentMethod && (
                      <div>
                        <h3 className="font-medium text-white mb-4">Payment Method</h3>
                        <div className="p-4 bg-white/5 rounded-lg flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="w-5 h-5 text-white/60" />
                            <div>
                              <p className="text-white">
                                •••• •••• •••• {billingData.paymentMethod.last4}
                              </p>
                              <p className="text-sm text-white/60">
                                Expires {billingData.paymentMethod.expMonth}/
                                {billingData.paymentMethod.expYear}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Update
                          </Button>
                        </div>
                      </div>
                    )}

                    {billingData?.invoices && billingData.invoices.length > 0 && (
                      <div>
                        <h3 className="font-medium text-white mb-4">Billing History</h3>
                        <div className="space-y-2">
                          {billingData.invoices.map((invoice: any) => (
                            <div
                              key={invoice.id}
                              className="p-3 bg-white/5 rounded-lg flex items-center justify-between"
                            >
                              <div>
                                <p className="text-white text-sm">
                                  {new Date(invoice.created * 1000).toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </p>
                                <p className="text-xs text-white/60">{invoice.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white">€{(invoice.amount / 100).toFixed(2)}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => window.open(invoice.invoicePdf, '_blank')}
                                >
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </main>
  );
}
