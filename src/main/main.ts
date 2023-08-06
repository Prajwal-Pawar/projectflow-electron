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

// IpcMain for communicating Renderer process from Main process

// IPC endpoint to handle saving boards to electron-store
ipcMain.handle("save_boards", (event, boards) => {
  try {
    // saving all boards in array named board
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

// IPC endpoint to handle saving a specific board to the store
/* if we add column to specific board, we need to save that column into that 
specific board */
ipcMain.handle("save_board", (event, updatedBoard) => {
  try {
    // Get all boards from store/data
    const boards = store.get("boards") || [];

    // Find the index of the board with the given updatedBoard.id
    // Find current/active boards index -> (current board has updates)
    const boardIndex = boards.findIndex(
      (board: any) => board.id === updatedBoard.id
    );

    // If the board with the given ID exists, update it; otherwise, add the new board to the boards array
    if (boardIndex !== -1) {
      boards[boardIndex] = updatedBoard;
    } else {
      boards.push(updatedBoard);
    }

    // Save the updated board in store/data
    store.set("boards", boards);

    // Return a response to the renderer process to indicate success
    return true;
  } catch (err) {
    console.error("Error saving board:", err);
    return false;
  }
});

// IPC endpoint to handle loading a specific board from the store
ipcMain.handle("load_board", (event, boardId) => {
  try {
    // Get all boards from store/data
    const boards = store.get("boards") || [];

    // Find the board with the given boardId
    // Find current/active board to load specific columns according to that board
    const storedBoard = boards.find((board: any) => board.id === boardId);

    return storedBoard || null;
  } catch (err) {
    console.error("Error loading board:", err);
    return null;
  }
});

// IPC endpoint to handle saving tasks to a specific column to a specific board to the store
ipcMain.handle("save_tasks", (event, columnId, tasks) => {
  try {
    // Get all boards from store/data
    const boards = store.get("boards") || [];

    // Find the board that contains the column with the matching columnId
    const boardIndex = boards.findIndex((board: any) =>
      board.columns.some((column: any) => column.id === columnId)
    );

    // If the board with the given ID exists
    if (boardIndex !== -1) {
      const currentBoard = boards[boardIndex];
      // Find the column with the matching columnId within the current/active board
      const column = currentBoard.columns.find(
        (column: any) => column.id === columnId
      );

      if (column) {
        // If the column exists, update its tasks
        column.tasks = tasks;

        // Save the updated boards back to the store
        store.set("boards", boards);
      }
    }

    // Return a response to the renderer process to indicate success
    return true;
  } catch (err) {
    console.error("Error saving tasks:", err);
    return false;
  }
});

// IPC endpoint to handle loading tasks from a specific column from a specific board from the store
ipcMain.handle("load_tasks", (event, columnId) => {
  try {
    // Get all boards from store/data
    const boards = store.get("boards") || [];

    // Find the board that contains the column with the matching columnId
    const boardIndex = boards.findIndex((board: any) =>
      board.columns.some((column: any) => column.id === columnId)
    );

    // If the board with the given ID exists
    if (boardIndex !== -1) {
      const currentBoard = boards[boardIndex];
      // Find the column with the matching columnId within the current/active board
      const column = currentBoard.columns.find(
        (column: any) => column.id === columnId
      );

      if (column) {
        // Return the tasks array from that specific column
        return column.tasks || [];
      }
    }

    // If the column or data is not found, return an empty array
    return [];
  } catch (err) {
    console.error("Error loading tasks:", err);
    return [];
  }
});
