import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  ArrowRight,
  BellRing,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Mail,
  MapPinned,
  MessageCircle,
  Palette,
  Rocket,
  Scissors,
  Send,
  Settings,
  Share2,
  Sparkles,
  Stethoscope,
  UserPlus,
  Users,
  Video,
} from 'lucide-react';

export type SolutionIndustry = {
  slug: string;
  title: string;
  shortDescription: string;
  impactStat: string;
  icon: LucideIcon;
  audience: string;
  painPoints: string[];
  outcomes: string[];
  imageSrc: string;
  imageAlt: string;
  heroLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  appliesTo: string[];
  heroImageClassName?: string;
};

export type ComparisonFeature = {
  label: string;
  appointmentIo: 'check' | 'partial' | 'cross';
  calendly: 'check' | 'partial' | 'cross';
  acuity: 'check' | 'partial' | 'cross';
  simplyBook: 'check' | 'partial' | 'cross';
};

export type SolutionStorySection = {
  id: string;
  label: string;
  title: string;
  description: string;
  imagePosition: 'left' | 'right';
  visualCaption: string;
  imageSrc: string;
  imageAlt: string;
  imageClassName?: string;
  badge?: {
    label: string;
    tone: 'amber' | 'violet';
  };
  tone?: 'violet' | 'emerald' | 'sky' | 'amber';
};

export type WorkflowMetric = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

export type SolutionIntegration = {
  label: string;
  assetSrc?: string;
  icon?: LucideIcon;
};

