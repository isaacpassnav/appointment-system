'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { updateProfile, updatePassword, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

export function ProfileEditForm() {
  const { user, withAccessToken, updateUser } = useAuth();
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    timezone: user?.timezone || 'UTC',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const timezones = [
    'UTC',
    'America/Lima',
    'America/Mexico_City',
    'America/Bogota',
    'America/Santiago',
    'America/Buenos_Aires',
    'America/Sao_Paulo',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/Madrid',
    'Europe/London',
  ];

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const updated = await withAccessToken((token) =>
        updateProfile(token, {
          fullName: formData.fullName,
          phone: formData.phone || undefined,
          timezone: formData.timezone,
        })
      );

      updateUser(updated);
      setSuccess(t('settings.profileUpdated', 'Profile updated successfully') as string);
      setIsEditing(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t('settings.updateError', 'Failed to update profile') as string);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(t('settings.passwordMismatch', 'New passwords do not match') as string);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError(t('settings.passwordTooShort', 'Password must be at least 8 characters') as string);
      return;
    }

    setIsLoading(true);

    try {
      await withAccessToken((token) =>
        updatePassword(token, {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      );

      setSuccess(t('settings.passwordUpdated', 'Password updated successfully') as string);
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t('settings.passwordError', 'Failed to update password') as string);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setError(null);
    setSuccess(null);
    setFormData({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      timezone: user?.timezone || 'UTC',
    });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Profile Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSubmitProfile} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                {t('settings.fullName', 'Full Name')}
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder={t('settings.fullNamePlaceholder', 'Your full name') as string}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                {t('settings.phone', 'Phone')}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('settings.phonePlaceholder', '+1 234 567 890') as string}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="timezone">
                {t('settings.timezone', 'Timezone')}
              </Label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="flex h-11 w-full rounded-full border border-input bg-transparent px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz} className="bg-background">
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('settings.saving', 'Saving...') : t('settings.saveChanges', 'Save Changes')}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              {t('settings.cancel', 'Cancel')}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="settings-field">
              <span className="settings-field-label">{t('settings.fullName', 'Full Name')}</span>
              <span className="settings-field-value">{user.fullName}</span>
            </div>

            <div className="settings-field">
              <span className="settings-field-label">{t('settings.email', 'Email')}</span>
              <span className="settings-field-value">{user.email}</span>
            </div>

            <div className="settings-field">
              <span className="settings-field-label">{t('settings.phone', 'Phone')}</span>
              <span className="settings-field-value">{user.phone || '-'}</span>
            </div>

            <div className="settings-field">
              <span className="settings-field-label">{t('settings.timezone', 'Timezone')}</span>
              <span className="settings-field-value">{user.timezone}</span>
            </div>
          </div>

          <div className="settings-edit-row">
            <Button onClick={() => setIsEditing(true)}>
              {t('settings.editProfile', 'Edit Profile')}
            </Button>
          </div>
        </div>
      )}

      {/* Password Change Section */}
      <div className="settings-divider" />

      {isChangingPassword ? (
        <form onSubmit={handleSubmitPassword} className="space-y-4">
          <h4 className="text-lg font-semibold">
            {t('settings.changePassword', 'Change Password')}
          </h4>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="currentPassword">
                {t('settings.currentPassword', 'Current Password')}
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">
                {t('settings.newPassword', 'New Password')}
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t('settings.confirmPassword', 'Confirm New Password')}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('settings.updating', 'Updating...') : t('settings.updatePassword', 'Update Password')}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              {t('settings.cancel', 'Cancel')}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">
            {t('settings.security', 'Security')}
          </h4>
          <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
            {t('settings.changePassword', 'Change Password')}
          </Button>
        </div>
      )}
    </div>
  );
}
