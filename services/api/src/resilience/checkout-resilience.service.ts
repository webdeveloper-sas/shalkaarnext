import { Injectable } from '@nestjs/common';
import { RetryStrategy, RETRY_PRESETS } from '@shalkaar/resilience';
import {
  FallbackHandler,
} from '@shalkaar/resilience';
import { LoggerService } from '@shalkaar/logging';

/**
 * Checkout Resilience Service
 * Ensures checkout flow continues even if some services are degraded
 * Implements graceful degradation for non-critical operations
 */
@Injectable()
export class CheckoutResilienceService {
  private retryStrategy: RetryStrategy;
  private inventoryFallback: FallbackHandler;
  private shippingFallback: FallbackHandler;
  private recommendationsFallback: FallbackHandler;

  constructor(
    private readonly logger: LoggerService
  ) {
    // Initialize retry strategy
    this.retryStrategy = new RetryStrategy(RETRY_PRESETS.SLOW);

    // Initialize fallback handlers for non-critical services
    this.inventoryFallback = new FallbackHandler({
      name: 'inventory_check',
      enableFallback: true,
      useStaleData: true,
      allowPartialResults: true,
      defaultValue: { available: true, reason: 'Assume in stock' },
    });

    this.shippingFallback = new FallbackHandler({
      name: 'shipping_calculation',
      enableFallback: true,
      useStaleData: true,
      allowPartialResults: true,
      defaultValue: { cost: 0, method: 'standard' },
    });

    this.recommendationsFallback = new FallbackHandler({
      name: 'recommendations',
      enableFallback: true,
      useStaleData: true,
      allowPartialResults: true,
      defaultValue: { items: [] },
    });
  }

  /**
   * Execute checkout with graceful degradation
   * Critical operations MUST succeed, non-critical can fail gracefully
   */
  async executeCheckoutWithDegradation(checkoutData: {
    userId: string;
    items: any[];
    shippingAddress: any;
    billingAddress: any;
  }): Promise<{
    success: boolean;
    orderId?: string;
    status: 'full' | 'degraded' | 'failed';
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    this.logger.info('Starting checkout with degradation support', {
      userId: checkoutData.userId,
      itemCount: checkoutData.items.length,
    });

    // Step 1: Validate inventory (critical)
    const inventoryValid = await this.validateInventoryWithFallback(
      checkoutData.items,
      errors,
      warnings
    );

    if (!inventoryValid && errors.length > 0) {
      this.logger.error('Checkout failed at inventory validation', { errors });
      return {
        success: false,
        status: 'failed',
        errors,
        warnings,
      };
    }

    // Step 2: Calculate pricing (critical)
    const pricingResult = await this.calculatePricingWithRetry(
      checkoutData.items,
      errors,
      warnings
    );

    if (!pricingResult.success) {
      this.logger.error('Checkout failed at pricing calculation', { errors });
      return {
        success: false,
        status: 'failed',
        errors,
        warnings,
      };
    }

    // Step 3: Calculate shipping (non-critical)
    await this.calculateShippingWithFallback(
      checkoutData.shippingAddress,
      warnings
    );

    // Step 4: Apply tax (non-critical)
    await this.calculateTaxWithFallback(
      checkoutData.billingAddress,
      pricingResult.subtotal || 0,
      warnings
    );

    // Step 5: Validate addresses (critical)
    const addressValid = await this.validateAddressesWithRetry(
      checkoutData.shippingAddress,
      checkoutData.billingAddress,
      errors
    );

    if (!addressValid && errors.length > 0) {
      this.logger.error('Checkout failed at address validation', { errors });
      return {
        success: false,
        status: 'failed',
        errors,
        warnings,
      };
    }

    // Step 6: Validate payment method (critical)
    const paymentValid = await this.validatePaymentMethodWithRetry(
      checkoutData,
      errors
    );

    if (!paymentValid && errors.length > 0) {
      this.logger.error('Checkout failed at payment validation', { errors });
      return {
        success: false,
        status: 'failed',
        errors,
        warnings,
      };
    }

    // All critical checks passed
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logger.info('Checkout completed successfully', {
      orderId,
      warnings: warnings.length,
    });

    if (warnings.length > 0) {
      this.logger.warn('Checkout completed with warnings', { warnings });
    }

    return {
      success: true,
      orderId,
      status: warnings.length > 0 ? 'degraded' : 'full',
      errors,
      warnings,
    };
  }

  /**
   * Validate inventory with fallback
   */
  private async validateInventoryWithFallback(
    items: any[],
    errors: string[],
    warnings: string[]
  ): Promise<boolean> {
    const result = await this.inventoryFallback.execute(
      async () => {
        // Primary: Check actual inventory
        const availableItems = await this.checkInventory(items);

        if (availableItems.length !== items.length) {
          const unavailable = items.filter(
            (item) => !availableItems.find((a) => a.id === item.id)
          );
          errors.push(
            `Items not in stock: ${unavailable.map((i) => i.name).join(', ')}`
          );
          return false;
        }

        return true;
      },
      async () => {
        // Fallback: Check stale inventory data
        return true; // Assume in stock if service fails
      }
    );

    if (result.isFallback && result.source !== 'default') {
      warnings.push('Using cached inventory data - may be outdated');
    }

    return result.success;
  }

