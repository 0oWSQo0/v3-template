module.exports = {
  ignores: [commit => commit.includes('init')],
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 108],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'subject-case': [0],
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新增功能
        'fix', // 修复缺陷
        'docs', // 文档变更
        'style', // 代码格式（不影响功能，例如空格、分号等格式修正）
        'refactor', // 代码重构（不包括 bug 修复、功能新增）
        'perf', // 性能优化
        'test', // 添加疏漏测试或已有测试改动
        'build', // 构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）
        'ci', // 修改 CI 配置、脚本
        'revert', // 回滚 commit
        'chore' // 对构建过程或辅助工具和库的更改（不影响源文件、测试用例）
      ]
    ]
  },
  prompt: {
    types: [
      // { value: '特性', name: '特性:   🚀  新增功能', emoji: '🚀' },
      // { value: '修复', name: '修复:   🧩  修复缺陷', emoji: '🧩' },
      // { value: '文档', name: '文档:   📚  文档变更', emoji: '📚' },
      // { value: '格式', name: '格式:   🎨  代码格式（不影响功能，例如空格、分号等格式修正）', emoji: '🎨' },
      // { value: '重构', name: '重构:   ♻️  代码重构（不包括 bug 修复、功能新增）', emoji: '♻️' },
      // { value: '性能', name: '性能:   ⚡️  性能优化', emoji: '⚡️' },
      // { value: '测试', name: '测试:   ✅  添加疏漏测试或已有测试改动', emoji: '✅' },
      // { value: '构建', name: '构建:   📦️  构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）', emoji: '📦️' },
      // { value: '集成', name: '集成:   🎡  修改 CI 配置、脚本', emoji: '🎡' },
      // { value: '回退', name: '回退:   ⏪️  回滚 commit', emoji: '⏪️' },
      // { value: '其他', name: '其他:   🔨  对构建过程或辅助工具和库的更改（不影响源文件、测试用例）', emoji: '🔨' }
    ]
  }
}
