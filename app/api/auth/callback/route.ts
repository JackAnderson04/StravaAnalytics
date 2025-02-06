// app/api/auth/callback/route.ts
import { NextRequest } from 'next/server';
import { getToken } from '@/utils/oauth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    // Redirect to home page with error
    return Response.redirect(`${request.nextUrl.origin}/?error=${error}`);
  }

  if (!code) {
    return Response.redirect(`${request.nextUrl.origin}/?error=no_code`);
  }

  try {
    const tokenData = await getToken(code);
    // Redirect to dashboard with token in URL fragment
    // The client-side code will pick this up and store it
    return Response.redirect(`${request.nextUrl.origin}/dashboard#access_token=${tokenData.access_token}`);
  } catch (error) {
    console.error('Token exchange failed:', error);
    return Response.redirect(`${request.nextUrl.origin}/?error=token_exchange_failed`);
  }
}