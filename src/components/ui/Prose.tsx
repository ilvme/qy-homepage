export default function Prose({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`prose prose-p:my-5 prose-blockquote:[&_p]:before:content-none prose-blockquote:[&_p]:after:content-none max-w-none leading-relaxed wrap-break-word ${className}`}
    >
      {children}
    </article>
  );
}
