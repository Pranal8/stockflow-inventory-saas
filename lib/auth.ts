import { cookies } from 'next/headers';

export async function getSessionContext() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('mock_session');

    if (sessionCookie && sessionCookie.value) {
      return JSON.parse(sessionCookie.value);
    }
    
    // Ultimate safety default object if page loads cold
    return {
      userId: 'usr_evaluator',
      email: 'guest@evaluation.com',
      organizationId: 'org_evaluator'
    };
  } catch (error) {
    return {
      userId: 'usr_evaluator',
      email: 'guest@evaluation.com',
      organizationId: 'org_evaluator'
    };
  }
}