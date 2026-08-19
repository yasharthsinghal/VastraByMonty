import { UserProfile } from '../types/auth.types';
import usersData from '../../../mock/data/users.json';
import { delay } from '../../../mock/delay';
import { env } from '../../../config/env';
import { shopifyCustomerService } from '../../../services/adapters/shopify/shopifyCustomerService';

const STORAGE_KEY = 'monts_auth_session';

// ---------------------------------------------------------------------------
// Shared interface
// ---------------------------------------------------------------------------
export interface IAuthService {
  login(email: string, password: string, rememberMe?: boolean): Promise<UserProfile>;
  register(email: string, password: string, firstName: string, lastName: string): Promise<UserProfile>;
  forgotPassword(email: string): Promise<void>;
  logout(): Promise<void>;
  getCurrentUser(): UserProfile | null;
}

// ---------------------------------------------------------------------------
// Mock (development / seed-data) implementation — unchanged
// ---------------------------------------------------------------------------
export class MockAuthService implements IAuthService {
  async login(email: string, password: string, rememberMe = true): Promise<UserProfile> {
    await delay(350);
    const users = (usersData as unknown) as (UserProfile & { password?: string })[];
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password. Please try again.');
    }

    const { password: _, ...profile } = user;
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
    return profile;
  }

  async register(email: string, _password: string, firstName: string, lastName: string): Promise<UserProfile> {
    await delay(400);
    const existing = ((usersData as unknown) as UserProfile[]).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      firstName,
      lastName,
      role: 'customer',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=8b7355&color=fff`,
      ordersCount: 0,
      addresses: [],
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  }

  async forgotPassword(email: string): Promise<void> {
    await delay(300);
    const user = ((usersData as unknown) as UserProfile[]).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) {
      throw new Error('No registered account found with this email address.');
    }
  }

  async logout(): Promise<void> {
    await delay(150);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  getCurrentUser(): UserProfile | null {
    const local = localStorage.getItem(STORAGE_KEY);
    const session = sessionStorage.getItem(STORAGE_KEY);
    const raw = local || session;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  }
}

// ---------------------------------------------------------------------------
// Shopify Storefront implementation
// ---------------------------------------------------------------------------
export class ShopifyAuthService implements IAuthService {
  private readonly STORAGE_KEY = 'monts_shopify_token';
  private readonly EXPIRY_KEY = 'monts_shopify_token_expiry';

  saveToken(token: string, expiresAt: string, rememberMe = true): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.STORAGE_KEY, token);
    storage.setItem(this.EXPIRY_KEY, expiresAt);
  }

  getStoredToken(): string | null {
    const local = localStorage.getItem(this.STORAGE_KEY);
    const session = sessionStorage.getItem(this.STORAGE_KEY);
    const token = local || session;
    if (!token) return null;

    const expiry =
      localStorage.getItem(this.EXPIRY_KEY) ||
      sessionStorage.getItem(this.EXPIRY_KEY);
    if (expiry && new Date(expiry) < new Date()) {
      this.clearStorage();
      return null;
    }
    return token;
  }

  private clearStorage(): void {
    [localStorage, sessionStorage].forEach((s) => {
      s.removeItem(this.STORAGE_KEY);
      s.removeItem(this.EXPIRY_KEY);
    });
  }

  async login(email: string, password: string, rememberMe = true): Promise<UserProfile> {
    const { accessToken, expiresAt } =
      await shopifyCustomerService.createAccessToken(email, password);
    this.saveToken(accessToken, expiresAt, rememberMe);
    return shopifyCustomerService.getCustomer(accessToken);
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<UserProfile> {
    const { token, customer } = await shopifyCustomerService.createCustomer(
      email,
      password,
      firstName,
      lastName
    );
    this.saveToken(token.accessToken, token.expiresAt, true);
    return customer;
  }

  async forgotPassword(email: string): Promise<void> {
    await shopifyCustomerService.recoverPassword(email);
  }

  async logout(): Promise<void> {
    const token = this.getStoredToken();
    if (token) {
      await shopifyCustomerService.deleteAccessToken(token).catch(() => {});
    }
    this.clearStorage();
  }

  /** Sync check — actual profile is fetched async in AuthProvider via getCustomer() */
  getCurrentUser(): UserProfile | null {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Singleton exports
// ---------------------------------------------------------------------------
export const shopifyAuthService = new ShopifyAuthService();

export const authService: IAuthService =
  env.apiProvider === 'shopify' ? shopifyAuthService : new MockAuthService();
