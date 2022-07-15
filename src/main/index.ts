import { app, BrowserWindow } from 'electron';
import path from 'path';
import { format as formatUrl } from 'url';
import { colors } from "../common/colors";
import {isDevelopment, isMac} from "../common/constants";

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null = null;

function createMainWindow() {
  const window = new BrowserWindow({
    show: false,
    width: 1100,
    height: 728,
    backgroundColor: colors.purpleDarker,
    webPreferences: {
      nodeIntegration: true
    },
    autoHideMenuBar: true,
  });

  if (isDevelopment) {
    window.webContents.openDevTools();
  }

  if (isDevelopment) {
    void window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  }
  else {
    void window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }),
    );
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    });
  });

  window.webContents.once("dom-ready", () => {

    // Avoid paint flash in Windows by showing when ready.
    if (!isMac) {
      window.show();
      window.focus();
    }
  });

  // macOS doesn't seem to suffer from the paint flash, and since a user can close and reopen the
  // window without killing the process, this should be a bit faster.
  if (isMac) {
    window.show();
    window.focus();
  }

  return window;
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})
