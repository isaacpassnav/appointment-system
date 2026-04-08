export type TenantPlan = 'starter' | 'pro' | 'enterprise' | 'trial';

export type PlanFeatureKey =
  | 'clients'
  | 'staff'
  | 'emailTemplates'
  | 'reminders'
  | 'aiAgent'
  | 'payments'
  | 'reports'
  | 'integrations'
  | 'advancedAnalytics';

export const PLAN_FEATURES: Record<TenantPlan, Record<PlanFeatureKey, boolean>> = {
  starter: {
    clients: false,
    staff: false,
    emailTemplates: false,
    reminders: false,
    aiAgent: false,
    payments: false,
    reports: false,
    integrations: false,
    advancedAnalytics: false,
  },
  trial: {
    clients: false,
    staff: false,
    emailTemplates: false,
    reminders: false,
    aiAgent: false,
    payments: false,
    reports: false,
    integrations: false,
    advancedAnalytics: false,
  },
  pro: {
    clients: true,
    staff: true,
    emailTemplates: true,
    reminders: true,
    aiAgent: true,
    payments: true,
    reports: true,
    integrations: true,
    advancedAnalytics: false,
  },
  enterprise: {
    clients: true,
    staff: true,
    emailTemplates: true,
    reminders: true,
    aiAgent: true,
    payments: true,
    reports: true,
    integrations: true,
    advancedAnalytics: true,
  },
};

const REQUIRED_PLAN_BY_FEATURE: Record<PlanFeatureKey, Exclude<TenantPlan, 'trial'>> = {
  clients: 'pro',
  staff: 'pro',
  emailTemplates: 'pro',
  reminders: 'pro',
  aiAgent: 'pro',
  payments: 'pro',
  reports: 'pro',
  integrations: 'pro',
  advancedAnalytics: 'enterprise',
};

export function canAccessFeature(plan: TenantPlan, feature: PlanFeatureKey) {
  return PLAN_FEATURES[plan][feature];
}

export function getRequiredPlanForFeature(feature: PlanFeatureKey) {
  return REQUIRED_PLAN_BY_FEATURE[feature];
}
