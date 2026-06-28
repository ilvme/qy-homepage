interface EmptyShowerProps {
  message?: string;
}

export function EmptyShower({ message = '暂无内容' }: EmptyShowerProps) {
  return <p className="text-secondary text-sm py-16 text-center">{message}</p>;
}