export type HowItWorksStep = {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

// TODO: connect to API or CMS
export const solutionsIndustries: SolutionIndustry[] = [
  {
    slug: 'clinics',
    title: 'Clinics & Healthcare',
    shortDescription:
      'Reduce no-shows, automate confirmations, and keep every practitioner schedule coordinated.',
    impactStat: 'Clinics lose up to $7,200/month in no-shows.',
    icon: Stethoscope,
    audience: 'Private practices, specialty clinics, dental offices, wellness clinics.',
    painPoints: [
      'High no-show rates damage revenue and disrupt daily capacity.',
      'Manual reminders steal staff time that should go to patient care.',
      'Fragmented scheduling creates gaps between front desk and professionals.',
    ],
    outcomes: [
      'Automated reminders and confirmations before each appointment.',
      'Clear day-of agenda for every practitioner and admin team.',
      'Audit-ready notification history by tenant and appointment.',
    ],
    imageSrc: '/solutions/clinics-hero.jpg',
    imageAlt:
      'Doctor in a clinic environment standing confidently for the healthcare scheduling solution.',
    heroLabel: 'Scheduling for clinics and healthcare',
    heroTitle: 'Professional scheduling app for clinics and healthcare teams',
    heroSubtitle:
      'Automate confirmations, keep practitioner calendars full, and give patients a smoother booking experience without overloading your front desk.',
    appliesTo: ['Dental clinics', 'Specialty practices', 'Therapy centers', 'Wellness clinics'],
    heroImageClassName: 'object-[center_18%]',
  },
  {
    slug: 'barbershops',
    title: 'Barbershops & Salons',
    shortDescription:
      'Keep chairs full, improve repeat bookings, and deliver a polished client experience.',
    impactStat: 'Barbershops can lose $1,500/month from no-shows alone.',
    icon: Scissors,
    audience: 'Barbershops, salons, grooming teams, premium beauty spaces.',
    painPoints: [
      'Peak hours go to waste when clients forget their slot.',
      'Staff spend time confirming instead of serving clients.',
      'Growth stalls without reminders, rebooking flows, and client visibility.',
    ],
    outcomes: [
      '24/7 booking that keeps appointments flowing without extra admin.',
      'Reminder automation that protects prime-time revenue.',
      'A smoother brand experience for high-retention clients.',
    ],
    imageSrc: '/solutions/barbershops-hero.jpg',
    imageAlt:
      'Professional barber inside a modern barbershop for the salon scheduling solution.',
    heroLabel: 'Scheduling for barbershops and salons',
    heroTitle: 'Professional scheduling app for barbershops and salon teams',
    heroSubtitle:
      'Keep every chair booked, reduce forgotten appointments, and turn first visits into repeat clients with a booking flow that feels premium from day one.',
    appliesTo: ['Barbers', 'Hair salons', 'Beauty studios', 'Grooming teams'],
    heroImageClassName: 'object-[center_16%]',
  },
  {
    slug: 'spas',
    title: 'Spas & Wellness',
    shortDescription:
      'Coordinate treatments, staff availability, and upsell opportunities with fewer scheduling gaps.',
    impactStat: 'Spas can lose ~$800/month when empty slots remain unfilled.',
    icon: Sparkles,
    audience: 'Spas, massage studios, aesthetic centers, wellness boutiques.',
    painPoints: [
      'Longer sessions make every missed booking more expensive.',
      'High-touch service demands fast, reliable communication.',
      'Teams need a calmer workflow to avoid scheduling chaos.',
    ],
    outcomes: [
      'Automated flows that match a premium service promise.',
      'Better use of therapist availability and room capacity.',
      'Consistent reminders that reduce day-of churn.',
    ],
    imageSrc: '/solutions/spas-hero.jpg',
    imageAlt: 'Spa treatment scene representing premium wellness appointment automation.',
    heroLabel: 'Scheduling for spas and wellness brands',
    heroTitle: 'Professional scheduling app for spas and wellness businesses',
    heroSubtitle:
      'Coordinate therapists, treatment rooms, and premium client communication in one place so every appointment feels calm before the visit even begins.',
    appliesTo: ['Spas', 'Massage studios', 'Aesthetic centers', 'Wellness boutiques'],
    heroImageClassName: 'object-top',
  },
  {
    slug: 'consultancies',
    title: 'Private Consultancies',
    shortDescription:
      'Professionalize client scheduling, automate follow-ups, and avoid losing qualified meetings.',
    impactStat: 'Consultancies lose trust and revenue when meetings slip through.',
    icon: BriefcaseBusiness,
    audience: 'Lawyers, accountants, advisors, recruiters, agency consultants.',
    painPoints: [
      'Missed consultations waste lead acquisition cost and calendar time.',
      'Manual coordination slows down a premium client experience.',
      'Reschedules are hard to manage without structured workflows.',
    ],
    outcomes: [
      'Fast booking and reschedule flows for high-value conversations.',
      'More professional first touch without hiring extra admin.',
      'A reliable audit trail of communication and appointment status.',
    ],
    imageSrc: '/solutions/consultancies-hero.jpg',
    imageAlt:
      'Consultant in a professional office meeting used for consultancy scheduling workflows.',
    heroLabel: 'Scheduling for consultants and advisors',
    heroTitle: 'Professional scheduling app for consultants and advisory firms',
    heroSubtitle:
      'Book qualified meetings faster, remove manual back-and-forth, and deliver a polished client experience before the conversation even starts.',
    appliesTo: ['Lawyers', 'Accountants', 'Recruiters', 'Business advisors'],
    heroImageClassName: 'object-top',
  },
  {
    slug: 'studios',
    title: 'Creative Studios',
    shortDescription:
      'Organize discovery calls, production sessions, and client checkpoints without the back-and-forth.',
    impactStat: 'Studios lose margin when production time is blocked by missed sessions.',
    icon: Palette,
    audience: 'Photo studios, design studios, tattoo artists, recording spaces.',
    painPoints: [
      'Creative calendars mix sessions, reviews, and client calls in one place.',
      'Manual confirmations create friction before work even starts.',
      'A premium brand suffers when booking feels messy.',
    ],
    outcomes: [
      'Cleaner booking experience for premium and referral-based clients.',
      'More predictable schedule for sessions and handoff reviews.',
      'Better client communication without losing creative focus.',
    ],
    imageSrc: '/solutions/studios-hero.jpg',
    imageAlt:
      'Creative studio professionals shown as a visual for studio session scheduling.',
    heroLabel: 'Scheduling for creative studios',
    heroTitle: 'Professional scheduling app for creative studios and artists',
    heroSubtitle:
      'From discovery calls to session days, keep your creative calendar organized without drowning in messages, reschedules, or missed approvals.',
    appliesTo: ['Tattoo artists', 'Photo studios', 'Design teams', 'Recording spaces'],
    heroImageClassName: 'object-[center_15%]',
  },
  {
    slug: 'coaches',
    title: 'Personal Trainers & Coaches',
    shortDescription:
      'Stay fully booked, send smart reminders, and look professional even as a solo operator.',
    impactStat: 'Coaches lose recurring income when routine sessions are missed.',
    icon: Dumbbell,
    audience: 'Personal trainers, fitness coaches, nutritionists, business coaches.',
    painPoints: [
      'Solo operators do not have time to chase confirmations every day.',
      'Recurring sessions are easy to lose without a disciplined reminder system.',
      'Clients expect flexibility without making the coach available 24/7.',
    ],
    outcomes: [
      'Automated reminders and easier reschedules without admin overhead.',
      'Professional presentation that improves retention and referrals.',
      'A system that works for one person today and a team tomorrow.',
    ],
    imageSrc: '/solutions/coaches-hero.jpg',
    imageAlt: 'Trainer coaching a client in a gym, representing coaching and fitness bookings.',
    heroLabel: 'Scheduling for coaches and trainers',
    heroTitle: 'Professional scheduling app for coaches and personal trainers',
    heroSubtitle:
      'Look more professional, protect recurring revenue, and keep clients accountable with reminders and rescheduling that run without you chasing anyone.',
    appliesTo: ['Personal trainers', 'Nutritionists', 'Business coaches', 'Online mentors'],
    heroImageClassName: 'object-top',
  },
];

// TODO: connect to API or CMS
export const solutionStorySections: SolutionStorySection[] = [
  {
    id: 'why-choose',
    label: 'WHY CHOOSE APPOINTMENTOS',
    title: 'Stop losing clients to no-shows.',
    description:
      'In Latin America, 1 in 3 appointments never happen. Every missed appointment is lost revenue, wasted staff time, and a client who might not come back. AppointmentOS automates confirmations, reminders, and rescheduling so your schedule stays full.',
    imagePosition: 'right',
    visualCaption: 'Revenue protected automatically',
    imageSrc: '/solutions/sections/why-choose.jpg',
    imageAlt: 'Clinic receptionist working with patient scheduling software.',
    imageClassName: 'object-[center_28%]',
    tone: 'violet',
  },
  {
    id: 'professional-presence',
    label: 'PROFESSIONAL PRESENCE',
    title: 'Look as professional as you are.',
    description:
      'Your clients get a clean, branded booking page. No more WhatsApp back-and-forth. No more double bookings. Just a seamless experience that builds trust from the first click.',
    imagePosition: 'left',
    visualCaption: 'Polished booking experience',
    imageSrc: '/solutions/sections/professional-presence.jpg',
    imageAlt: 'Client talking to a receptionist in a polished salon reception area.',
    imageClassName: 'object-center',
    tone: 'sky',
  },
  {
    id: 'ai-scheduling',
    label: 'AI-POWERED SCHEDULING',
    title: 'AI that books, reminds, and reschedules for you.',
    description:
      'Our AI agent handles confirmations by email and WhatsApp, responds to common questions about your services, and offers rescheduling before a client cancels - all in natural language, without you lifting a finger.',
    imagePosition: 'right',
    visualCaption: 'Always-on AI assistant',
    imageSrc: '/solutions/sections/ai-scheduling.jpg',
    imageAlt: 'Professional working on a laptop to represent AI-assisted scheduling workflows.',
    imageClassName: 'object-center',
    tone: 'amber',
  },
  {
    id: 'simplicity',
    label: 'SIMPLICITY',
    title: 'We keep it simple. Everything in one place.',
    description:
      'Your calendar, your clients, your services, your reminders - all in one dashboard. No switching between apps. No missed messages. Just your business running smoothly.',
    imagePosition: 'left',
    visualCaption: 'Everything in one dashboard',
    imageSrc: '/solutions/sections/simplicity.jpg',
    imageAlt: 'Professional using a laptop in a clean office workspace.',
    imageClassName: 'object-[center_20%]',
    tone: 'emerald',
  },
  {
    id: 'client-management',
    label: 'CLIENT MANAGEMENT',
    title: 'Stay in touch with every client.',
    description:
      'Every booking automatically creates or updates a client profile. See their history, notes, and upcoming appointments in seconds. Know your clients before they walk in.',
    imagePosition: 'right',
    visualCaption: 'Every client stays visible',
    imageSrc: '/solutions/sections/client-management.jpg',
    imageAlt: 'Professional consultant reviewing information with a client at a desk.',
    imageClassName: 'object-[center_18%]',
    tone: 'violet',
  },
  {
    id: 'navigation',
    label: 'UNIQUE FEATURE',
    title: 'Your clients will always find you.',
    description:
      'After confirming, clients receive your exact address and estimated travel time based on their location. In cities like Lima, Bogota, or Mexico City where traffic is chaos - this alone reduces no-shows significantly.',
    imagePosition: 'left',
    visualCaption: 'Clients always know the route',
    imageSrc: '/solutions/sections/navigation.jpg',
    imageAlt: 'Smartphone showing a navigation map for appointment directions.',
    imageClassName: 'object-center',
    badge: {
      label: 'Only on AppointmentOS',
      tone: 'violet',
    },
    tone: 'sky',
  },
];

// TODO: connect to API or CMS
export const solutionClientManagementBullets = [
  'Full booking history per client',
  'Internal notes visible only to your team',
  'Automatic profile creation on first booking',
  'Client portal to self-manage appointments',
];

// TODO: connect to API or CMS
export const solutionWorkflowMetrics: WorkflowMetric[] = [
  {
    label: 'Time',
    value: '-32%',
    detail: 'Less manual coordination workload across daily operations.',
    icon: CalendarDays,
  },
  {
    label: 'Attendance',
    value: '+80%',
    detail: 'Reduction potential in no-show impact with reminders and reschedules.',
    icon: BellRing,
  },
  {
    label: 'Experience',
    value: '24/7',
    detail: 'Always-on booking without hiring extra reception capacity.',
    icon: LayoutDashboard,
  },
];

// TODO: connect to API or CMS
export const solutionIntegrations: SolutionIntegration[] = [
  {
    label: 'WhatsApp Business',
    assetSrc: '/integrations/whatsapp.svg',
  },
  {
    label: 'Google Calendar',
    assetSrc: '/integrations/calendar.svg',
  },
  {
    label: 'Slack',
    assetSrc: '/integrations/slack.svg',
  },
  {
    label: 'Zoom',
    assetSrc: '/integrations/zoom.svg',
  },
  {
    label: 'Telegram',
    assetSrc: '/integrations/telegram.svg',
  },
  {
    label: 'Stripe',
    assetSrc: '/integrations/stripe.svg',
  },
  {
    label: 'MercadoPago',
    icon: CreditCard,
  },
  {
    label: 'Email',
    assetSrc: '/integrations/email.svg',
  },
];

// TODO: connect to API or CMS
export const solutionHowItWorksSteps: HowItWorksStep[] = [
  {
    step: '01',
    title: 'Sign up free',
    description: 'Create your account in seconds. No credit card.',
    icon: UserPlus,
  },
  {
    step: '02',
    title: 'Set up your business',
    description: 'Add services, staff, and working hours.',
    icon: Settings,
  },
  {
    step: '03',
    title: 'Share your link',
    description: 'Send your booking link via WhatsApp, Instagram, or email.',
    icon: Share2,
  },
  {
    step: '04',
    title: 'Sit back',
    description: 'Clients book, AI confirms, reminders go out automatically.',
    icon: Rocket,
  },
];

// TODO: connect to API or CMS
export const noShowLosses = [
  {
    label: 'Clinic',
    volume: '20 appts/day',
    noShowRate: '30% no-show rate',
    monthlyLoss: '$4,500/month lost',
    projectedRecovery: 'AppointmentIO reduces this by up to 80%',
  },
  {
    label: 'Barbershop',
    volume: '15 appts/day',
    noShowRate: '25% no-show rate',
    monthlyLoss: '$1,500/month lost',
    projectedRecovery: 'AppointmentIO reduces this by up to 80%',
  },
  {
    label: 'Spa',
    volume: '10 appts/day',
    noShowRate: '20% no-show rate',
    monthlyLoss: '$800/month lost',
    projectedRecovery: 'AppointmentIO reduces this by up to 80%',
  },
];

// TODO: connect to API or CMS
export const comparisonFeatures: ComparisonFeature[] = [
  {
    label: 'Spanish-first experience',
    appointmentIo: 'check',
    calendly: 'partial',
    acuity: 'partial',
    simplyBook: 'partial',
  },
  {
    label: 'WhatsApp notifications',
    appointmentIo: 'check',
    calendly: 'cross',
    acuity: 'partial',
    simplyBook: 'partial',
  },
  {
    label: 'Navigation to appointment',
    appointmentIo: 'check',
    calendly: 'cross',
    acuity: 'cross',
    simplyBook: 'cross',
  },
  {
    label: 'MercadoPago support',
    appointmentIo: 'check',
    calendly: 'cross',
    acuity: 'cross',
    simplyBook: 'partial',
  },
  {
    label: 'Reseller / white-label model',
    appointmentIo: 'check',
    calendly: 'cross',
    acuity: 'cross',
    simplyBook: 'partial',
  },
  {
    label: 'Pricing in local currency',
    appointmentIo: 'check',
    calendly: 'cross',
    acuity: 'cross',
    simplyBook: 'partial',
  },
  {
    label: 'AI conversational agent',
    appointmentIo: 'check',
    calendly: 'cross',
    acuity: 'cross',
    simplyBook: 'cross',
  },
  {
    label: 'No booking limits',
    appointmentIo: 'check',
    calendly: 'cross',
    acuity: 'partial',
    simplyBook: 'partial',
  },
];

// TODO: connect to API or CMS
export const appointmentIoPros = [
  'Automated reminders reduce no-shows by 80%',
  'Clients arrive on time with navigation links',
  '24/7 booking without a receptionist',
  'AI handles rescheduling requests automatically',
  'Full audit trail per tenant',
];

// TODO: connect to API or CMS
export const withoutAppointmentIoCons = [
  'Lost revenue per no-show adds up fast',
  'Staff time wasted on manual confirmations',
  "Clients book with competitors when you're unavailable",
  'No data on cancellation patterns',
  'Reputation damage from scheduling chaos',
];

export const sharedSolutionCta = {
  primaryLabel: 'Start free',
  secondaryLabel: 'See pricing',
  primaryHref: '/signup',
  secondaryHref: '/#pricing',
  icon: ArrowRight,
};

export const individualsSolution = {
  title: 'Built for the solo professional too',
  body:
    'You do not need a full team to benefit. Freelancers and solopreneurs use AppointmentIO to look more professional, automate reminders, and protect every paid slot without hiring admin support.',
  bullets: [
    'Present a polished booking experience from day one.',
    'Automate follow-ups while staying focused on client work.',
    'Grow into a team later without rebuilding your operations.',
  ],
  ctaLabel: 'Start free as an individual',
  ctaHref: '/signup',
  icon: Activity,
};

export const solutionFeatureIcons = {
  whyChoose: MessageCircle,
  professional: CheckCircle2,
  ai: Bot,
  simplicity: LayoutDashboard,
  integrations: Sparkles,
  clients: Users,
  navigation: MapPinned,
  email: Mail,
  whatsapp: MessageCircle,
  telegram: Send,
  zoom: Video,
};
