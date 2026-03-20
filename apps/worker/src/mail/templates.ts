function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildWelcomeTemplate(fullName: string) {
  const safeName = escapeHtml(fullName);

  return {
    subject: 'Welcome to AppointmentOS',
    text: `Hi ${fullName}, your account is ready. We are happy to have you on board.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>Welcome to AppointmentOS</h2>
        <p>Hi ${safeName},</p>
        <p>Your account was created successfully.</p>
        <p>Thanks for joining us.</p>
      </div>
    `,
  };
}

export function buildVerifyEmailTemplate(fullName: string, verifyUrl: string) {
  const safeName = escapeHtml(fullName);
  const safeUrl = escapeHtml(verifyUrl);

  return {
    subject: 'Verify your email',
    text: `Hi ${fullName}, verify your email here: ${verifyUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>Verify your email</h2>
        <p>Hi ${safeName},</p>
        <p>Please verify your email to activate your account:</p>
        <p><a href="${safeUrl}">Verify email</a></p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  };
}
