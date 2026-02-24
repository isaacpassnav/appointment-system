import { Injectable } from '@nestjs/common';

type IdempotencyRecord = {
  appointmentId: string;
  expiresAt: number;
};

@Injectable()
export class IdempotencyCacheService {
  private readonly records = new Map<string, IdempotencyRecord>();
  private readonly ttlMs = 1000 * 60 * 60 * 24;

  find(key: string): string | null {
    const record = this.records.get(key);
    if (!record) {
      return null;
    }

    if (record.expiresAt <= Date.now()) {
      this.records.delete(key);
      return null;
    }

    return record.appointmentId;
  }

  save(key: string, appointmentId: string): void {
    this.pruneExpired();
    this.records.set(key, {
      appointmentId,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  private pruneExpired(): void {
    if (this.records.size < 500) {
      return;
    }

    const now = Date.now();
    for (const [key, value] of this.records.entries()) {
      if (value.expiresAt <= now) {
        this.records.delete(key);
      }
    }
  }
}
