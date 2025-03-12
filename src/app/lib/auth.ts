import { Lucia } from 'lucia';
import { cookies } from 'next/headers';
import { cache } from 'react';
import type { Session, User } from 'lucia';
import { adapter } from '../models/session';
 
interface UserAttributes {
  username: string;
  projects: string[];
  geminiKey: string;
  trelloApiKey: string;
  trelloApiToken: string;
}

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getUserAttributes: (attributes: UserAttributes) => {
    return {
      username: attributes.username,
      projects: attributes.projects,
      geminiKey: attributes.geminiKey,
      trelloApiKey: attributes.trelloApiKey,
      trelloApiToken: attributes.trelloApiToken,
    };
  },
});

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }
 
    const result = await lucia.validateSession(sessionId);
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch {}
    return result;
  }
);
 
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: UserAttributes;
  }
}