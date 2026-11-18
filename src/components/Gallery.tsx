'use client';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { RichText } from './RichText';
import s from './site.module.css';
type Block = {
  id: string;
  kind: 'TEXT' | 'IMAGE';
  column: number;
  text: string | null;
  alt: string;
  caption: string;
  media: { id: string; width: number; height: number } | null;
};
export function Gallery({ blocks }: { blocks: Block[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const images = blocks.filter((b) => b.kind === 'IMAGE' && b.media);
  const current = images[index];
  const move = (direction: number) =>
    setIndex((i) => (i + direction + images.length) % images.length);
  return (
    <>
      <div className={s.columns}>
        {[0, 1, 2].map((column) => (
          <div key={column} className={s.column}>
            {blocks
              .filter((b) => b.column === column)
              .map((block) => (
                <div className={s.block} key={block.id}>
                  {block.kind === 'TEXT' ? (
                    <RichText text={block.text ?? ''} />
                  ) : (
                    block.media && (
                      <figure>
                        <button
                          type="button"
                          aria-label={`Enlarge: ${block.alt}`}
                          onClick={() => {
                            setIndex(images.findIndex((b) => b.id === block.id));
                            dialog.current?.showModal();
                          }}
                        >
                          <Image
                            src={`/media/${block.media.id}`}
                            alt={block.alt}
                            width={block.media.width}
                            height={block.media.height}
                            unoptimized
                            loading="lazy"
                          />
                        </button>
                        {block.caption && (
                          <figcaption>
                            <RichText text={block.caption} />
                          </figcaption>
                        )}
                      </figure>
                    )
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
      <dialog
        ref={dialog}
        className={s.dialog}
        aria-label="Image viewer"
      >
        <nav>
          <button onClick={() => move(-1)} disabled={images.length < 2}>
            ← prev
          </button>
          <span>
            {index + 1} / {images.length}
          </span>
          <button onClick={() => move(1)} disabled={images.length < 2}>
            next →
          </button>
          <button onClick={() => dialog.current?.close()}>Close ×</button>
        </nav>
        {current?.media && (
          <Image
            src={`/media/${current.media.id}`}
            alt={current.alt}
            width={current.media.width}
            height={current.media.height}
            unoptimized
          />
        )}
      </dialog>
    </>
  );
}
