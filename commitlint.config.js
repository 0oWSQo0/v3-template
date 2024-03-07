module.exports = {
  extends: ['cz'],
  rules: {
    // 'body-leading-blank': [2, 'always'],
    // 'footer-leading-blank': [1, 'always'],
    // 'header-max-length': [2, 'always', 108],
    // 'subject-empty': [2, 'never'],
    // 'type-empty': [2, 'never'],
    // 'subject-case': [0],
    // 'type-enum': [
    //   2,
    //   'always',
    //   [
    //     'feat', // 新增功能
    //     'fix', // 修复缺陷
    //     'docs', // 文档变更
    //     'style', // 代码格式（不影响功能，例如空格、分号等格式修正）
    //     'refactor', // 代码重构（不包括 bug 修复、功能新增）
    //     'perf', // 性能优化
    //     'test', // 添加疏漏测试或已有测试改动
    //     'build', // 构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）
    //     'ci', // 修改 CI 配置、脚本
    //     'revert', // 回滚 commit
    //     'chore' // 对构建过程或辅助工具和库的更改（不影响源文件、测试用例）
    //   ]
    // ]
  },
  prompt: {
    types: [
      { value: '🚀 新增  ', name: '新增:  新的内容' },
      { value: '🧩 修复  ', name: '修复:  修复一个Bug' },
      { value: '📝 文档  ', name: '文档:  变更的只有文档' },
      { value: '🎨 格式  ', name: '格式:  空格, 分号等格式修复' },
      { value: '♻️ 重构  ', name: '重构:  代码重构，注意和特性、修复区分开' },
      { value: '📦️ 构建  ', name: '构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）' },
      { value: '⚡️ 性能  ', name: '性能:  提升性能' },
      { value: '✅ 测试  ', name: '测试:  添加一个测试' },
      { value: '🔨 工具  ', name: '工具:  开发工具变动(构建、脚手架工具等)' },
      { value: '⏪ 回滚  ', name: '回滚:  代码回退' }
    ]
  }
}
