import Image from 'next/image';

interface Friend {
  name: string;
  url: string;
  avatar?: string;
  description?: string;
}

// 友链数据 - 后续可迁移到 Notion 数据库
const friends: Friend[] = [
  // 在此添加友链数据，或后续从 Notion 同步
  // {
  //   name: '朋友的小站',
  //   url: 'https://example.com',
  //   avatar: 'https://example.com/avatar.png',
  //   description: '一句话介绍',
  // },
];

function FriendCard({ friend }: { friend: Friend }) {
  return (
    <a
      href={friend.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
    >
      {friend.avatar ? (
        <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden bg-muted">
          <Image
            src={friend.avatar}
            alt={friend.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="w-12 h-12 shrink-0 rounded-full bg-muted flex items-center justify-center text-lg font-medium text-secondary">
          {friend.name[0]}
        </div>
      )}
      <div className="min-w-0">
        <h3 className="font-medium group-hover:text-foreground transition-colors truncate">
          {friend.name}
        </h3>
        {friend.description && (
          <p className="text-sm text-secondary truncate">{friend.description}</p>
        )}
      </div>
    </a>
  );
}

export default function FriendsPage() {
  return (
    <div className="py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">友情链接</h1>
        <p className="text-secondary text-sm mt-1">
          那些在数字世界中相遇的朋友们。
        </p>
      </header>

      {friends.length === 0 ? (
        <div className="py-16 text-center text-secondary">
          <p className="text-4xl mb-4">🤝</p>
          <p>暂无友链，欢迎交换！</p>
          <p className="text-xs mt-2">
            如需交换友链，请通过以下方式联系我：
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <a href="mailto:your@email.com" className="text-foreground hover:underline">
              Email
            </a>
            <a
              href="https://github.com/your-username"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {friends.map((friend) => (
            <FriendCard key={friend.url} friend={friend} />
          ))}
        </div>
      )}

      {/* 友链申请说明 */}
      <section className="mt-12 p-6 rounded-xl border border-border bg-muted/30">
        <h2 className="font-semibold mb-3">友链申请</h2>
        <p className="text-sm text-secondary leading-relaxed">
          如果你也有自己的博客或小站，欢迎与我交换友链。请在你的网站中添加本站链接后，
          通过邮件联系我，附上你的站点信息：
        </p>
        <ul className="mt-3 text-sm text-secondary space-y-1 list-disc list-inside">
          <li>站点名称</li>
          <li>站点链接</li>
          <li>头像链接（可选）</li>
          <li>一句话描述</li>
        </ul>
      </section>
    </div>
  );
}
