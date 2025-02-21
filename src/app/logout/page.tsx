import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ActionResult } from 'next/dist/server/app-render/types';
import Form from 'next/form';
import { lucia, validateRequest } from '../lib/auth';
 
export default async function Logout() {
  return (
    <Form action={logout}>
      <button>Sign out</button>
    </Form>
  );
}
 
async function logout(): Promise<ActionResult> {
  'use server';
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: 'Unauthorized',
    };
  }
 
  await lucia.invalidateSession(session.id);
 
  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect('/login');
}