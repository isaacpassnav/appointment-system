import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'API root endpoint' })
  @Throttle({ public: { limit: 120, ttl: 60_000 } })
  @Get()
  getApiRoot() {
    return {
      ...this.appService.getHealth(),
      docs: '/api/docs',
      health: '/health',
    };
  }

  @ApiOperation({ summary: 'Health check endpoint' })
  @Throttle({ public: { limit: 120, ttl: 60_000 } })
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
