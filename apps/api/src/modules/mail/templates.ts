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
    subject: 'Verify your email - AppointmentOS',
    text: `Hi ${fullName}, verify your email here: ${verifyUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280">AppointmentOS</p>
        <h2 style="margin:0 0 12px;font-size:22px;color:#111827">Confirm your email</h2>
        <p style="margin:0 0 10px">Hi ${safeName},</p>
        <p style="margin:0 0 18px">Welcome to AppointmentOS. Please verify your email to activate your account.</p>
        <p style="margin:0 0 20px">
          <a href="${safeUrl}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">
            Verify email
          </a>
        </p>
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280">If the button does not work, use this link:</p>
        <p style="margin:0 0 14px;word-break:break-all"><a href="${safeUrl}" style="color:#4f46e5">${safeUrl}</a></p>
        <p style="margin:0;font-size:13px;color:#6b7280">This verification link expires in 1 hour.</p>
      </div>
    `,
  };
}
