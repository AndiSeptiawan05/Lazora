import { NextResponse } from 'next/server';
import { authState } from '../state';

export async function POST() {
  if (authState.activeLogins > 0) {
    authState.activeLogins--;
  }
  return NextResponse.json({ success: true, activeLogins: authState.activeLogins });
}
