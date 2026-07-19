export default function Prose({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`prose dark:prose-invert prose-p:my-5 prose-code:before:content-none prose-code:after:content-none prose-a:font-normal prose-a:text-inherit prose-a:decoration-1 prose-blockquote:[&_p]:before:content-none prose-blockquote:[&_p]:after:content-none max-w-none leading-relaxed wrap-break-word ${className}`}
    >
      {children}
    </article>
  );
}
