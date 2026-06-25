import Image from 'next/image';

export default function SponsorPage() {
  return (
    <div className="py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">赞赏</h1>
        <p className="text-secondary text-base mt-1">
          如果我的内容对你有帮助，欢迎请我喝杯咖啡 ☕️
        </p>
      </header>

      <div className="max-w-xs mx-auto text-center space-y-4">
        <Image
          src="/images/wechat-sponsor-qr.jpg"
          alt="微信赞赏码"
          width={400}
          height={400}
          className="w-full rounded-xl border border-border"
          priority
        />
        <p className="text-xs text-muted-foreground">
          打开微信扫一扫，识别赞赏码
        </p>
      </div>
    </div>
  );
}
