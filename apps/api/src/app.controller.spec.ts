import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return service health payload', () => {
      const payload = appController.getHealth();
      expect(payload).toMatchObject({
        status: 'ok',
        service: 'appointment-api',
      });
      expect(typeof payload.timestamp).toBe('string');
      expect(new Date(payload.timestamp).toISOString()).toBe(payload.timestamp);
    });
  });
});
