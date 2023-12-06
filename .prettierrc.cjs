module.exports = {
  "printWidth": 200,          // 一行最多多少个字符
  "tabWidth": 2,              // 指定每个缩进级别的空格数
  "useTabs": false,           // 使用tab缩进
  "semi": false,              // 在语句末尾自动添加分号
  "singleQuote": true,        // 使用单引号
  // 更改引用对象属性的时间 可选值"<as-needed|consistent|preserve>"
  "quoteProps": "preserve",
  // 多行时尽可能打印尾随逗号。（例如，单行数组永远不会出现逗号结尾。） 可选值"<none|es5|all>"，默认none
  "trailingComma": "none",
  "bracketSpacing": true, // 在对象文字中的括号之间打印空格
  // 在单独的箭头函数参数周围包括括号 always：(x) => x \ avoid：x => x
  "arrowParens": "avoid",
  // 这两个选项可用于格式化以给定字符偏移量（分别包括和不包括）开始和结束的代码
  "rangeStart": 0,
  "rangeEnd": Infinity,
  // 指定要使用的解析器，不需要写文件开头的 @prettier
  "requirePragma": false,
  // 不需要自动在文件开头插入 @prettier
  "insertPragma": false,
  // 使用默认的折行标准 always\never\preserve
  "proseWrap": "preserve",
  // 指定HTML文件的全局空格敏感度 css\strict\ignore
  "htmlWhitespaceSensitivity": "css",
  "vueIndentScriptAndStyle": false, // Vue文件script和style标签是否缩进
  // 换行符使用 lf 结尾是 可选值"<auto|lf|crlf|cr>"
  "endOfLine": "lf",
  // 'padded-blocks': 0, //块语句内行首行尾是否要空行
  // 'space-before-blocks': [0, 'always'],
  // 'no-whitespace-before-property': 2, //链式允许多空格
}
