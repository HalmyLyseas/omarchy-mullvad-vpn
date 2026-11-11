import QtQuick

// Mock split parser used by host Commons components reached through the 4.5
// BorderOverlay -> AudioNodes chain. The physical probe never needs its data.
QtObject {
  property string splitMarker: "\n"
  signal read(string data)
}
