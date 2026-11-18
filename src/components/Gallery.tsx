import Image from 'next/image';
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
  return <div className={s.columns}>{[0, 1, 2].map(column => <div key={column} className={s.column}>
    {blocks.filter(block => block.column === column).map(block => <div className={s.block} key={block.id}>
      {block.kind === 'TEXT' ? <RichText text={block.text ?? ''}/> : block.media && <figure>
        <Image src={`/media/${block.media.id}`} alt={block.alt} width={block.media.width} height={block.media.height} unoptimized loading="lazy"/>
        {block.caption && <figcaption><RichText text={block.caption}/></figcaption>}
      </figure>}
    </div>)}
  </div>)}</div>;
}
