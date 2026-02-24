import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const headers =
      typeof req.headers === 'object' && req.headers !== null
        ? (req.headers as Record<string, unknown>)
        : undefined;
    const xForwardedFor = headers?.['x-forwarded-for'];
    if (typeof xForwardedFor === 'string' && xForwardedFor.length > 0) {
      const firstIp = xForwardedFor.split(',')[0]?.trim();
      if (firstIp) {
        return firstIp;
      }
    }

    const ip = typeof req.ip === 'string' ? req.ip : undefined;
    const socket =
      typeof req.socket === 'object' && req.socket !== null
        ? (req.socket as { remoteAddress?: unknown })
        : undefined;
    const remoteAddress =
      typeof socket?.remoteAddress === 'string'
        ? socket.remoteAddress
        : undefined;
    const tracker = ip ?? remoteAddress ?? 'unknown';

    return await Promise.resolve(tracker);
  }
}
