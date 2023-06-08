// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')
const { spawn } = require('child_process');
const { exec } = require('child_process');
const OktaAuth = require("@okta/okta-auth-js").OktaAuth;


// // Disable Task Manager
// exec('REG add HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System /v DisableTaskMgr /t REG_DWORD /d 1 /f');

// // Disable CMD
// exec('REG add HKCU\\Software\\Policies\\Microsoft\\Windows\\System /v DisableCMD /t REG_DWORD /d 1 /f');


const { ipcMain } = require("electron");


var config = {
  // Required config
  issuer: "https://dev-07949561.okta.com/oauth2/default",
  clientId: "0oa9oai62nDrdL3bC5d7",
};

var authClient = new OktaAuth(config);


ipcMain.on("user:login", (event, data) => {
  authClient
    .signInWithCredentials(data)
    .then(function (res) {
      console.log(res);

      if (res.data.status != "SUCCESS") {
        event.reply("login-failed", err.errorSummary);
        return;
      }

      user = res.user;
      openHome();
    })
    .catch(function (err) {
      console.log(err);
      event.reply("login-failed", err.errorSummary);
    });
});

ipcMain.handle("user:get", (event) => {
  return user;
});

ipcMain.on("user:logout", (event) => {
  user = null;
  openIndex();
});

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  // mainWindow.on('closed', () => {
  //   // Re-enable Task Manager
  //   exec('REG add HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System /v DisableTaskMgr /t REG_DWORD /d 0 /f');

  //   // Re-enable CMD
  //   exec('REG add HKCU\\Software\\Policies\\Microsoft\\Windows\\System /v DisableCMD /t REG_DWORD /d 0 /f');

  //   mainWindow = null;
  //});
}


function openIndex() {
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

function openHome() {
  mainWindow.loadFile("home.html");
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  // Add your app to the user's startup programs
  app.setLoginItemSettings({
    openAtLogin: true,
    // openAsHidden: true
  });

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
