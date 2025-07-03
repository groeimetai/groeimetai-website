import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

// OAuth configuration
export const oauthConfig = {
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/auth/callback/google',
    scope: ['openid', 'email', 'profile']
  },
  linkedin: {
    clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/auth/callback/linkedin',
    scope: ['openid', 'profile', 'email']
  }
};

// Google OAuth client
const googleClient = new OAuth2Client(
  oauthConfig.google.clientId,
  oauthConfig.google.clientSecret,
  oauthConfig.google.redirectUri
);

/**
 * Generate OAuth state parameter for CSRF protection
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Store OAuth state in session
 */
const oauthStates = new Map<string, { state: string; expiry: number }>();

export function storeOAuthState(sessionId: string, state: string): void {
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  oauthStates.set(sessionId, { state, expiry });
  
  // Clean up expired states
  Array.from(oauthStates.entries()).forEach(([key, value]) => {
    if (value.expiry < Date.now()) {
      oauthStates.delete(key);
    }
  });
}

/**
 * Verify OAuth state
 */
export function verifyOAuthState(sessionId: string, state: string): boolean {
  const storedData = oauthStates.get(sessionId);
  
  if (!storedData) {
    return false;
  }
  
  // Check expiry
  if (storedData.expiry < Date.now()) {
    oauthStates.delete(sessionId);
    return false;
  }
  
  // Verify state
  const isValid = storedData.state === state;
  
  // Remove state after verification (one-time use)
  oauthStates.delete(sessionId);
  
  return isValid;
}

/**
 * Generate Google OAuth URL
 */
export function getGoogleAuthUrl(state: string): string {
  return googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: oauthConfig.google.scope,
    state: state,
    prompt: 'consent'
  });
}

/**
 * Verify Google ID token
 */
export async function verifyGoogleToken(idToken: string) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: oauthConfig.google.clientId
    });
    
    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new Error('Invalid token payload');
    }
    
    return {
      id: payload.sub,
      email: payload.email!,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    throw new Error('Invalid Google token');
  }
}

/**
 * Exchange authorization code for tokens (Google)
 */
export async function exchangeGoogleCode(code: string) {
  try {
    const { tokens } = await googleClient.getToken(code);
    
    if (!tokens.id_token) {
      throw new Error('No ID token received');
    }
    
    // Verify and decode the ID token
    const userInfo = await verifyGoogleToken(tokens.id_token);
    
    return {
      tokens,
      userInfo
    };
  } catch (error) {
    console.error('Google code exchange failed:', error);
    throw new Error('Failed to exchange authorization code');
  }
}

/**
 * Generate LinkedIn OAuth URL
 */
export function getLinkedInAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: oauthConfig.linkedin.clientId,
    redirect_uri: oauthConfig.linkedin.redirectUri,
    state: state,
    scope: oauthConfig.linkedin.scope.join(' ')
  });
  
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens (LinkedIn)
 */
export async function exchangeLinkedInCode(code: string) {
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: oauthConfig.linkedin.redirectUri,
        client_id: oauthConfig.linkedin.clientId,
        client_secret: oauthConfig.linkedin.clientSecret
      })
    });
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }
    
    const tokens = await tokenResponse.json();
    
    // Get user profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });
    
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    const profile = await profileResponse.json();
    
    return {
      tokens,
      userInfo: {
        id: profile.sub,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        emailVerified: profile.email_verified
      }
    };
  } catch (error) {
    console.error('LinkedIn code exchange failed:', error);
    throw new Error('Failed to exchange authorization code');
  }
}

/**
 * Validate OAuth redirect URI
 */
export function validateRedirectUri(uri: string, provider: 'google' | 'linkedin'): boolean {
  const allowedUris = [
    oauthConfig[provider].redirectUri,
    // Add development URIs if needed
    ...(process.env.NODE_ENV === 'development' ? [
      'http://localhost:3000/api/auth/callback/' + provider
    ] : [])
  ];
  
  return allowedUris.includes(uri);
}

/**
 * OAuth error codes
 */
export const OAuthError = {
  INVALID_STATE: 'invalid_state',
  INVALID_CODE: 'invalid_code',
  INVALID_TOKEN: 'invalid_token',
  EXCHANGE_FAILED: 'exchange_failed',
  PROFILE_FETCH_FAILED: 'profile_fetch_failed',
  EMAIL_NOT_VERIFIED: 'email_not_verified',
  ACCOUNT_LINKING_FAILED: 'account_linking_failed'
} as const;

/**
 * Create OAuth error response
 */
export function createOAuthError(error: keyof typeof OAuthError, description?: string) {
  return {
    error: OAuthError[error],
    error_description: description || getOAuthErrorDescription(error)
  };
}

/**
 * Get OAuth error description
 */
function getOAuthErrorDescription(error: keyof typeof OAuthError): string {
  const descriptions = {
    INVALID_STATE: 'The OAuth state parameter is invalid or expired',
    INVALID_CODE: 'The authorization code is invalid or expired',
    INVALID_TOKEN: 'The OAuth token is invalid or expired',
    EXCHANGE_FAILED: 'Failed to exchange authorization code for tokens',
    PROFILE_FETCH_FAILED: 'Failed to fetch user profile from OAuth provider',
    EMAIL_NOT_VERIFIED: 'Email address is not verified by the OAuth provider',
    ACCOUNT_LINKING_FAILED: 'Failed to link OAuth account with existing user'
  };
  
  return descriptions[error] || 'An OAuth error occurred';
}