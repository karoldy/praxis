import type { Resource } from './sc.js';

/** English. */
export const en: Resource = {
  common: {
    brand: 'Praxis',
    motto: 'Learn · Do · Test · Record',
    tab: {
      notes: 'Learning',
      exams: 'Exams',
      documents: 'Documents',
    },
  },
  pages: {
    notes: {
      title: 'Learning Center',
      placeholder: 'Input, organize and review notes & study materials (coming soon)',
    },
    exams: {
      title: 'Exam Center',
      placeholder: 'Quizzes, exams and practice (coming soon)',
    },
    documents: {
      title: 'Document Center',
      placeholder: 'Document and knowledge management (coming soon)',
    },
  },
  auth: {
    signInTitle: 'Sign in',
    signUpTitle: 'Create account',
    email: 'Email',
    password: 'Password',
    name: 'Display name',
    signIn: 'Sign in',
    signUp: 'Sign up',
    signOut: 'Sign out',
    noAccount: 'No account yet?',
    goRegister: 'Register',
    alreadyHaveAccount: 'Already have an account?',
    goLogin: 'Sign in',
    errors: {
      invalidCredentials: 'Incorrect email or password',
      passwordTooShort: 'Password must be at least 8 characters',
      emailInUse: 'This email is already registered',
    },
  },
};