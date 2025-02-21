import { Argon2id } from 'oslo/password';
import { cookies } from 'next/headers';
import { lucia, validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import userModel from '@/models/user-model';
import dbConnect from '@/db/mongoose';
 
export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect('/');
  }
  return <Form action={signup}>// your form fields</Form>;
}
 
async function signup(_: any, formData: FormData) {
  'use server';
  const username = formData.get('username');
  const password = formData.get('password');
 
  const hashedPassword = await new Argon2id().hash(password);
 
  try {
    await dbConnect();
    const user = await userModel.create({
      username: username,
      password: hashedPassword,
    });
 
    const session = await lucia.createSession(user._id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  } catch (e) {
    console.log('error', e);
    return {
      error: 'An unknown error occurred',
    };
  }
  return redirect('/');
}