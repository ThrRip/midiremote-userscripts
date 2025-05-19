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
import child_process from 'child_process'
import fs from 'fs'
import path from 'path'

const platform = os.platform()

assert.ok(
  platform === 'win32' || platform === 'darwin',
  'Only Windows and macOS are supported.\n' +
  'API is not set up, and you may see TypeScript errors.'
)

const userDocsPath = (() => {
  switch (platform) {
    case 'win32':
      // Get the path of the "Documents" directory with .NET methods in PowerShell
      return child_process
        .execSync(
          'powershell -Command "' +
            '$OutputEncoding = ' +
              '[Console]::InputEncoding = [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new(); ' +
            '[Environment]::GetFolderPath(\'MyDocuments\')' +
          '"',
          { encoding: 'utf8' }
        )
        .replace('\r\n', '')
    case 'darwin':
      return '~/Documents'
  }
})()

const userDocsSteinbergItems = fs.readdirSync(path.join(userDocsPath, 'Steinberg'))
assert.ok(
  userDocsSteinbergItems.includes('Cubase') || userDocsSteinbergItems.includes('Nuendo'),
  'Neither Cubase nor Nuendo is installed.\n' +
  'API is not set up, and you may see TypeScript errors.'
)

const apiPath = (() => {
  if (userDocsSteinbergItems.includes('Nuendo')) {
    if (userDocsSteinbergItems.includes('Cubase')) {
      console.log('Both Cubase and Nuendo installations were found. The API package from Nuendo will be used.')
    }
    return path.join(userDocsPath, 'Steinberg/Nuendo/MIDI Remote/Driver Scripts/.api')
  }
  else return path.join(userDocsPath, 'Steinberg/Cubase/MIDI Remote/Driver Scripts/.api')
})()

fs.rmSync('.api', { force: true, recursive: true })
fs.cpSync(apiPath, '.api', { force: true, recursive: true })
console.log(`"midiremote_api_v1" copied from "${apiPath}" to ".api".`)
