'use client';
import { useActionState } from 'react';
import { loginAction } from '@/app/admin/actions';
import s from './admin.module.css';
export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form action={action} className={s.form}>
      <label>
        Логин
        <input name="login" autoComplete="username" required maxLength={200} />
      </label>
      <label>
        Пароль
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={1024}
        />
      </label>
      {state.error && (
        <p role="alert" className={s.error}>
          {state.error}
        </p>
      )}
      <button disabled={pending}>{pending ? 'Вход…' : 'Войти'}</button>
    </form>
  );
}
