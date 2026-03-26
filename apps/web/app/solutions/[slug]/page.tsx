import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SolutionFeatureSection } from '@/components/solutions/solution-feature-section';
import { SolutionHero } from '@/components/solutions/solution-hero';
import { SolutionHowItWorks } from '@/components/solutions/solution-how-it-works';
import { SolutionIntegrationsGrid } from '@/components/solutions/solution-integrations-grid';
import { SolutionWorkflowImpact } from '@/components/solutions/solution-workflow-impact';
import {
  sharedSolutionCta,
  solutionClientManagementBullets,
  solutionStorySections,
  solutionsIndustries,
} from '@/components/solutions/solutions-data';
import { Button } from '@/components/ui/button';
import type { SolutionStorySection } from '@/components/solutions/solutions-data';

export function generateStaticParams() {
  return solutionsIndustries.map((industry) => ({
    slug: industry.slug,
  }));
}

export default async function SolutionIndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = solutionsIndustries.find((item) => item.slug === slug);

  if (!industry) {
    notFound();
  }

  const introSectionIds = [
    'why-choose',
    'professional-presence',
    'ai-scheduling',
    'simplicity',
  ];
  const introSections = introSectionIds
    .map((id) => solutionStorySections.find((section) => section.id === id))
    .filter((section): section is SolutionStorySection => section !== undefined);

  const clientManagementSection = solutionStorySections.find(
    (section) => section.id === 'client-management',
  );
  const navigationSection = solutionStorySections.find(
    (section) => section.id === 'navigation',
  );

  if (
    introSections.length !== introSectionIds.length ||
    !clientManagementSection ||
    !navigationSection
  ) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-[1260px] flex-col gap-16 px-6 py-10 sm:px-8 lg:px-10 lg:gap-20">
      <SolutionHero industry={industry} />

      <div className="space-y-16 lg:space-y-20">
        {introSections.map((section) => (
          <SolutionFeatureSection
            key={section.id}
            label={section.label}
            title={section.title}
            description={section.description}
            imagePosition={section.imagePosition}
            visualCaption={section.visualCaption}
            imageSrc={section.imageSrc}
            imageAlt={section.imageAlt}
            imageClassName={section.imageClassName}
            badge={section.badge}
            tone={section.tone}
          />
        ))}

        <SolutionWorkflowImpact />

        <SolutionIntegrationsGrid />

        <SolutionFeatureSection
          label={clientManagementSection.label}
          title={clientManagementSection.title}
          description={clientManagementSection.description}
          imagePosition={clientManagementSection.imagePosition}
          visualCaption={clientManagementSection.visualCaption}
          imageSrc={clientManagementSection.imageSrc}
          imageAlt={clientManagementSection.imageAlt}
          imageClassName={clientManagementSection.imageClassName}
          tone={clientManagementSection.tone}
          bullets={solutionClientManagementBullets}
        />

        <SolutionFeatureSection
          label={navigationSection.label}
          title={navigationSection.title}
          description={navigationSection.description}
          imagePosition={navigationSection.imagePosition}
          visualCaption={navigationSection.visualCaption}
          imageSrc={navigationSection.imageSrc}
          imageAlt={navigationSection.imageAlt}
          imageClassName={navigationSection.imageClassName}
          badge={navigationSection.badge}
          tone={navigationSection.tone}
        />

        <SolutionHowItWorks />

        <section className="overflow-hidden rounded-[36px] bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-500 px-6 py-10 text-white sm:px-8 sm:py-14">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              Final CTA
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Ready to stop losing appointments?
            </h2>
            <p className="mt-4 text-base leading-8 text-white/80 sm:text-lg">
              Join businesses across Latin America that already trust
              AppointmentOS to keep their schedules full.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                asChild={true}
                size="lg"
                className="bg-white px-7 text-slate-950 hover:bg-white/90"
              >
                <Link href={sharedSolutionCta.primaryHref}>Start for free</Link>
              </Button>
              <Button
                asChild={true}
                size="lg"
                variant="outline"
                className="border-white/70 bg-transparent px-7 text-white hover:bg-white/10"
              >
                <Link href={sharedSolutionCta.secondaryHref}>View pricing</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/75">
              No credit card required. Setup in under 5 minutes.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
