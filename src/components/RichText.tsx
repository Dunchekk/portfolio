import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { normalizeText, safeHref } from '@/domain/content';
import styles from './site.module.css';
export function RichText({ text }: { text: string }) {
  return (
    <div className={styles.prose}>
      <Markdown
        remarkPlugins={[remarkBreaks]}
        skipHtml
        allowedElements={['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'blockquote']}
        unwrapDisallowed
        urlTransform={safeHref}
        components={{
          a: ({ href, children }) =>
            href ? (
              <a href={href} rel="noopener noreferrer">
                {children}
              </a>
            ) : (
              <>{children}</>
            ),
        }}
      >
        {normalizeText(text)}
      </Markdown>
    </div>
  );
}
