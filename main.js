const { app, BrowserWindow } = require('electron');

function createWindow() {
  // Makes the browser window
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Renders the index.html of the app
  win.loadFile('index.html');

  // Opens the dev tools????
  // win.webContents.openDevTools();
}

// This will be called after Electron finishes initiation and can actually create
// browser windows...
// Some APIs can only be used after this event occurs
app.whenReady().then(createWindow);

// Exit app when all windows are closed, unless on mac, because
// mac keeps the apps open (mac users omegalul)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On mac, re create a window in the app when the dock icon is clicked
  // and there are no other windows open
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
