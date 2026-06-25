export default function SponsorPage() {
  return (
    <div className="py-8 space-y-8">
      <header className="text-center space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">赞赏</h1>
        <p className="text-secondary text-sm max-w-md mx-auto">
          如果我的内容对你有帮助，或只是想表达一份心意，可以通过以下方式请我喝杯咖啡。
          谢谢你的支持，这将是我继续创作的动力。
        </p>
      </header>

      <div className="max-w-md mx-auto space-y-8">
        {/* 微信赞赏码 */}
        <section className="p-6 rounded-xl border border-border text-center space-y-4">
          <div className="w-48 h-48 mx-auto rounded-xl bg-muted flex items-center justify-center">
            <div className="text-center text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-2"
              >
                <title>微信</title>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <p className="text-sm">微信赞赏码</p>
              <p className="text-xs">（请替换为你的二维码图片）</p>
            </div>
          </div>
          <p className="text-sm text-secondary">微信</p>
        </section>

        {/* 支付宝 */}
        <section className="p-6 rounded-xl border border-border text-center space-y-4">
          <div className="w-48 h-48 mx-auto rounded-xl bg-muted flex items-center justify-center">
            <div className="text-center text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-2"
              >
                <title>支付宝</title>
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <p className="text-sm">支付宝收款码</p>
              <p className="text-xs">（请替换为你的二维码图片）</p>
            </div>
          </div>
          <p className="text-sm text-secondary">支付宝</p>
        </section>

        {/* 感谢语 */}
        <div className="text-center py-6">
          <p className="text-secondary text-sm">
            每一份赞赏都是一份温暖的鼓励
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            感谢所有支持过我的朋友们 ❤️
          </p>
        </div>
      </div>
    </div>
  );
}
