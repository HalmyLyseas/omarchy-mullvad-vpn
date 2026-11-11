pragma Singleton
import QtQuick

// Mock Pipewire singleton for host Commons/UntypedInput; no audio source in
// the physical probe.
QtObject {
  property var defaultAudioSource: null
}