  /**
   * Calculate pricing with retry
   */
  private async calculatePricingWithRetry(
    items: any[],
    errors: string[],
    _warnings: string[]
  ): Promise<{ success: boolean; subtotal?: number }> {
    const result = await this.retryStrategy.execute(
      async () => {
        const pricing = await this.calculateItemPrices(items);
        return {
          success: true,
          subtotal: pricing.total,
        };
      },
      {
        name: 'pricing_calculation',
        onRetry: (attempt, error) => {
          this.logger.warn(`Pricing calculation retry ${attempt}`, {
            error: error.message,
          });
        },
      }
    );

    if (!result.success) {
      errors.push('Failed to calculate pricing');
      return { success: false };
    }

    return result.data || { success: false };
  }

  /**
   * Calculate shipping with fallback
   */
  private async calculateShippingWithFallback(
    address: any,
    warnings: string[]
  ): Promise<{ cost: number; method: string; fallback: boolean }> {
    const result = await this.shippingFallback.execute(
      async () => {
        const shipping = await this.calculateShipping(address);
        return {
          cost: shipping.cost,
          method: shipping.method,
        };
      }
    );

    if (result.isFallback) {
      warnings.push('Using default shipping estimate');
      return {
        cost: result.data?.cost || 0,
        method: result.data?.method || 'standard',
        fallback: true,
      };
    }

    return {
      cost: result.data?.cost || 0,
      method: result.data?.method || 'standard',
      fallback: false,
    };
  }

  /**
   * Calculate tax with fallback
   */
  private async calculateTaxWithFallback(
    address: any,
    subtotal: number,
    warnings: string[]
  ): Promise<{ amount: number; fallback: boolean }> {
    try {
      const tax = await this.calculateTax(address, subtotal);
      return {
        amount: tax.amount,
        fallback: false,
      };
    } catch (error) {
      this.logger.warn('Tax calculation failed, using default', {
        error: String(error),
      });
      warnings.push('Using estimated tax - may not be accurate');
      // Default to 10% tax
      return {
        amount: subtotal * 0.1,
        fallback: true,
      };
    }
  }

  /**
   * Validate addresses with retry
   */
  private async validateAddressesWithRetry(
    shippingAddress: any,
    billingAddress: any,
    errors: string[]
  ): Promise<boolean> {
    const result = await this.retryStrategy.execute(
      async () => {
        const validation = await this.validateAddresses(
          shippingAddress,
          billingAddress
        );
        if (!validation.valid) {
          throw new Error(validation.error);
        }
        return true;
      }
    );

    if (!result.success) {
      errors.push(`Address validation failed: ${result.error?.message}`);
      return false;
    }

    return true;
  }

  /**
   * Validate payment method with retry
   */
  private async validatePaymentMethodWithRetry(
    checkoutData: any,
    errors: string[]
  ): Promise<boolean> {
    const result = await this.retryStrategy.execute(
      async () => {
        const validation = await this.validatePaymentMethod(checkoutData);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
        return true;
      }
    );

    if (!result.success) {
      errors.push(`Payment validation failed: ${result.error?.message}`);
      return false;
    }

    return true;
  }

  /**
   * Stub: Check inventory
   */
  private async checkInventory(items: any[]): Promise<any[]> {
    // Mock implementation
    return items;
  }

  /**
   * Stub: Calculate item prices
   */
  private async calculateItemPrices(items: any[]): Promise<{ total: number }> {
    // Mock implementation
    const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
    return { total };
  }

  /**
   * Stub: Calculate shipping
   */
  private async calculateShipping(_address: any): Promise<{
    cost: number;
    method: string;
  }> {
    // Mock implementation
    return { cost: 10, method: 'standard' };
  }

  /**
   * Stub: Calculate tax
   */
  private async calculateTax(
    _address: any,
    subtotal: number
  ): Promise<{ amount: number }> {
    // Mock implementation
    return { amount: subtotal * 0.1 };
  }

  /**
   * Stub: Validate addresses
   */
  private async validateAddresses(
    _shipping: any,
    _billing: any
  ): Promise<{ valid: boolean; error?: string }> {
    // Mock implementation
    return { valid: true };
  }

  /**
   * Stub: Validate payment method
   */
  private async validatePaymentMethod(
    _data: any
  ): Promise<{ valid: boolean; error?: string }> {
    // Mock implementation
    return { valid: true };
  }

  /**
   * Get checkout resilience statistics
   */
  getResilienceStats(): any {
    return {
      inventory: {
        hasCachedData: this.inventoryFallback.getCachedData() !== undefined,
        cacheAge: this.inventoryFallback.getCacheAge(),
      },
      shipping: {
        hasCachedData: this.shippingFallback.getCachedData() !== undefined,
        cacheAge: this.shippingFallback.getCacheAge(),
      },
      recommendations: {
        hasCachedData: this.recommendationsFallback.getCachedData() !== undefined,
        cacheAge: this.recommendationsFallback.getCacheAge(),
      },
    };
  }
}
