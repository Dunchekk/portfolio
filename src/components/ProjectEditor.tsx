'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { projectAction, uploadAction, categoryAction } from '@/app/admin/actions';
import type { BlockInput, ProjectInput } from '@/domain/content';
import { TextEditor } from './TextEditor';
import s from './admin.module.css';
export function ProjectEditor({
  initial,
  categories,
  initialSaved = false,
}: {
  initial: ProjectInput;
  initialSaved?: boolean;
  categories: { id: string; name: string }[];
}) {
  const [data, setData] = useState(initial),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(initialSaved),
    [categoryName, setCategoryName] = useState('');
  const router = useRouter();
  const field = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => {
    setSaved(false);
    setData((p) => ({ ...p, [key]: value }));
  };
  function update(index: number, block: BlockInput) {
    field(
      'blocks',
      data.blocks.map((b, i) => (i === index ? block : b)),
    );
  }
  function move(index: number, offset: number) {
    const blocks = [...data.blocks];
    const candidates = blocks
      .map((b, i) => (b.column === blocks[index].column ? i : -1))
      .filter((i) => i >= 0);
    const target = candidates[candidates.indexOf(index) + offset];
    if (target === undefined) return;
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    field('blocks', blocks);
  }
  async function upload(files: FileList | null, column: number) {
    if (!files?.length) return;
    setBusy(true);
    setError('');
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.set('file', file);
      try {
        const result = await uploadAction(form);
        if (result.error) {
          setError(result.error);
          break;
        }
        if (result.id)
          setData((p) => ({
            ...p,
            blocks: [
              ...p.blocks,
              { kind: 'IMAGE', column, mediaId: result.id!, alt: '', caption: '' },
            ],
            coverId: p.coverId ?? result.id!,
          }));
      } catch {
        setError('Загрузка прервалась. Повторите попытку.');
        break;
      }
    }
    setSaved(false);
    setBusy(false);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await projectAction(data);
      if (result.error) setError(result.error);
      else {
        setSaved(true);
        if (result.id) {
          setData((p) => ({ ...p, id: result.id, version: p.id ? p.version + 1 : 1 }));
          if (!data.id) router.replace(`/admin/projects/${result.id}?saved=1`);
        }
      }
    } catch {
      setError('Не удалось сохранить. Проверьте соединение.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className={s.form} onSubmit={save}>
      <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <div className={s.fields}>
          <label>
            Название
            <input
              required
              maxLength={200}
              value={data.title}
              onChange={(e) => field('title', e.target.value)}
            />
          </label>
          <label>
            Адрес проекта (slug)
            <input
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              value={data.slug}
              onChange={(e) => field('slug', e.target.value)}
              maxLength={120}
            />
          </label>
        </div>
      </fieldset>
      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
      {saved && <p role="status">Сохранено.</p>}
      <p>
        Сохранение опубликованного проекта сразу обновит сайт. Чтобы скрыть страницу, выберите
        «Черновик».
      </p>
      <button disabled={busy}>{busy ? 'Подождите…' : 'Сохранить проект'}</button>
    </form>
  );
}
