//app/login/page.tsx
 
import dbConnect from '@/db/mongoose';
import userModel from '@/models/user-model';
import { redirect } from 'next/navigation';
import { lucia, validateRequest } from '@/lib/auth';
import { Argon2id } from 'oslo/password';
import { cookies } from 'next/headers';
 
export default function LoginPage() {
  const { user } = await validateRequest();
  if (user) {
    return redirect('/');
  }
 
  return <Form action={login}>// your form fields</Form>;
}
 
async function login(_: any, formData: FormData) {
  'use server';
 
  const username = formData.get('username');
  const password = formData.get('password');
 
  // you can use zod or any other library to validate the formData
 
  await dbConnect();
  const existingUser = await userModel.findOne({ username: username });
 
  const validPassword = await new Argon2id().verify(
    existingUser.password,
    password
  );
 
  const session = await lucia.createSession(existingUser._id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect('/');
}