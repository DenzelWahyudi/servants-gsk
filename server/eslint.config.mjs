import js from '@eslint/js'
import globals from 'globals'
import prettier from 'eslint-config-prettier'

export default [
  {
  ignores: ['node_modules', 'dist'],
  },

  js.configs.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },

  prettier,
]