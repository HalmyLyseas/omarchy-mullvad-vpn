pragma Singleton
import QtQuick

// Mock Hyprland singleton for host Commons/Style; the physical probe only
// needs the raw-event target to exist.
QtObject {
  signal rawEvent(var event)
}
