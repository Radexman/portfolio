import Link from 'next/link'

import { VoiceFlow } from '@/components/side-project/VoiceFlow'
import { StackTags } from '@/components/work/StackTags'
import { VISIBILITY_FALLBACKS } from '@/content/work'
import { hostnameOf } from '@/lib/format'
import type { InspectionStep, SideProject } from '@/types/side-project'

interface SideProjectBlockProps {
  project: SideProject
  steps: InspectionStep[]
}

export function SideProjectBlock({ project, steps }: SideProjectBlockProps) {
  const stack = (project.stack ?? []).filter((name): name is string => Boolean(name))
  const fallbackLabel = VISIBILITY_FALLBACKS[project.visibility]

  return (
    <div
      data-side-project="block"
      className="mt-20 rounded-card border border-border bg-surface p-5 md:p-6 lg:p-8"
    >
      <h3 className="font-display text-xl font-bold tracking-display text-fg md:text-2xl">
        {project.title}
      </h3>
      <p className="mt-2 font-mono text-[11px] tracking-widest text-fg-muted uppercase">
        {project.role}
      </p>

      {/* Constraint before feature: "voice control" as a headline reads as a
          novelty, "both hands are inside the hive" makes it inevitable. */}
      <p className="mt-6 max-w-xl leading-relaxed text-fg-muted">{project.problem}</p>
      {project.approach && (
        <p className="mt-4 max-w-xl leading-relaxed text-fg-muted">{project.approach}</p>
      )}

      <VoiceFlow steps={steps} />

      <StackTags names={stack} className="mt-8" />

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <Link
          href={`/work/${project.slug}`}
          className="font-mono text-xs tracking-widest text-fg uppercase underline decoration-accent underline-offset-4 transition-colors hover:text-accent"
        >
          <span aria-hidden="true">→</span> case study
          <span className="sr-only"> for {project.title}</span>
        </Link>

        {project.visibility === 'public' && project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-xs tracking-widest text-fg-muted transition-colors hover:text-accent"
          >
            <span aria-hidden="true">↗</span> {hostnameOf(project.liveUrl)}
          </a>
        ) : (
          fallbackLabel && <p className="font-mono text-xs text-fg-muted">{fallbackLabel}</p>
        )}
      </div>
    </div>
  )
}
