import { NextResponse } from 'next/server';
import { authState } from '../state';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username === 'awanhanlynx' && password === 'awanhanlynx') {
      if (authState.activeLogins < authState.maxLogins) {
        authState.activeLogins++;
        return NextResponse.json({ success: true, activeLogins: authState.activeLogins });
      } else {
        return NextResponse.json({ success: false, message: 'Quota exceeded. Maximum users reached.' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Bad request' }, { status: 400 });
  }
}
