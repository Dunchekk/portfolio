'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main>
      <h1>Не удалось загрузить страницу.</h1>
      <p>Попробуйте ещё раз через минуту.</p>
      <button onClick={reset}>Повторить</button>
    </main>
  );
}
