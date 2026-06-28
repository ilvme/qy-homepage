import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // login 页面不拦截
  if (pathname === '/login') return NextResponse.next();

  // 仅保护 /manage
  if (!pathname.startsWith('/manage')) return NextResponse.next();

  const password = process.env.MANAGE_PASSWORD;
  if (!password) {
    return new NextResponse('MANAGE_PASSWORD not configured', { status: 500 });
  }

  const token = request.cookies.get('manage_token')?.value;
  if (token === password) return NextResponse.next();

  // 密码错误：清除 cookie，回登录页
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  if (token) {
    loginUrl.searchParams.set('error', '1');
  }
  const res = NextResponse.redirect(loginUrl);
  res.cookies.delete('manage_token');
  return res;
}

export const config = {
  matcher: '/manage/:path*',
};
