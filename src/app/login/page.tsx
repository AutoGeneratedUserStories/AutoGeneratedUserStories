"use server";

import { redirect } from 'next/navigation';
import { Argon2id } from 'oslo/password';
import { cookies } from 'next/headers';
import Form from 'next/form';
import Link from 'next/link';
import { validateRequest, lucia } from '../lib/auth';
import { UserModel } from '../models/user';
import { loginSchema } from '../lib/schema';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { user } = await validateRequest();
  const { error } = await searchParams || {};
  
  if (user) {
    return redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-md rounded px-8 py-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && (
          <p className="mb-4 text-red-500 text-sm">{error}</p>
        )}
        <Form action={login} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700">Username:</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Sign In
          </button>
        </Form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

async function login(formData: FormData) {
  'use server';

  // Extract form values and validate them with Zod
  const data = {
    username: formData.get('username')?.toString() ?? '',
    password: formData.get('password')?.toString() ?? '',
  };

  const result = loginSchema.safeParse(data);
  if (!result.success) {
    // Use the first validation error message for feedback
    const errorMsg = result.error.errors[0].message;
    return redirect('/login?error=' + encodeURIComponent(errorMsg));
  }

  const existingUser = await UserModel.findOne({ username: data.username });
  
  // If user doesn't exist, return an error
  if (!existingUser) {
    return redirect('/login?error=' + encodeURIComponent("Invalid username or password"));
  }

  // Verify the password using Argon2id
  const validPassword: boolean = await new Argon2id().verify(
    existingUser.password,
    data.password
  );
  if (!validPassword) {
    return redirect('/login?error=' + encodeURIComponent("Invalid username or password"));
  }

  // Create a session if credentials are valid
  const session = await lucia.createSession(existingUser._id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect('/');
}
