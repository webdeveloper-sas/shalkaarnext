import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { LoggerService } from '@shalkaar/logging';

/**
 * Admin Role Guard
 * Ensures only administrators can access protected endpoints
 * Verifies admin role at every access point
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly logger: LoggerService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user exists
    if (!user) {
      this.logUnauthorizedAccess(request, 'No user context');
      throw new ForbiddenException('Unauthorized');
    }

    // Check if user has admin role
    const isAdmin = this.verifyAdminRole(user);

    if (!isAdmin) {
      this.logUnauthorizedAccess(request, `User ${user.id} lacks admin role`);
      throw new ForbiddenException('Admin access required');
    }

    // Log successful admin access
    this.logger.info('Admin access granted', {
      userId: user.id,
      email: user.email,
      action: context.getHandler().name,
      path: request.path,
    });

    return true;
  }

  /**
   * Verify user has admin role
   */
  private verifyAdminRole(user: any): boolean {
    // Check various role formats
    if (user.role === 'ADMIN' || user.role === 'admin') return true;
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.some(
        (role: any) =>
          (typeof role === 'string' && role.toUpperCase() === 'ADMIN') ||
          (typeof role === 'object' && role.name?.toUpperCase() === 'ADMIN')
      );
    }
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.some((perm: string) => perm.includes('admin'));
    }

    return false;
  }

  /**
   * Log unauthorized access attempts
   */
  private logUnauthorizedAccess(request: any, reason: string): void {
    this.logger.error('Unauthorized admin access attempt', {
      event: 'security.unauthorized_admin_access',
      userId: request.user?.id,
      path: request.path,
      method: request.method,
      ipAddress: request.ip,
      reason,
    });
  }
}
