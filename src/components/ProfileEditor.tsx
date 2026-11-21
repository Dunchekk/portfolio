'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { profileAction } from '@/app/admin/actions';
import { TextEditor } from './TextEditor';
import s from './admin.module.css';
export function ProfileEditor({
  initial,
}: {
  initial: { name: string; about: string; contact: string; version: number };
}) {
  const [data, setData] = useState(initial),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  const router = useRouter();
  return (
    <form
      className={s.form}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const result = await profileAction(data);
          setMessage(result.error || 'Сохранено.');
          if (!result.error) {
            setData((p) => ({ ...p, version: p.version + 1 }));
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
          Название сайта
          <input
            required
            maxLength={120}
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />
        </label>
        <TextEditor
          label="About"
          value={data.about}
          onChange={(about) => setData({ ...data, about })}
        />
        <TextEditor
          label="Контакты"
          value={data.contact}
          onChange={(contact) => setData({ ...data, contact })}
        />
      </fieldset>
      <p role="status">{message}</p>
      <button disabled={busy}>Сохранить профиль</button>
    </form>
  );
}
