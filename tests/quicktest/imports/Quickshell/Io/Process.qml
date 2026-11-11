import QtQuick
QtObject {
  property var command: []
  property bool running: false
  property var environment: ({})
  property string workingDirectory: ""
  property int processId: 0
  property bool stdinEnabled: false
  property var stdout: null
  property var stderr: null
  property var stdin: null
  signal started()
  signal exited(int exitCode, int exitStatus)
  function signal(signalNumber) {}
  function write(data) {}
}
