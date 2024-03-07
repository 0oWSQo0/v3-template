module.exports = {
  extends: ['cz'],
  rules: {
    'type-empty': [0, 'never'], //不允许提交的类型为空
    'subject-empty': [0, 'never'] //不允许提交的内容为空
  }
}
