import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedProject, listProjects } from '@/server/projects';
import { monthYear } from '@/domain/content';
import { Gallery } from '@/components/Gallery';
import s from '@/components/site.module.css';
const find = cache(getPublishedProject);
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await find((await params).slug);
  return { title: p?.title ?? 'Not found', description: p?.summary };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const project = await find((await params).slug);
  if (!project) notFound();
  return (
    <>
      <h1>{project.title}</h1>
      <time dateTime={project.date.toISOString().slice(0, 10)}>{monthYear(project.date)}</time>
      <Gallery blocks={project.blocks} />
    </>
  );
}
