# MIDI Remote API Scripts

MIDI Remote API Script for the Keychron V6 Max. To be used with the customized QMK firmware available at [ThrRip/qmk_firmware](https://github.com/ThrRip/qmk_firmware).

## Installation

1. Download the [latest release build](https://github.com/ThrRip/midiremote-userscripts/releases/latest). It should be the file named `ThrRip-midiremote-userscripts-snapshot-[...].zip`. Unzip it.

2. In Cubase or Nuendo, add _Scripting Tools_ to the toolbar of the _MIDI Remote_ tab in the lower zone.

   ![Adding Scripting Tools to the MIDI Remote tab toolbar](https://steinbergmedia.github.io/midiremote_api_doc/assets/images/project_window_with_overlays-6e39f835749d2e5a9ddb43901b74f1a1.png)

3. Click on _Open Script Folder_.

4. Make a backup of the `Local` folder in the script folder.

5. Copy all files **inside** of the `ThrRip-midiremote-userscripts` folder extracted from the zip file, into the `Local` folder.

   Now you should have a folder structure like:

   ```
   <Script Folder>/Local/<vendor>/<device>/<vendor>_<device>.js
   ```

6. Click on _Reload Scripts_. Enjoy!

## Development

Make sure you have [Git](https://git-scm.com), [Node.js](https://nodejs.org), and [pnpm](https://pnpm.io) installed. You'll also need an IDE, i.e. [Visual Studio Code](https://code.visualstudio.com/).

1. Clone the repository

   Open a terminal in the directory of your choice, and run:

   ```sh
   git clone https://github.com/ThrRip/midiremote-userscripts.git
   cd midiremote-userscripts
   ```

2. Install dependencies

   ```sh
   pnpm install
   ```

   Wait until it finishes with:

   ```
   "midiremote_api_v1" copied from "..." to ".api".
   ```

3. Make changes to the source code

   The source code is located at `src/keychron/v6_max_encoder/keychron_v6_max_encoder.ts` with ESNext syntax available.

   After changes were made, compile it to ES5 JavaScript and install it to the Cubase/Nuendo MIDI Remote Driver Scripts directory with:

   ```sh
   pnpm run build
   pnpm run deploy
   ```

4. Reload the scripts in Cubase/Nuendo and test the changes.

---

This project is licensed under the [Apache License, Version 2.0](https://github.com/ThrRip/midiremote-userscripts/blob/main/LICENSE).

Cubase and Nuendo are registered trademarks of Steinberg Media Technologies GmbH. Keychron is a registered trademark of Keychron (Shenzhen) Innovation Technology Co.,Ltd. This project is not affiliated with Steinberg Media Technologies GmbH or Keychron (Shenzhen) Innovation Technology Co.,Ltd.
