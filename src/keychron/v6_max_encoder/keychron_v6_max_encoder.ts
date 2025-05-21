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

// ----------------------------------------------------------------------------
// 0. CONFIGURATIONS
// ----------------------------------------------------------------------------

/* eslint-disable @stylistic/no-multi-spaces */
const VENDOR_NAME    = 'Keychron'
const DEVICE_NAME    = 'V6 Max Knob'
const SCRIPT_CREATOR = 'ThrRip'

const MIDI_PORT_NAMES_INPUT = ['Keychron V6 Max', 'loopMIDI']
const MIDI_CHANNEL = 1 // 0-based, so 1 is the second channel
const MIDI_CC_NUMBERS = [
  102, 103, 104, 105, 106, 107, 108, 109,
  110, 111, 112, 113, 114, 115, 116, 117
]

const LAYOUT_KNOB_DIMENSIONS: [w: number, h: number] = [1, 1]
const LAYOUT_KNOBS = <Array<[x: number, y: number, w: number, h: number]>>[
  [0, 0],    [1, 0],    [2, 0],    [3, 0],    [4.25, 0],    [5.25, 0],    [6.25, 0],    [7.25, 0],
  [0, 1.25], [1, 1.25], [2, 1.25], [3, 1.25], [4.25, 1.25], [5.25, 1.25], [6.25, 1.25], [7.25, 1.25]
].map(knob => [...knob, ...LAYOUT_KNOB_DIMENSIONS])
/* eslint-enable @stylistic/no-multi-spaces */

import type midiremote_api_v1 from 'midiremote_api_v1'
const api: typeof midiremote_api_v1 = require('midiremote_api_v1')

// ----------------------------------------------------------------------------
// 1. DRIVER SETUP - create driver object, midi ports and detection information
// ----------------------------------------------------------------------------

const driver = api.makeDeviceDriver(VENDOR_NAME, DEVICE_NAME, SCRIPT_CREATOR)

// Only creating the input, as the firmware currently does not process any incoming signal
const portInput = driver.mPorts.makeMidiInput()

MIDI_PORT_NAMES_INPUT.forEach(name => {
  driver.makeDetectionUnit().detectSingleInput(portInput).expectInputNameEquals(name)
})

// ----------------------------------------------------------------------------
// 2. SURFACE LAYOUT - create control elements and midi bindings
// ----------------------------------------------------------------------------

const surfaceKnobs = LAYOUT_KNOBS.map(layoutKnob => driver.mSurface.makeKnob(...layoutKnob))
surfaceKnobs.forEach((surfaceKnob, index) => {
  // See "3. HOST MAPPING -> CC 104"
  if (index === 2) {
    surfaceKnob.mSurfaceValue.mMidiBinding
      .setInputPort(portInput)
      .bindToControlChange(MIDI_CHANNEL, MIDI_CC_NUMBERS[index])
  }
  else {
    surfaceKnob.mSurfaceValue.mMidiBinding
      .setInputPort(portInput)
      .bindToControlChange(MIDI_CHANNEL, MIDI_CC_NUMBERS[index])
      .setTypeRelativeBinaryOffset()
  }
})

// ----------------------------------------------------------------------------
// 3. HOST MAPPING - create mapping pages and host bindings
// ----------------------------------------------------------------------------

const mappingPage = driver.mMapping.makePage('Default')

const {
  mTrackSelection: { mMixerChannel: hostSelectedMixerChannel },
  mMouseCursor: hostMouseCursor,
  mFocusedQuickControls: hostFocusedQuickControls
} = mappingPage.mHostAccess

function mappingPageMakeValueBinding (
  surfaceKnobIndex: number,
  hostValue: Parameters<typeof mappingPage['makeValueBinding']>[1]
) {
  return mappingPage.makeValueBinding(surfaceKnobs[surfaceKnobIndex].mSurfaceValue, hostValue)
}

// CC 102: Unassigned
// CC 103: Value Under the Mouse Cursor
mappingPageMakeValueBinding(1, hostMouseCursor.mValueUnderMouse)

// CC 104: Selected Track Insert Editor Navigation
const hostSelectedMixerChannelInsertCursor =
  hostSelectedMixerChannel.mInsertAndStripEffects
    .makeInsertEffectViewer('hostSelectedMixerChannelInsertCursor')
    .excludeEmptySlots()
    .followPluginWindowInFocus()

// Dummy binding for editor opening/closing to take effect
mappingPage.makeValueBinding(
  driver.mSurface.makeKnob(0, 0, 0, 0).mSurfaceValue,
  hostSelectedMixerChannelInsertCursor.mEdit
)
function hostSelectedMixerChannelInsertCursorEditorOpen (
  activeMapping: Parameters<typeof hostSelectedMixerChannelInsertCursor['mEdit']['increment']>[0]
) {
  for (let i = 0; i < 127; i++) hostSelectedMixerChannelInsertCursor.mEdit.increment(activeMapping)
}
function hostSelectedMixerChannelInsertCursorEditorClose (
  activeMapping: Parameters<typeof hostSelectedMixerChannelInsertCursor['mEdit']['decrement']>[0]
) {
  hostSelectedMixerChannelInsertCursor.mEdit.decrement(activeMapping)
}

