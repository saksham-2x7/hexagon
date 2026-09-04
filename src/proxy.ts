import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/home', '/lesson', '/tutor', '/profile', '/learning', '/progress', '/flashcards', '/planner', '/library', '/setup'];
const authRoutes = ['/login', '/signup'];

export function proxy(request: NextRequest) {
  // Check auth cookie or token (using a dummy check for now since we use Zustand client-side)
  // In a real app we would check cookies. Since this is a prototype using Zustand localStorage, 
  // we can't reliably read it in Next.js edge middleware.
  // We'll let client components handle it via useAuthStore.
  
  // If we really wanted to guard, we'd check `request.cookies.get('auth-token')`
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
