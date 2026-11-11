// A qs.Ui.TextField whose paste routes use a bounded, cancellable clipboard
// read instead of the native synchronous transfer.
import QtQuick
import QtQuick.Controls
import qs.Ui as Ui
import "Model.js" as Model

Ui.TextField {
  id: root

  property int pasteLimit: 100
  property bool digitsOnly: false
  property var keyHandler: null
  readonly property int _limit: root.maximumLength > 0 ? Math.min(root.pasteLimit, root.maximumLength) : root.pasteLimit

  Keys.priority: Keys.BeforeItem
  Keys.onPressed: function(event) {
    var pasteKey = (event.key === Qt.Key_V && (event.modifiers & Qt.ControlModifier) !== 0)
      || (event.key === Qt.Key_Insert && (event.modifiers & Qt.ShiftModifier) !== 0)
      || event.key === Qt.Key_Paste
    if (pasteKey) {
      pasteJob.paste(false)
      event.accepted = true
      return
    }
    if (!event.accepted && root.keyHandler) root.keyHandler(event)
  }

  // Primary-selection paste is another native whole-clipboard route.
  MouseArea {
    anchors.fill: parent
    acceptedButtons: Qt.MiddleButton
    onPressed: function(mouse) {
      mouse.accepted = true
      root.forceActiveFocus()
      var at = root.positionAt(mouse.x, mouse.y)
      if (at >= 0) root.cursorPosition = at
      pasteJob.paste(true)
    }
  }

  // Replace the host menu so its Paste action cannot reach native retrieval.
  ContextMenu.menu: Menu {
    MenuItem {
      text: "Cut"
      enabled: root.selectedText.length > 0
      onTriggered: root.cut()
    }
    MenuItem {
      text: "Copy"
      enabled: root.selectedText.length > 0
      onTriggered: root.copy()
    }
    MenuItem {
      text: "Paste"
      onTriggered: pasteJob.paste(false)
    }
    MenuItem {
      text: "Select All"
      onTriggered: root.selectAll()
    }
  }

  onVisibleChanged: if (!visible) pasteJob.cancel()

  PasteJob {
    id: pasteJob
    onFinished: function(success, text, error) {
      if (!success) return
      var pasted = String(text || "")
      if (root.digitsOnly) pasted = pasted.replace(/[^0-9 ]/g, "")
      var result = Model.pasteQuery(root.text, root.selectionStart, root.selectionEnd,
        root.cursorPosition, pasted, root._limit)
      if (!result || result.text === String(root.text || "")) return
      root.text = result.text
      root.cursorPosition = result.cursor
      root.forceActiveFocus()
    }
  }
}
