interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = '暂无内容' }: EmptyStateProps) {
  return (
    <p className="text-secondary text-sm py-16 text-center">{message}</p>
  );
}
