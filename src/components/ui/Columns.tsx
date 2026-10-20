import type { ReactNode } from 'react';

interface ColumnsProps {
  cols?: number;
  children: ReactNode;
}

export function Columns({ cols = 2, children }: ColumnsProps) {
  return (
    <div
      // grid 容器是独立 BFC，列内 margin 不与外部折叠，需在此手动对齐正文节奏：
      // - [&_p]:!my-0：清掉列内 p 的 prose-p:my-5（否则与自身 my-5 叠加翻倍）；
      //   段间距由 [&_p+p]:!mt-5 恢复，列内首尾 p 贴边（text-md-notion.md 等存在纯文字列）
      // - [&_p>span]:!my-0：ImageViewer 外层 my-4 会折叠穿透 margin 为 0 的 p，一并清掉
      // - [&>div>br]:hidden：Notion 空段落同步产物裸 br，独占约 26px 行框；
      //   仅隐藏 Column 直接子级的块级 br，段内行内 br 不受影响
      className="my-5 [&_p]:!my-0 [&_p>span]:!my-0 [&_p+p]:!mt-5 [&>div>br]:hidden"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '.6rem',
      }}
    >
      {children}
    </div>
  );
}

export function Column({ children }: { children: ReactNode }) {
  return <div className="min-w-0">{children}</div>;
}
