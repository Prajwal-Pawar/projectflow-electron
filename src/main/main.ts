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

// IPC endpoint to handle saving tasks to electron-store
// ipcMain.handle("save_tasks", (event, columnId, tasks) => {
//   try {
//     store.set(`tasks-${columnId}`, tasks);
//     return true;
//   } catch (err) {
//     console.error("Error saving tasks:", err);
//     return false;
//   }
// });

ipcMain.handle("save_tasks", (event, columnId, tasks) => {
  try {
    // Get the current boards from the store
    const storedBoards = store.get("boards") || [];

    // Find the board that contains the column with the matching columnId
    const boardIndex = storedBoards.findIndex((board: any) =>
      board.columns.some((column: any) => column.id === columnId)
    );

    if (boardIndex !== -1) {
      const currentBoard = storedBoards[boardIndex];
      // Find the index of the column with the matching columnId within the board
      const column = currentBoard.columns.find(
        (column: any) => column.id === columnId
      );

      if (column) {
        // If the column exists, update its tasks
        column.tasks = tasks;

        // Save the updated boards back to the store
        store.set("boards", storedBoards);
      }
    }

    // Return a response to the renderer process to indicate success
    return true;
  } catch (err) {
    console.error("Error saving tasks:", err);
    return false;
  }
});

// IPC endpoint to handle loading tasks from electron-store for a specific column
// ipcMain.handle("load_tasks", (event, columnId) => {
//   return store.get(`tasks-${columnId}`, []);
// });

// IPC endpoint to handle loading a specific board from the store
// ipcMain.handle("load_board", (event, boardId) => {
//   try {
//     // const storedBoard = store.get(`boards.${boardId}`);
//     const storedBoard = store.get(boardId);
//     console.log("from main board id", boardId);
//     console.log("from main storeboard", storedBoard);
//     return storedBoard;
//   } catch (err) {
//     console.error("Error loading board:", err);
//     return null;
//   }
// });

ipcMain.handle("load_board", (event, boardId) => {
  try {
    // Get the current boards from store/data
    const data = store.get("boards") || [];

    // Find the board with the given boardId
    const storedBoard = data.find((board: any) => board.id === boardId);
    console.log("from main board id", boardId);
    console.log("from main storedboard", storedBoard);

    return storedBoard || null;
  } catch (err) {
    console.error("Error loading board:", err);
    return null;
  }
});

// IPC endpoint to handle saving a specific board from the store
ipcMain.handle("save_board", (event, updatedBoard) => {
  try {
    // Get the current boards from store/data
    const data = store.get("boards") || [];

    // Find the index of the board with the given updatedBoard.id
    const boardIndex = data.findIndex(
      (board: any) => board.id === updatedBoard.id
    );

    // If the board with the given ID exists, update it; otherwise, add the new board to the data array
    if (boardIndex !== -1) {
      data[boardIndex] = updatedBoard;
    } else {
      data.push(updatedBoard);
    }

    // Save the updated board in boards/data
    store.set("boards", data);

    // Return a response to the renderer process to indicate success
    return true;
  } catch (err) {
    console.error("Error saving board:", err);
    return false;
  }
});

// IPC endpoint to handle loading tasks from a specific column from the store
ipcMain.handle("load_tasks", (event, columnId) => {
  try {
    // Get the current boards from the store
    const storedBoards = store.get("boards") || [];

    // Find the board that contains the column with the matching columnId
    const boardIndex = storedBoards.findIndex((board: any) =>
      board.columns.some((column: any) => column.id === columnId)
    );

    if (boardIndex !== -1) {
      const currentBoard = storedBoards[boardIndex];
      // Find the index of the column with the matching columnId within the board
      const column = currentBoard.columns.find(
        (column: any) => column.id === columnId
      );

      if (column) {
        // Return the tasks array for the column
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
