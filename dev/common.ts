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

import child_process from 'child_process'

export function getUserDocsPath (platform: 'win32' | 'darwin') {
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
}
