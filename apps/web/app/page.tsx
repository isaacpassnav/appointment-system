import Link from 'next/link';

const capabilities = [
  {
    title: 'Tenant-ready foundation',
    description:
      'Prepared to evolve from single business to owner + reseller + child accounts.',
  },
  {
    title: 'Operational dashboard',
    description:
      'Auth flow, profile, appointments and business limits can live in a single control panel.',
  },
  {
    title: 'Growth architecture',
    description:
      'Designed to support plans, quotas, subaccounts and isolated data by organization.',
  },
];

export default function HomePage() {
  return (
    <section className="space-y-10">
      <div className="hero reveal">
        <p className="eyebrow">Appointment System · Frontend</p>
        <h1>
          Multi-tenant scheduling UI
          <br />
          ready for scale.
        </h1>
        <p className="hero-copy">
          This frontend starts with login + appointment operations and is already aligned with your
          future reseller model: owner accounts, sub-clients, quotas and plan-based limits.
        </p>
        <div className="hero-actions">
          <Link href="/signup" className="button button-primary">
            Create account
          </Link>
          <Link href="/dashboard" className="button button-ghost">
            Open dashboard
          </Link>
        </div>
      </div>

      <div className="feature-grid">
        {capabilities.map((item, index) => (
          <article key={item.title} className="card reveal" style={{ animationDelay: `${index * 80}ms` }}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      <div className="card reveal">
        <h2>Next product milestone</h2>
        <p>
          Add organization hierarchy (`owner → reseller → client`) and enforce limits per plan
          (subaccounts, appointment caps, reminders per month) from one central billing policy.
        </p>
      </div>
    </section>
  );
}
