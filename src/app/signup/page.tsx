"use server";

import { Argon2id } from 'oslo/password';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import connectDB from '../lib/connectDB';
import { validateRequest, lucia } from '../lib/auth';
import Form from 'next/form';
import Link from 'next/link';
import { UserModel } from '../models/user';
import { z } from 'zod';
import { loginSchema } from '../lib/schema';

export default async function Page({ searchParams }: { searchParams?: { error?: string } }) {
  const { user } = await validateRequest();
  if (user) {
    return redirect('/');
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-md rounded px-8 py-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {searchParams?.error && (
          <p className="mb-4 text-red-500 text-sm">{searchParams.error}</p>
        )}
        <Form action={signup} className="space-y-4">
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
            Sign Up
          </button>
        </Form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

async function signup(formData: FormData) {
  'use server';

  // Extract and normalize form data
  const data = {
    username: formData.get('username')?.toString() ?? '',
    password: formData.get('password')?.toString() ?? ''
  };

  // Validate data using the Zod schema
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    // Redirect back with the first error message if validation fails
    const errorMsg = result.error.errors[0].message;
    return redirect('/signup?error=' + encodeURIComponent(errorMsg));
  }

  await connectDB();

  // Check if the username is already taken
  const existingUser = await UserModel.findOne({ username: result.data.username });
  if (existingUser) {
    return redirect('/signup?error=' + encodeURIComponent("Username already exists"));
  }

  // Hash the password and create the new user
  const hashedPassword = await new Argon2id().hash(result.data.password);
  const user = await UserModel.create({
    username: result.data.username,
    password: hashedPassword,
  });

  // Create a session and set the session cookie
  const session = await lucia.createSession(user._id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect('/');
}
