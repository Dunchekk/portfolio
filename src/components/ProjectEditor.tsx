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
          <label>
            Дата
            <input
              type="date"
              required
              value={data.date}
              onChange={(e) => field('date', e.target.value)}
            />
          </label>
          <label>
            Публикация
            <select
              value={data.status}
              onChange={(e) => field('status', e.target.value as ProjectInput['status'])}
            >
              <option value="DRAFT">Черновик — виден только вам</option>
              <option value="LISTED">Только запись в архиве</option>
              <option value="PUBLISHED">Опубликованная страница</option>
            </select>
          </label>
        </div>
        <label>
          Краткое описание
          <input
            maxLength={500}
            value={data.summary}
            onChange={(e) => field('summary', e.target.value)}
          />
        </label>
        <p>Категории</p>
        <div className={s.checks}>
          {categories.map((c) => (
            <label key={c.id}>
              <input
                type="checkbox"
                checked={data.categoryIds.includes(c.id)}
                onChange={(e) =>
                  field(
                    'categoryIds',
                    e.target.checked
                      ? [...data.categoryIds, c.id]
                      : data.categoryIds.filter((id) => id !== c.id),
                  )
                }
              />
              {c.name}
            </label>
          ))}
        </div>
        <div className={s.tools}>
          <input
            aria-label="Новая категория"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            maxLength={80}
          />
          <button
            type="button"
            onClick={async () => {
              setBusy(true);
              try {
                const r = await categoryAction(categoryName);
                if (r.error) setError(r.error);
                else {
                  setCategoryName('');
                  router.refresh();
                }
              } catch {
                setError('Не удалось создать категорию.');
              } finally {
                setBusy(false);
              }
            }}
          >
            Добавить категорию
          </button>
        </div>
        <label>
          Обложка
          <select
            value={data.coverId ?? ''}
            onChange={(e) => field('coverId', e.target.value || null)}
          >
            <option value="">Без обложки</option>
            {data.blocks.flatMap((b, i) =>
              b.kind === 'IMAGE'
                ? [
                    <option key={i} value={b.mediaId}>
                      {b.alt || `Фото ${i + 1}`}
                    </option>,
                  ]
                : [],
            )}
          </select>
        </label>
        {[0, 1, 2].map((column) => (
          <section key={column}>
            <h2 className={s.notice}>Колонка {column + 1}</h2>
            {data.blocks.map((block, index) =>
              block.column === column ? (
                <div className={s.block} key={block.id ?? `${block.kind}-${index}`}>
                  <div className={s.tools}>
                    <span>{block.kind === 'TEXT' ? 'Текст' : 'Фото'}</span>
                    <label>
                      Колонка
                      <select
                        value={block.column}
                        onChange={(e) =>
                          update(index, { ...block, column: Number(e.target.value) })
                        }
                      >
                        {[0, 1, 2].map((c) => (
                          <option key={c} value={c}>
                            {c + 1}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button type="button" aria-label="Блок вверх" onClick={() => move(index, -1)}>
                      ↑
                    </button>
                    <button type="button" aria-label="Блок вниз" onClick={() => move(index, 1)}>
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Убрать блок? Изменение применится после сохранения.')) {
                          field(
                            'blocks',
                            data.blocks.filter((_, i) => i !== index),
                          );
                        }
                      }}
                    >
                      Убрать
                    </button>
                  </div>
                  {block.kind === 'TEXT' ? (
                    <TextEditor
                      label={`Текст блока ${index + 1}`}
                      value={block.text}
                      onChange={(text) => update(index, { ...block, text })}
                    />
                  ) : (
                    <>
                      <img src={`/media/${block.mediaId}`} alt={block.alt} />
                      <label>
                        Описание фото (alt)
                        <input
                          required
                          value={block.alt}
                          maxLength={500}
                          onChange={(e) => update(index, { ...block, alt: e.target.value })}
                        />
                      </label>
                      <label>
                        Подпись
                        <input
                          value={block.caption}
                          maxLength={1000}
                          onChange={(e) => update(index, { ...block, caption: e.target.value })}
                        />
                      </label>
                    </>
                  )}
                </div>
              ) : null,
            )}
            <div className={s.tools}>
              <button
                type="button"
                onClick={() =>
                  field('blocks', [...data.blocks, { kind: 'TEXT', column, text: '' }])
                }
              >
                + Текст в колонку {column + 1}
              </button>
              <label>
                + Фото в колонку {column + 1}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => {
                    void upload(e.target.files, column);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          </section>
        ))}
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
