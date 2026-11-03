const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Daten-Ordner neben der .exe oder .AppImage anlegen (wichtig für USB-Stick!)
if (app.isPackaged) {
  let baseDir = path.dirname(process.execPath);
  
  // Bei Linux-AppImages ist der execPath in einem temporären Ordner.
  // Deshalb nutzen wir die Umgebungsvariable APPIMAGE, um den echten Speicherort zu finden.
  if (process.env.APPIMAGE) {
    baseDir = path.dirname(process.env.APPIMAGE);
  }

  const portableDataDir = path.join(baseDir, 'userdata');
  if (!fs.existsSync(portableDataDir)) fs.mkdirSync(portableDataDir, { recursive: true });
  app.setPath('userData', portableDataDir);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'Nebenkostenabrechnung',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  
  // Lädt die gebaute index.html
  win.loadFile(path.join(__dirname, '../dist/index.html'));
  Menu.setApplicationMenu(null); // Oben die Menüleiste ausblenden
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
