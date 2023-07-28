import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";

process.env.DIST = path.join(__dirname, "../dist");
process.env.PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

let win: BrowserWindow | null;
// Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

function createWindow() {
  win = new BrowserWindow({
    autoHideMenuBar: true,
    icon: path.join(process.env.PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // allow loading modules via the require () function
      nodeIntegration: true,
      // https://github.com/electron/electron/issues/18037#issuecomment-806320028
      // allow loading modules via the require () function
      contextIsolation: false,
    },
  });

  // maximize window when launched
  win.maximize();

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // win = null;

  // On macOS app doesnt quit until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.whenReady().then(createWindow);

// electron-store
const Store = require("electron-store");

// where our data will be stored
// user_data is out data directory and data.json is our data file
// const dataPath = path.join(app.getPath("userData"), "user_data", "data.json");
const dataPath = path.join(app.getPath("userData"), "user_data");

// Initialize electron-store
// Initialize electron-store with custom path
const store = new Store({ name: "data", cwd: dataPath });

// IPC endpoint to handle saving boards to electron-store
ipcMain.handle("save_boards", (event, boards) => {
  try {
    store.set("boards", boards);
    return true;
  } catch (err) {
    console.error("Error saving boards:", err);
    return false;
  }
});

// IPC endpoint to handle loading boards from electron-store
ipcMain.handle("load_boards", () => {
  return store.get("boards", []);
});
