/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  singleAttributePerLine: false,
  endOfLine: 'lf',
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  embeddedLanguageFormatting: 'auto',
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './app/globals.css',
}

export default config
