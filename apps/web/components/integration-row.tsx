'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const integrations = [
  {
    name: 'WhatsApp Business',
    channel: 'Messaging',
    logo: '/integrations/whatsapp.svg',
  },
  {
    name: 'Telegram Bot',
    channel: 'Messaging',
    logo: '/integrations/telegram.svg',
  },
  {
    name: 'Email (Resend)',
    channel: 'Email',
    logo: '/integrations/email.svg',
  },
  {
    name: 'Google Calendar',
    channel: 'Calendar',
    logo: '/integrations/calendar.svg',
  },
  {
    name: 'Stripe',
    channel: 'Payments',
    logo: '/integrations/stripe.svg',
  },
  {
    name: 'Zoom',
    channel: 'Meetings',
    logo: '/integrations/zoom.svg',
  },
  {
    name: 'Slack',
    channel: 'Alerts',
    logo: '/integrations/slack.svg',
  },
  {
    name: 'HubSpot',
    channel: 'CRM',
    logo: '/integrations/hubspot.svg',
  },
];

export function IntegrationRow() {
  const track = [...integrations, ...integrations];

  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="overflow-hidden rounded-2xl"
      >
        <motion.div
          className="flex w-max gap-4"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {track.map((integration, index) => (
            <article
              key={`${integration.name}-${index}`}
              className="flex min-h-[90px] w-[230px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm"
            >
              <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-slate-100">
                <Image
                  src={integration.logo}
                  alt={`${integration.name} logo`}
                  className="h-7 w-7"
                  width={28}
                  height={28}
                  loading="lazy"
                />
              </div>
              <div className="grid gap-1">
                <p className="m-0 font-bold leading-tight">{integration.name}</p>
                <Badge
                  variant="secondary"
                  className="w-fit border-slate-200 bg-slate-100 text-slate-700"
                >
                  {integration.channel}
                </Badge>
              </div>
            </article>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
