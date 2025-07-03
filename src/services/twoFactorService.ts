import { auth } from '@/lib/firebase/config';
import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  getMultiFactorResolver,
  User,
  TotpMultiFactorGenerator,
  TotpSecret,
  MultiFactorSession,
} from 'firebase/auth';
import QRCode from 'qrcode';

export interface TwoFactorSetupData {
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
}

export interface TwoFactorStatus {
  enabled: boolean;
  methods: string[];
  enrolledFactors: Array<{
    uid: string;
    displayName?: string;
    enrollmentTime: string;
    factorId: string;
  }>;
}

class TwoFactorService {
  /**
   * Check if 2FA is enabled for the current user
   */
  async checkStatus(user: User | null): Promise<TwoFactorStatus> {
    if (!user) {
      return {
        enabled: false,
        methods: [],
        enrolledFactors: [],
      };
    }

    const multiFactorUser = multiFactor(user);
    const enrolledFactors = multiFactorUser.enrolledFactors;

    return {
      enabled: enrolledFactors.length > 0,
      methods: enrolledFactors.map((factor) => factor.factorId),
      enrolledFactors: enrolledFactors.map((factor) => ({
        uid: factor.uid,
        displayName: factor.displayName || undefined,
        enrollmentTime: factor.enrollmentTime || new Date().toISOString(),
        factorId: factor.factorId,
      })),
    };
  }

  /**
   * Start TOTP enrollment process
   */
  async startTotpEnrollment(
    user: User
  ): Promise<{ session: MultiFactorSession; secret: TotpSecret }> {
    const multiFactorUser = multiFactor(user);
    const session = await multiFactorUser.getSession();

    // Generate TOTP secret
    const secret = await TotpMultiFactorGenerator.generateSecret(session);

    return { session, secret };
  }

  /**
   * Generate QR code for TOTP setup
   */
  async generateQRCode(email: string, secret: TotpSecret): Promise<string> {
    // Generate the otpauth URL for the authenticator app
    const otpauthUrl = secret.generateQrCodeUrl(email, 'GroeimetAI');

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrCodeDataUrl;
  }

  /**
   * Complete TOTP enrollment with verification code
   */
  async completeTotpEnrollment(
    user: User,
    secret: TotpSecret,
    verificationCode: string,
    displayName?: string
  ): Promise<void> {
    const multiFactorUser = multiFactor(user);

    // Generate TOTP assertion
    const multiFactorAssertion = await TotpMultiFactorGenerator.assertionForEnrollment(
      secret,
      verificationCode
    );

    // Enroll the TOTP factor
    await multiFactorUser.enroll(multiFactorAssertion, displayName || 'Authenticator App');
  }

  /**
   * Generate backup codes for account recovery
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < count; i++) {
      let code = '';
      for (let j = 0; j < 8; j++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
        if (j === 3) code += '-'; // Add hyphen in middle for readability
      }
      codes.push(code);
    }

    return codes;
  }

  /**
   * Verify TOTP code during sign-in
   */
  async verifyTotpCode(multiFactorResolver: any, verificationCode: string): Promise<any> {
    // Get the first hint (we're assuming TOTP is the first factor)
    const multiFactorHint = multiFactorResolver.hints[0];

    // Generate TOTP assertion
    const multiFactorAssertion = await TotpMultiFactorGenerator.assertionForSignIn(
      multiFactorHint.uid,
      verificationCode
    );

    // Complete sign-in
    return await multiFactorResolver.resolveSignIn(multiFactorAssertion);
  }

  /**
   * Disable 2FA by unenrolling all factors
   */
  async disable2FA(user: User, password: string): Promise<void> {
    // Re-authenticate user before making security changes
    const { EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');
    const credential = EmailAuthProvider.credential(user.email!, password);
    await reauthenticateWithCredential(user, credential);

    // Unenroll all factors
    const multiFactorUser = multiFactor(user);
    const enrolledFactors = multiFactorUser.enrolledFactors;

    for (const factor of enrolledFactors) {
      await multiFactorUser.unenroll(factor);
    }
  }

  /**
   * Remove a specific 2FA method
   */
  async removeFactorByUid(user: User, factorUid: string): Promise<void> {
    const multiFactorUser = multiFactor(user);
    const factor = multiFactorUser.enrolledFactors.find((f) => f.uid === factorUid);

    if (factor) {
      await multiFactorUser.unenroll(factor);
    }
  }

  /**
   * Store backup codes securely (this should be encrypted in production)
   */
  async storeBackupCodes(userId: string, codes: string[]): Promise<void> {
    // In production, these should be encrypted before storing
    // For now, we'll store them in Firestore with the user's settings
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/config');

    const userSettingsRef = doc(db, 'userSettings', userId);
    await updateDoc(userSettingsRef, {
      'security.backupCodes': codes,
      'security.backupCodesGeneratedAt': new Date(),
    });
  }

  /**
   * Validate a backup code
   */
  async validateBackupCode(userId: string, code: string): Promise<boolean> {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/config');

    const userSettingsRef = doc(db, 'userSettings', userId);
    const settingsDoc = await getDoc(userSettingsRef);

    if (!settingsDoc.exists()) {
      return false;
    }

    const data = settingsDoc.data();
    const backupCodes = data?.security?.backupCodes || [];

    return backupCodes.includes(code);
  }

  /**
   * Use a backup code (remove it after use)
   */
  async useBackupCode(userId: string, code: string): Promise<boolean> {
    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase/config');

    const userSettingsRef = doc(db, 'userSettings', userId);
    const settingsDoc = await getDoc(userSettingsRef);

    if (!settingsDoc.exists()) {
      return false;
    }

    const data = settingsDoc.data();
    const backupCodes = data?.security?.backupCodes || [];

    if (backupCodes.includes(code)) {
      // Remove the used code
      const updatedCodes = backupCodes.filter((c: string) => c !== code);
      await updateDoc(userSettingsRef, {
        'security.backupCodes': updatedCodes,
        'security.lastBackupCodeUsedAt': new Date(),
      });
      return true;
    }

    return false;
  }
}

// Export singleton instance
export const twoFactorService = new TwoFactorService();

// Export types
export type { TotpSecret };
