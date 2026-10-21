export default function Loading() {
  return (
    <div className="py-8 animate-pulse">
      {/* output 隐式 role="status"：向辅助技术播报加载状态 */}
      <output className="sr-only">加载中</output>
      {/* 标题区骨架 */}
      <div className="h-9 w-40 rounded bg-border/60" />
      <div className="mt-3 h-4 w-64 rounded bg-border/40" />

      {/* 列表骨架 */}
      <div className="mt-12 space-y-7">
        {Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 纯展示的静态骨架列表，无重排风险
          <div key={i} className="space-y-2.5">
            <div className="h-5 w-3/4 rounded bg-border/60" />
            <div className="h-4 w-full rounded bg-border/40" />
            <div className="h-4 w-1/2 rounded bg-border/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
