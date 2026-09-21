import type { Resource } from './sc.js';

/** 繁体中文。 */
export const tc: Resource = {
  common: {
    brand: '知行',
    motto: '學 · 做 · 考 · 記，一體貫通',
    tab: {
      notes: '學習中心',
      exams: '考試中心',
      documents: '文件中心',
    },
  },
  pages: {
    notes: {
      title: '學習中心',
      placeholder: '筆記與學習材料的輸入、整理、回顧（待實現）',
    },
    exams: {
      title: '考試中心',
      placeholder: '測驗、考試與練習（待實現）',
    },
    documents: {
      title: '文件中心',
      placeholder: '文件與知識的沉澱、管理（待實現）',
    },
  },
  auth: {
    signInTitle: '登入',
    signUpTitle: '註冊',
    email: '信箱',
    password: '密碼',
    name: '暱稱',
    signIn: '登入',
    signUp: '註冊',
    signOut: '登出',
    noAccount: '還沒有帳號？',
    goRegister: '去註冊',
    alreadyHaveAccount: '已有帳號？',
    goLogin: '去登入',
    errors: {
      invalidCredentials: '信箱或密碼不正確',
      passwordTooShort: '密碼至少 8 位',
      emailInUse: '該信箱已被註冊',
    },
  },
};