const hostSelectedMixerChannelInsertEditorNavigation =
  mappingPage.mCustom.makeHostValueVariable('hostSelectedMixerChannelInsertEditorNavigation')
mappingPageMakeValueBinding(2, hostSelectedMixerChannelInsertEditorNavigation)
  .mOnValueChange = (activeDevice, activeMapping, value) => {
    // Ignore the value change if it's a control position reset
    if (value === 0.5) return
    // Reset control position immediately after every touch
    hostSelectedMixerChannelInsertEditorNavigationResetControlPosition(activeDevice)

    hostSelectedMixerChannelInsertCursorEditorClose(activeMapping)
    if (value < 0.5) mappingPageQueueOnIdle('hostSelectedMixerChannelInsertCursor.mAction.mPrev.trigger')
    else if (value > 0.5) mappingPageQueueOnIdle('hostSelectedMixerChannelInsertCursor.mAction.mNext.trigger')
    mappingPageQueueOnNextIdle('hostSelectedMixerChannelInsertCursorEditorOpen')
  }

function hostSelectedMixerChannelInsertEditorNavigationResetControlPosition (
  activeDevice: Parameters<typeof surfaceKnobs[2]['mSurfaceValue']['setProcessValue']>[0]
) {
  surfaceKnobs[2].mSurfaceValue.setProcessValue(activeDevice, 0.5)
}

// CC 105: Selected Track Channel Pre-Gain
mappingPageMakeValueBinding(3, hostSelectedMixerChannel.mPreFilter.mGain)
// CC 106: Selected Track Channel Pre-Filter Low-Cut Filter Frequency
mappingPageMakeValueBinding(4, hostSelectedMixerChannel.mPreFilter.mLowCutFreq)
// CC 107: Selected Track Channel Pre-Filter High-Cut Filter Frequency
mappingPageMakeValueBinding(5, hostSelectedMixerChannel.mPreFilter.mHighCutFreq)
// CC 108: Selected Track Channel Volume
mappingPageMakeValueBinding(6, hostSelectedMixerChannel.mValue.mVolume)
// CC 109: Selected Track Channel Pan
mappingPageMakeValueBinding(7, hostSelectedMixerChannel.mValue.mPan)
// CC 110: Focused Insert Quick Controls QC 1
mappingPageMakeValueBinding(8, hostFocusedQuickControls.getByIndex(0))
// CC 111: Focused Insert Quick Controls QC 2
mappingPageMakeValueBinding(9, hostFocusedQuickControls.getByIndex(1))
// CC 112: Focused Insert Quick Controls QC 3
mappingPageMakeValueBinding(10, hostFocusedQuickControls.getByIndex(2))
// CC 113: Focused Insert Quick Controls QC 4
mappingPageMakeValueBinding(11, hostFocusedQuickControls.getByIndex(3))
// CC 114: Focused Insert Quick Controls QC 5
mappingPageMakeValueBinding(12, hostFocusedQuickControls.getByIndex(4))
// CC 115: Focused Insert Quick Controls QC 6
mappingPageMakeValueBinding(13, hostFocusedQuickControls.getByIndex(5))
// CC 116: Focused Insert Quick Controls QC 7
mappingPageMakeValueBinding(14, hostFocusedQuickControls.getByIndex(6))
// CC 117: Focused Insert Quick Controls QC 8
mappingPageMakeValueBinding(15, hostFocusedQuickControls.getByIndex(7))

// ----------------------------------------------------------------------------
// 4. HOOKS
// ----------------------------------------------------------------------------

mappingPage.mOnActivate = activeDevice =>
  hostSelectedMixerChannelInsertEditorNavigationResetControlPosition(activeDevice)

type QueueTask =
  'hostSelectedMixerChannelInsertCursor.mAction.mPrev.trigger' |
  'hostSelectedMixerChannelInsertCursor.mAction.mNext.trigger' |
  'hostSelectedMixerChannelInsertCursorEditorOpen'

let mappingPageOnIdleQueue: Array<QueueTask> = []
const mappingPageOnNextIdleQueue: Array<QueueTask> = []

function mappingPageQueueOnIdle (...task: Array<QueueTask>) { mappingPageOnIdleQueue.push(...task) }
function mappingPageQueueOnNextIdle (...task: Array<QueueTask>) { mappingPageOnNextIdleQueue.push(...task) }

mappingPage.mOnIdle = (_, activeMapping) => {
  // Run all tasks in "mappingPageOnIdleQueue"
  mappingPageOnIdleQueue.forEach(task => {
    switch (task) {
      case 'hostSelectedMixerChannelInsertCursor.mAction.mPrev.trigger':
        hostSelectedMixerChannelInsertCursor.mAction.mPrev.trigger(activeMapping)
        break
      case 'hostSelectedMixerChannelInsertCursor.mAction.mNext.trigger':
        hostSelectedMixerChannelInsertCursor.mAction.mNext.trigger(activeMapping)
        break
      case 'hostSelectedMixerChannelInsertCursorEditorOpen':
        hostSelectedMixerChannelInsertCursorEditorOpen(activeMapping)
    }
  })

  // Pull tasks from "mappingPageOnNextIdleQueue" to "mappingPageQueueOnIdle"
  mappingPageOnIdleQueue = [...mappingPageOnNextIdleQueue]
  mappingPageOnNextIdleQueue.length = 0
}
