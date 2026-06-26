'use client';

import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote';
import CodeBlock from '@/components/ui/CodeBlock';
import ImageViewer from '@/components/ui/ImageViewer';
import Prose from '@/components/ui/Prose';

const components = {
  img: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <ImageViewer
      src={src}
      alt={alt || ''}
      className=""
      width={800}
      height={500}
    />
  ),
  pre: CodeBlock,
};

interface MdxRendererProps {
  source: MDXRemoteSerializeResult;
  className?: string;
}

export default function MdxRenderer({ source, className }: MdxRendererProps) {
  return (
    <Prose className={className}>
      <MDXRemote {...source} components={components} />
    </Prose>
  );
}
