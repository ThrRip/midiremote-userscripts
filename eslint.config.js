/*
 * Copyright 2025 ThrRip
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import js from '@eslint/js'
import ts from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'

export default ts.config(
  {
    ignores: [
      // Source code is pure TypeScript
      '**/*.js',
      // Config files at workspace root should still be included
      '!*.js'
    ]
  },
  js.configs.recommended,
  ts.configs.recommended,
  stylistic.configs.recommended,
  {
    // Scripts used during development
    files: ['dev/**/*.ts'],
    languageOptions: {
      globals: globals.node
    }
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  },
  {
    rules: {
      'require-await': 'error',
      '@typescript-eslint/ban-ts-comment': ['error', {
        'ts-expect-error': false,
        'ts-nocheck': false
      }],
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }],
      '@stylistic/arrow-parens': ['error', 'as-needed', { requireForBlockBody: false }],
      '@stylistic/comma-dangle': ['error', 'never'],
      '@stylistic/indent': ['error', 2, {
        ignoredNodes: ['IfStatement[alternate.type="IfStatement"]'],
        SwitchCase: 1
      }],
      '@stylistic/indent-binary-ops': 'off',
      '@stylistic/max-statements-per-line': ['error', { max: 2 }],
      '@stylistic/operator-linebreak': ['error', 'after'],
      '@stylistic/space-before-function-paren': ['error', 'always']
    }
  }
)
