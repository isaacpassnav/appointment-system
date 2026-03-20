import { Suspense } from 'react';
import { VerifyEmailClient } from './verify-email-client';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<section className="auth-wrap reveal">Loading verification...</section>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
