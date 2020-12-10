/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import dotenv from 'dotenv';
import {
  app,
  BrowserWindow,
  Event,
  ipcMain,
  Menu,
  powerMonitor,
  Tray,
  Notification,
} from 'electron';
import activeWin from 'active-win';
import AutoLaunch from 'auto-launch';
import * as Sentry from '@sentry/electron';
import path from 'path';
// import { autoUpdater } from 'electron-updater';
// import log from 'electron-log';
// import MenuBuilder from './menu';

dotenv.config();
const desktopIdle = require('desktop-idle');

Sentry.init({
  dsn: process.env.SENTRY_IO_DNS,
});

const launchController = new AutoLaunch({
  name: 'Chronos',
  path: app.getPath('exe'),
});

// app.allowRendererProcessReuse = true;

// export default class AppUpdater {
//   constructor() {
//     log.transports.file.level = 'info';
//     autoUpdater.logger = log;
//     autoUpdater.checkForUpdatesAndNotify();
//   }
// }

let mainWindow: BrowserWindow | null = null;
const store: { observerID: NodeJS.Timeout | null } = { observerID: null };
const gotTheLock = app.requestSingleInstanceLock();

const clearObserverTicker = () => {
  clearInterval(store.observerID as NodeJS.Timeout);
  store.observerID = null;
};

const initiateObserverTicker = () => {
  if (store.observerID) {
    console.log('Observer already initiated');
    return;
  }
  const intervalID = setInterval(() => {
    activeWin()
      .then((result) =>
        mainWindow?.webContents.send('activeProcess', {
          ...result,
          idleTime: desktopIdle.getIdleTime(),
        })
      )
      .catch(() => {
        console.log('Could not retrieve current window data');
      });
  }, 1000);
  store.observerID = intervalID;
};

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map((name) => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  Menu.setApplicationMenu(null);

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 500,
    maxWidth: 800,
    minWidth: 500,
    height: 650,
    minHeight: 650,
    maxHeight: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow?.hide();
  });

  ipcMain.on('startObserving', initiateObserverTicker);

  ipcMain.on('stopObserving', clearObserverTicker);

  ipcMain.on('setAutoLaunchPreference', (_, shouldAutoLaunch: boolean) => {
    launchController
      .isEnabled()
      .then((isEnabled) => {
        // eslint-disable-next-line promise/always-return
        if (isEnabled && !shouldAutoLaunch) {
          launchController.disable();
        } else if (!isEnabled && shouldAutoLaunch) {
          launchController.enable();
        }
      })
      .catch((err) => {
        console.log('Could not launch controller state information', err);
      });
  });

  powerMonitor.on('lock-screen', clearObserverTicker);

  powerMonitor.on('unlock-screen', initiateObserverTicker);

  powerMonitor.on('suspend', clearObserverTicker);

  powerMonitor.on('resume', initiateObserverTicker);

  ipcMain.on('setAutoLaunchPreference', (_, shouldAutoLaunch: boolean) => {
    launchController
      .isEnabled()
      .then((isEnabled) => {
        // eslint-disable-next-line promise/always-return
        if (isEnabled && !shouldAutoLaunch) {
          launchController.disable();
        } else if (!isEnabled && shouldAutoLaunch) {
          launchController.enable();
        }
      })
      .catch((err) => {
        console.log('Could not launch controller state information', err);
      });
  });

  ipcMain.on('generateNotification', (_, title, body) => {
    new Notification({
      title,
      body,
      icon: getAssetPath('icon.png'),
    }).show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  let isQuiting = false;

  const tray = new Tray(getAssetPath('icon.png'));

  tray.on('double-click', () => {
    mainWindow?.show();
  });
  tray.setToolTip('Chronos');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Show',
        click: () => {
          mainWindow?.show();
        },
      },
      {
        label: 'Quit',
        click: () => {
          isQuiting = true;
          app.quit();
        },
      },
    ])
  );

  mainWindow.on('close', (e: Event) => {
    if (!isQuiting) {
      e.preventDefault();

      mainWindow?.hide();
    }
    return false;
  });

  mainWindow.on('restore', () => {
    mainWindow?.show();
  });

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

/**
 * Add event listeners...
 */

app.setLoginItemSettings({
  openAtLogin: true,
  path: app.getPath('exe'),
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}

if (process.env.E2E_BUILD === 'true') {
  // eslint-disable-next-line promise/catch-or-return
  app.whenReady().then(createWindow);
} else {
  app.on('ready', createWindow);
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
