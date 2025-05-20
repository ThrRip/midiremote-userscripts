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

import assert from 'assert'

import os from 'os'
import fs from 'fs'
import path from 'path'

import { getUserDocsPath } from './common.js'

const platform = os.platform()

assert.ok(platform === 'win32' || platform === 'darwin', 'Only Windows and macOS are supported.')

const userDocsPath = getUserDocsPath(platform)

const userDocsSteinbergItems = fs.readdirSync(path.join(userDocsPath, 'Steinberg'))
assert.ok(
  userDocsSteinbergItems.includes('Cubase') || userDocsSteinbergItems.includes('Nuendo'),
  'Neither Cubase nor Nuendo is installed.'
)

const scriptPaths = (() => {
  const paths: Array<string> = []
  if (userDocsSteinbergItems.includes('Cubase')) {
    paths.push(path.join(userDocsPath, 'Steinberg/Cubase/MIDI Remote/Driver Scripts/Local'))
  }
  if (userDocsSteinbergItems.includes('Nuendo')) {
    paths.push(path.join(userDocsPath, 'Steinberg/Nuendo/MIDI Remote/Driver Scripts/Local'))
  }
  return paths
})()
const distFiles = (() => {
  const files: Array<string> = []
  fs
    .readdirSync('dist', { withFileTypes: true, recursive: true })
    .forEach(dirent => {
      if (dirent.isFile()) files.push(path.join(dirent.parentPath, dirent.name))
    })
  return files
})()
scriptPaths.forEach(scriptPath => {
  fs.cpSync('dist/', scriptPath, { force: true, recursive: true })
  distFiles.forEach(file => {
    console.log(
      `Copied "${file}" to ` +
      `"${path.join(scriptPath, file.replace(/^dist[/\\]+/, ''))}".`
    )
  })
})
