'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { generateAvatarDataUri } from '@/lib/utils/avatar';
import { format } from 'date-fns';
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Lock,
  User,
  Building,
  Briefcase,
  Phone,
  Globe,
  Shield,
  Hash,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/toaster';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserRole } from '@/types';

interface NewUserData {
  email: string;
  password: string;
  displayName: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  phoneNumber: string;
  role: UserRole;
  accountType: 'customer' | 'guest' | 'admin';
  isActive: boolean;
  sendWelcomeEmail: boolean;
  website: string;
  bio: string;
}

export default function NewUserPage() {
  const router = useRouter();
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const [userData, setUserData] = useState<NewUserData>({
    email: '',
    password: '',
    displayName: '',
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    phoneNumber: '',
    role: 'client',
    accountType: 'customer',
    isActive: true,
    sendWelcomeEmail: true,
    website: '',
    bio: '',
  });

  // Generate avatar preview when display name changes
  useEffect(() => {
    if (userData.displayName) {
      const avatarDataUri = generateAvatarDataUri(userData.displayName);
      setAvatarPreview(avatarDataUri);
    }
  }, [userData.displayName]);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [currentUser, isAdmin, authLoading, router]);

  const handleCreateUser = async () => {
    // Validation
    if (!userData.email || !userData.password || !userData.displayName) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        type: 'error',
      });
      return;
    }

    if (userData.password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long',
        type: 'error',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const userId = userCredential.user.uid;

      // Generate avatar for the user
      const avatarDataUri = generateAvatarDataUri(userData.displayName);

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userId), {
        uid: userId,
        email: userData.email,
        displayName: userData.displayName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        photoURL: avatarDataUri, // Auto-generated avatar
        company: userData.company,
        jobTitle: userData.jobTitle,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        accountType: userData.accountType,
        isActive: userData.isActive,
        isVerified: false,
        website: userData.website,
        bio: userData.bio,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        lastActivityAt: new Date(),
        preferences: {
          language: 'nl',
          timezone: 'Europe/Amsterdam',
          theme: 'dark',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
        },
        stats: {
          projectsCount: 0,
          consultationsCount: 0,
          messagesCount: 0,
          totalSpent: 0,
        },
        metadata: {
          createdBy: currentUser?.uid,
          createdByRole: 'admin',
          source: 'admin_panel',
        },
      });

      // Send welcome email if requested
      if (userData.sendWelcomeEmail) {
        // TODO: Implement welcome email
        console.log('Send welcome email to:', userData.email);
      }

      toast({
        title: 'User created successfully',
        description: `${userData.displayName} has been added to the system`,
      });

      // Redirect to users list
      router.push('/dashboard/admin/users');
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      let errorMessage = 'Failed to create user. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password';
      }

      toast({
        title: 'Creation failed',
        description: errorMessage,
        type: 'error',
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange animate-spin mx-auto" />
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 mt-20 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/admin/users')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">Create New User</h1>
          <p className="text-white/60">Add a new user to the system</p>
        </div>

        {/* Form */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">User Information</CardTitle>
            <CardDescription className="text-white/60">
              Fill in the details for the new user account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex justify-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarPreview} alt={userData.displayName} />
                <AvatarFallback className="bg-orange/20 text-orange text-2xl">
                  {userData.displayName.charAt(0) || <User className="w-12 h-12" />}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-white">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password" className="text-white">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="password"
                      type="password"
                      value={userData.password}
                      onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white"
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="displayName" className="text-white">
                    Display Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="displayName"
                      value={userData.displayName}
                      onChange={(e) => setUserData({ ...userData, displayName: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="firstName" className="text-white">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={userData.firstName}
                    onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-white">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={userData.lastName}
                    onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber" className="text-white">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={userData.phoneNumber}
                      onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white"
                      placeholder="+31 6 12345678"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website" className="text-white">
                    Website
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="website"
                      type="url"
                      value={userData.website}
                      onChange={(e) => setUserData({ ...userData, website: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="bio" className="text-white">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={userData.bio}
                  onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                  placeholder="A brief description about the user..."
                />
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company" className="text-white">
                    Company
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="company"
                      value={userData.company}
                      onChange={(e) => setUserData({ ...userData, company: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white"
                      placeholder="Company Name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="jobTitle" className="text-white">
                    Job Title
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="jobTitle"
                      value={userData.jobTitle}
                      onChange={(e) => setUserData({ ...userData, jobTitle: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white"
                      placeholder="CEO, Developer, etc."
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Account Settings */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role" className="text-white">
                    User Role
                  </Label>
                  <Select
                    value={userData.role}
                    onValueChange={(value) => setUserData({ ...userData, role: value as UserRole })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accountType" className="text-white">
                    Account Type
                  </Label>
                  <Select
                    value={userData.accountType}
                    onValueChange={(value) =>
                      setUserData({ ...userData, accountType: value as any })
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive" className="text-white">
                      Account Active
                    </Label>
                    <p className="text-sm text-white/60">User can immediately access the platform</p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={userData.isActive}
                    onCheckedChange={(checked) => setUserData({ ...userData, isActive: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sendWelcomeEmail" className="text-white">
                      Send Welcome Email
                    </Label>
                    <p className="text-sm text-white/60">
                      Send an email with login instructions to the user
                    </p>
                  </div>
                  <Switch
                    id="sendWelcomeEmail"
                    checked={userData.sendWelcomeEmail}
                    onCheckedChange={(checked) =>
                      setUserData({ ...userData, sendWelcomeEmail: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/admin/users')}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                className="bg-orange hover:bg-orange/90"
                onClick={handleCreateUser}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating User...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}