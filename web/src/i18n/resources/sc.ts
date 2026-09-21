/**
 * 简体中文（默认）—— UI 文案资源。语言键与 sc/tc/en 对齐，用于前端切语。
 */
export const sc = {
  common: {
    brand: '知行',
    motto: '学 · 做 · 考 · 记，一体贯通',
    tab: {
      notes: '学习中心',
      exams: '考试中心',
      documents: '文档中心',
    },
  },
  pages: {
    notes: {
      title: '学习中心',
      placeholder: '笔记与学习材料的输入、整理、回顾（待实现）',
    },
    exams: {
      title: '考试中心',
      placeholder: '测验、考试与练习（待实现）',
    },
    documents: {
      title: '文档中心',
      placeholder: '文档与知识的沉淀、管理（待实现）',
    },
  },
  auth: {
    signInTitle: '登录',
    signUpTitle: '注册',
    email: '邮箱',
    password: '密码',
    name: '昵称',
    signIn: '登录',
    signUp: '注册',
    signOut: '登出',
    noAccount: '还没有账号？',
    goRegister: '去注册',
    alreadyHaveAccount: '已有账号？',
    goLogin: '去登录',
    errors: {
      invalidCredentials: '邮箱或密码不正确',
      passwordTooShort: '密码至少 8 位',
      emailInUse: '该邮箱已被注册',
    },
  },
};

export type Resource = typeof sc;