'use client';
import { useRef, useState } from 'react';
import { RichText } from './RichText';
import s from './admin.module.css';
export function TextEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  function wrap(before: string, after = before) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart,
      end = el.selectionEnd;
    const selected = value.slice(start, end) || 'текст';
    onChange(value.slice(0, start) + before + selected + after + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }
  return (
    <div>
      <label>
        {label}
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={100000}
        />
      </label>
      <small>
        Пустая строка — новый абзац. **Жирный**, *курсив*, [ссылка](https://…). HTML не
        поддерживается.
      </small>

    </div>
  );
}
