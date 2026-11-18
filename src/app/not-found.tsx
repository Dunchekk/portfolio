import Link from 'next/link';
export default function NotFound() {
  return (
    <main>
      <h1>Page not found</h1>
      <p>This page may not be published yet.</p>
      <Link href="/">Back to archive</Link>
    </main>
  );
}
