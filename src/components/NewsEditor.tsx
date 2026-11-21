'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { newsAction, uploadAction } from '@/app/admin/actions';
import { TextEditor } from './TextEditor';
import s from './admin.module.css';
type Item = {
  id?: string;
  version: number;
  title: string;
  text: string;
  date: string;
  published: boolean;
  mediaId: string | null;
};
const blank = (): Item => ({
  version: 0,
  title: '',
  text: '',
  date: new Date().toISOString().slice(0, 10),
  published: false,
  mediaId: null,
});
export function NewsEditor({ items }: { items: Item[] }) {
  const [data, setData] = useState<Item>(blank),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  const router = useRouter();
  return (
    <>
      <ul className={s.list}>
        {items.map((n) => (
          <li key={n.id}>
            <button
              disabled={busy}
              onClick={() => {
                setData(n);
                setMessage('');
              }}
            >
              {n.title}
            </button>
            <span>{n.published ? 'Опубликовано' : 'Черновик'}</span>
          </li>
        ))}
      </ul>
      <button
        disabled={busy}
        onClick={() => {
          setData(blank());
          setMessage('');
        }}
      >
        + Новость
      </button>
      <form
        className={s.form}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const result = await newsAction(data);
            setMessage(result.error || 'Сохранено.');
            if (!result.error) {
              setData(blank());
              router.refresh();
            }
          } catch {
            setMessage('Не удалось сохранить.');
          } finally {
            setBusy(false);
          }
        }}
      >
        <fieldset disabled={busy}>
          <label>
            Заголовок
            <input
              required
              maxLength={200}
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
            />
          </label>
          <label>
            Дата
            <input
              type="date"
              required
              value={data.date}
              onChange={(e) => setData({ ...data, date: e.target.value })}
            />
          </label>
          <TextEditor
            label="Текст новости"
            value={data.text}
            onChange={(text) => setData({ ...data, text })}
          />
          <label>
            Фото
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                setBusy(true);
                try {
                  const form = new FormData();
                  form.set('file', file);
                  const result = await uploadAction(form);
                  if (result.error) setMessage(result.error);
                  else setData((p) => ({ ...p, mediaId: result.id! }));
                } catch {
                  setMessage('Не удалось загрузить фото.');
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          {data.mediaId && (
            <div className={s.block}>
              <img src={`/media/${data.mediaId}`} alt="Фото новости" />
              <button type="button" onClick={() => setData({ ...data, mediaId: null })}>
                Убрать фото
              </button>
            </div>
          )}
          <label>
            <input
              type="checkbox"
              checked={data.published}
              onChange={(e) => setData({ ...data, published: e.target.checked })}
            />
            Опубликовать
          </label>
        </fieldset>
        <p role="status">{message}</p>
        <button disabled={busy}>Сохранить новость</button>
      </form>
    </>
  );
}
