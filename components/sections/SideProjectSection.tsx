import { SideProjectBlock } from '@/components/side-project/SideProjectBlock'
import { SideProjectShell } from '@/components/side-project/SideProjectShell'
import { Triptych } from '@/components/side-project/Triptych'
import { sanityFetch } from '@/sanity/lib/live'
import { sideProjectQuery } from '@/sanity/lib/queries'
import type { SideProjectData, SideProjectPayload } from '@/types/side-project'

export async function SideProjectSection() {
  const { data } = await sanityFetch({ query: sideProjectQuery })
  const section = data as SideProjectData | null

  if (!section) return null

  const project = section.project
  const stack = (project?.stack ?? []).filter((name): name is string => Boolean(name))

  // The card readout states what the section argues: a personal project, its
  // name and span, and what it is built from.
  const payload: SideProjectPayload | null = project
    ? {
        role: project.company,
        meta: `${project.title} · ${project.year}`,
        stack,
      }
    : null

  return (
    <SideProjectShell
      copy={{
        eyebrow: section.eyebrow,
        headline: section.headline,
        framingLine: section.framingLine,
      }}
      payload={payload}
    >
      <Triptych images={section.triptych ?? []} />
      {project && <SideProjectBlock project={project} steps={section.inspectionSteps ?? []} />}
    </SideProjectShell>
  )
}
