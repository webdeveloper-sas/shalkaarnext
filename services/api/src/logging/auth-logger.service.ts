import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shalkaar/logging';
import { ErrorTrackingService } from '@shalkaar/logging';

/**
 * Authentication Event Logger
 * Logs all authentication-related events for security monitoring
 * Tracks login attempts, logouts, token generation, and auth failures
 */
@Injectable()
export class AuthLogger {
  constructor(
    private readonly logger: LoggerService,
    private readonly errorTracker: ErrorTrackingService
  ) {}

  /**
   * Log successful login
   */
  logLoginSuccess(userId: string, email: string, method: string = 'email-password'): void {
    const metadata = {
      event: 'auth.login.success',
      userId,
      email: this.maskEmail(email),
      method,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('User login successful', metadata);
    this.errorTracker.addBreadcrumb(
      'User logged in',
      'auth',
      'info',
      metadata
    );
  }

  /**
   * Log failed login attempt
   */
  logLoginFailure(
    email: string,
    reason: string,
    method: string = 'email-password',
    ipAddress?: string
  ): void {
    const metadata = {
      event: 'auth.login.failure',
      email: this.maskEmail(email),
      reason,
      method,
      ipAddress,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn('Login attempt failed', metadata);
    this.errorTracker.addBreadcrumb(
      'Login failed: ' + reason,
      'auth',
      'warning',
      metadata
    );
  }

  /**
   * Log logout
   */
  logLogout(userId: string, sessionId?: string): void {
    const metadata = {
      event: 'auth.logout',
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('User logged out', metadata);
    this.errorTracker.addBreadcrumb(
      'User logged out',
      'auth',
      'info',
      metadata
    );
  }

  /**
   * Log password change
   */
  logPasswordChange(userId: string, email: string, success: boolean, reason?: string): void {
    const metadata = {
      event: 'auth.password.change',
      userId,
      email: this.maskEmail(email),
      success,
      reason: reason || (success ? 'Password updated' : 'Password change failed'),
      timestamp: new Date().toISOString(),
    };

    if (success) {
      this.logger.info('Password changed', metadata);
    } else {
      this.logger.warn('Password change failed', metadata);
    }

    this.errorTracker.addBreadcrumb(
      success ? 'Password changed' : 'Password change failed',
      'auth',
      success ? 'info' : 'warning',
      metadata
    );
  }

  /**
   * Log password reset request
   */
  logPasswordResetRequest(email: string, ipAddress?: string): void {
    const metadata = {
      event: 'auth.password.reset.request',
      email: this.maskEmail(email),
      ipAddress,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Password reset requested', metadata);
    this.errorTracker.addBreadcrumb(
      'Password reset requested',
      'auth',
      'info',
      metadata
    );
  }

  /**
   * Log token generation
   */
  logTokenGeneration(
    userId: string,
    tokenType: 'access' | 'refresh' | 'reset',
    expiresIn?: number
  ): void {
    const metadata = {
      event: 'auth.token.generated',
      userId,
      tokenType,
      expiresIn,
      timestamp: new Date().toISOString(),
    };

    this.logger.debug('Token generated', metadata);
  }

  /**
   * Log token validation failure
   */
  logTokenValidationFailure(
    tokenType: string,
    reason: string,
    token?: string
  ): void {
    const metadata = {
      event: 'auth.token.validation.failure',
      tokenType,
      reason,
      tokenPreview: token ? token.substring(0, 10) + '...' : undefined,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn('Token validation failed', metadata);
    this.errorTracker.addBreadcrumb(
      `Token validation failed: ${reason}`,
      'auth',
      'warning',
      metadata
    );
  }

  /**
   * Log suspicious activity
   */
  logSuspiciousActivity(
    userId: string | undefined,
    activityType: string,
    reason: string,
    ipAddress?: string
  ): void {
    const metadata = {
      event: 'auth.suspicious.activity',
      userId,
      activityType,
      reason,
      ipAddress,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn('Suspicious authentication activity detected', metadata);
    this.errorTracker.captureMessage(
      `Suspicious auth activity: ${activityType} - ${reason}`,
      'warning',
      metadata
    );

    // Add higher severity breadcrumb
    this.errorTracker.addBreadcrumb(
      `Suspicious activity: ${activityType}`,
      'security',
      'warning',
      metadata
    );
  }

  /**
   * Log brute force attempt
   */
  logBruteForceAttempt(email: string, ipAddress?: string, attemptCount?: number): void {
    const metadata = {
      event: 'auth.brute.force.attempt',
      email: this.maskEmail(email),
      ipAddress,
      attemptCount,
      timestamp: new Date().toISOString(),
    };

    this.logger.error('Brute force attack detected', metadata);
    this.errorTracker.captureMessage(
      `Brute force attack detected for ${this.maskEmail(email)} from ${ipAddress}`,
      'error',
      metadata
    );
  }

  /**
   * Log account locked
   */
  logAccountLocked(email: string, reason: string, ipAddress?: string): void {
    const metadata = {
      event: 'auth.account.locked',
      email: this.maskEmail(email),
      reason,
      ipAddress,
      timestamp: new Date().toISOString(),
    };

    this.logger.error('Account locked', metadata);
    this.errorTracker.addBreadcrumb(
      'Account locked',
      'security',
      'error',
      metadata
    );
  }

  /**
   * Log account unlocked
   */
  logAccountUnlocked(email: string): void {
    const metadata = {
      event: 'auth.account.unlocked',
      email: this.maskEmail(email),
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Account unlocked', metadata);
  }

  /**
   * Log MFA enabled
   */
  logMFAEnabled(userId: string, mfaType: string): void {
    const metadata = {
      event: 'auth.mfa.enabled',
      userId,
      mfaType,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Multi-factor authentication enabled', metadata);
    this.errorTracker.addBreadcrumb(
      `MFA enabled: ${mfaType}`,
      'auth',
      'info',
      metadata
    );
  }

  /**
   * Log MFA disabled
   */
  logMFADisabled(userId: string): void {
    const metadata = {
      event: 'auth.mfa.disabled',
      userId,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Multi-factor authentication disabled', metadata);
  }

  /**
   * Log 2FA verification attempt
   */
  logMFAVerificationAttempt(
    userId: string,
    mfaType: string,
    success: boolean,
    attempts?: number
  ): void {
    const metadata = {
      event: 'auth.mfa.verification.attempt',
      userId,
      mfaType,
      success,
      attempts,
      timestamp: new Date().toISOString(),
    };

    if (success) {
      this.logger.info('MFA verification successful', metadata);
    } else {
      this.logger.warn('MFA verification failed', metadata);
    }
  }

  /**
   * Mask email address for logging
   */
  private maskEmail(email: string): string {
    if (!email || email.length === 0) return '[REDACTED]';

    const [local, domain] = email.split('@');
    if (!domain) return '[REDACTED]';

    const maskedLocal = local.substring(0, 2) + '***';
    return `${maskedLocal}@${domain}`;
  }
}
