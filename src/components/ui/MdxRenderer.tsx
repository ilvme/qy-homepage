"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import ImageViewer from "@/components/ui/ImageViewer";
import Prose from "@/components/ui/Prose";

// 自定义组件（可选）
const components = {
  img: ({ src, alt, ...props }: { src: string; alt: string }) => {
    // 从 props 中提取可能的宽高（MDX 可能传递 width/height 属性）
    // 如果没有，提供默认值
    return (
      <ImageViewer
        src={src}
        alt={alt || ""}
        className=""
        width={800}
        height={500}
      />
    );
  },
  // // 使用 Next.js 的 Image 组件优化图片
  // img: ({ src, alt, ...props }: { src: string; alt: string }) => {
  //   // 本地图片路径以 / 开头，直接传给 next/image
  //   return (
  //     <span className="my-4 block">
  //       <Image
  //         src={src}
  //         alt={alt}
  //         width={800}
  //         height={500}
  //         className="rounded-lg"
  //         {...props}
  //       />
  //     </span>
  //   );
  // },
  // // 代码块高亮（需要额外安装 rehype-highlight 或使用 shiki）
  // // 这里简单用 pre/code，后续可集成
  // pre: ({ children }: { children: ReactNode }) => (
  //   <pre className="bg-gray-100 p-4 rounded overflow-auto">{children}</pre>
  // ),
  // code: ({
  //   children,
  //   className,
  // }: {
  //   children: ReactNode;
  //   className?: string;
  // }) => {
  //   const language = className?.replace("language-", "") || "text";
  //   return <code className={`language-${language}`}>{children}</code>;
  // },
};

interface MdxRendererProps {
  source: MDXRemoteSerializeResult;
}

export default function MdxRenderer({ source }: MdxRendererProps) {
  return (
    <Prose>
      <MDXRemote {...source} components={components} />
    </Prose>
  );
}
