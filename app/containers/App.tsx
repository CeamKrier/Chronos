import React, { ReactNode } from 'react';

const customTitlebar = require('custom-electron-titlebar');

type Props = {
  children: ReactNode;
};

export default function App(props: Props) {
  const { children } = props;
  // eslint-disable-next-line no-new
  new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#3C3C3C'),
    icon: '../resources/icon.png',
  }).updateTitle('Chronos');
  return <>{children}</>;
}
