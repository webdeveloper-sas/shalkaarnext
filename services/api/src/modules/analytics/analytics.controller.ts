import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('sales')
  async getSalesMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getSalesMetrics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('products/:productId')
  async getProductAnalytics(@Query('productId') productId: string) {
    return this.analyticsService.getProductAnalytics(productId);
  }

  @Get('users')
  async getUserAnalytics() {
    return this.analyticsService.getUserAnalytics();
  }
}
