// Cryptographic Authentication Module
// All passwords, usernames, and identity credentials are encrypted and salted.
// Plaintext credentials do NOT appear in the source code.

import { UserRole } from './rbac';

const SALT = 'maternity_nursing_salt_2026_nis';

// Helper to convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Helper to convert ArrayBuffer/Uint8Array to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Cryptographic SHA-256 Hashing with Salt
export async function computeAuthHash(role: string, username: string, pass: string): Promise<string> {
  const normalized = `${role.toLowerCase()}:${username.trim().toLowerCase()}:${pass.trim()}:${SALT}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return bytesToHex(new Uint8Array(hashBuffer));
  } else {
    // Fallback if subtle is unavailable (e.g. non-secure local context)
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash.toString(16);
  }
}

// AES-256-GCM Secure Decryption of Identity Profiles
async function decryptProfileName(
  username: string, 
  pass: string, 
  encData: { iv: string; tag: string; enc: string }
): Promise<string | null> {
  try {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      return null;
    }
    const encoder = new TextEncoder();
    const keySource = encoder.encode(`${username.trim().toLowerCase()}:${pass.trim()}:name_key`);
    const keyRaw = await window.crypto.subtle.digest('SHA-256', keySource);
    const key = await window.crypto.subtle.importKey('raw', keyRaw, { name: 'AES-GCM' }, false, ['decrypt']);

    const iv = hexToBytes(encData.iv);
    const cipher = hexToBytes(encData.enc);
    const tag = hexToBytes(encData.tag);

    const combined = new Uint8Array(cipher.length + tag.length);
    combined.set(cipher);
    combined.set(tag, cipher.length);

    const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, combined);
    return new TextDecoder().decode(decrypted);
  } catch (err) {
    return null;
  }
}

// Precomputed Salted SHA-256 Hashes and AES-256-GCM encrypted identities
interface SecureCredentialRecord {
  role: UserRole;
  authHash: string;
  encryptedProfile: {
    iv: string;
    tag: string;
    enc: string;
  };
}

const SECURE_CREDENTIAL_STORE: SecureCredentialRecord[] = [
  {
    role: 'instructor',
    authHash: '6e060c9f082b2d7a1120c592417ac808084c5e0255b904ba25e1ec0d5d68a0bc',
    encryptedProfile: {
      iv: '5b4ece7d5705f7ed23407311',
      tag: 'f1a151c2313bc71f10de9b99b4f4a366',
      enc: '091787e8ce844841c3',
    },
  },
  {
    role: 'admin',
    authHash: '2f8aed7b254a03d3fae9b161db0f988e1e700c38d0179abe8c8238bcf6b72451',
    encryptedProfile: {
      iv: 'a74c0645075b30a333d73052',
      tag: '5bf1d257ba982738a27a80f7f846253f',
      enc: '886ccebcaafceb5aab',
    },
  },
];

export interface AuthResult {
  success: boolean;
  role?: UserRole;
  name?: string;
  error?: string;
}

/**
 * Authenticates user credentials via cryptographic hash and decrypts verified identity profile.
 */
export async function authenticateCredentials(
  selectedRole: 'instructor' | 'admin',
  accountInput: string,
  passwordInput: string
): Promise<AuthResult> {
  const cleanAccount = accountInput.trim();
  const cleanPass = passwordInput.trim();

  if (!cleanAccount) {
    return { success: false, error: '請輸入認證帳號' };
  }
  if (!cleanPass) {
    return { success: false, error: '請輸入安全密碼' };
  }

  try {
    const computedHash = await computeAuthHash(selectedRole, cleanAccount, cleanPass);
    const matchedRecord = SECURE_CREDENTIAL_STORE.find(
      (entry) => entry.role === selectedRole && entry.authHash === computedHash
    );

    if (!matchedRecord) {
      return {
        success: false,
        error: selectedRole === 'admin' 
          ? '管理員帳號或密碼驗證失敗，請確認後重新輸入。' 
          : '指導教師帳號或密碼驗證失敗，請確認後重新輸入。',
      };
    }

    // Decrypt profile name with key derived from valid credentials
    const decryptedName = await decryptProfileName(cleanAccount, cleanPass, matchedRecord.encryptedProfile);
    const finalName = decryptedName || (selectedRole === 'admin' ? '系統管理員' : '指導教師');

    return {
      success: true,
      role: selectedRole,
      name: finalName,
    };
  } catch (e) {
    return {
      success: false,
      error: '驗證模組執行異常，請稍後重試。',
    };
  }
}
