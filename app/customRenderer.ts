const customTitlebar = require('custom-electron-titlebar');

// eslint-disable-next-line no-new
new customTitlebar.Titlebar({
  backgroundColor: customTitlebar.Color.fromHex('#3C3C3C'),
  icon: '../resources/icon.ico',
}).updateTitle('Chronos');
