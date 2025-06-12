
import { supabase } from '@/integrations/supabase/client';

export interface SecurityConfig {
  sessionTimeout: number; // in milliseconds
  maxLoginAttempts: number;
  lockoutDuration: number; // in milliseconds
  passwordMinLength: number;
  requireStrongPassword: boolean;
}

export const defaultSecurityConfig: SecurityConfig = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  passwordMinLength: 8,
  requireStrongPassword: true
};

class SecurityService {
  private config: SecurityConfig;
  private loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private lastActivity: number = Date.now();
  private sessionTimer: NodeJS.Timeout | null = null;

  constructor(config: SecurityConfig = defaultSecurityConfig) {
    this.config = config;
    this.initializeSessionMonitoring();
  }

  private initializeSessionMonitoring() {
    // Reset session timer on user activity
    const resetTimer = () => {
      this.lastActivity = Date.now();
      this.startSessionTimer();
    };

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    this.startSessionTimer();
  }

  private startSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }

    this.sessionTimer = setTimeout(() => {
      this.handleSessionTimeout();
    }, this.config.sessionTimeout);
  }

  private async handleSessionTimeout() {
    console.warn('Session timeout - logging out user');
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.config.passwordMinLength) {
      errors.push(`Password must be at least ${this.config.passwordMinLength} characters long`);
    }

    if (this.config.requireStrongPassword) {
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  recordLoginAttempt(email: string, success: boolean) {
    const now = Date.now();
    const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0 };

    if (success) {
      this.loginAttempts.delete(email);
      return { blocked: false };
    }

    // Reset attempts if lockout duration has passed
    if (now - attempts.lastAttempt > this.config.lockoutDuration) {
      attempts.count = 0;
    }

    attempts.count++;
    attempts.lastAttempt = now;
    this.loginAttempts.set(email, attempts);

    const blocked = attempts.count >= this.config.maxLoginAttempts;
    
    if (blocked) {
      console.warn(`Account ${email} temporarily locked due to too many failed login attempts`);
    }

    return { 
      blocked, 
      remainingAttempts: Math.max(0, this.config.maxLoginAttempts - attempts.count),
      lockoutUntil: blocked ? now + this.config.lockoutDuration : null
    };
  }

  isAccountLocked(email: string): boolean {
    const attempts = this.loginAttempts.get(email);
    if (!attempts) return false;

    const now = Date.now();
    if (now - attempts.lastAttempt > this.config.lockoutDuration) {
      this.loginAttempts.delete(email);
      return false;
    }

    return attempts.count >= this.config.maxLoginAttempts;
  }

  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .trim()
      .substring(0, 1000); // Limit length
  }

  generateCSRFToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 320;
  }

  logSecurityEvent(event: string, details: any = {}) {
    console.log('Security Event:', {
      event,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...details
    });

    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to security monitoring service
    }
  }

  cleanup() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
  }
}

export const securityService = new SecurityService();

// Rate limiting utility
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60 * 1000 // 1 minute
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the time window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

export const apiRateLimiter = new RateLimiter(50, 60 * 1000); // 50 requests per minute
