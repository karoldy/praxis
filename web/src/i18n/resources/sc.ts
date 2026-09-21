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
};

export type Resource = typeof sc;