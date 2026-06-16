import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { debugData } from './utils/debugData';
import { isEnvBrowser } from './utils/misc';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { DoorColumn } from './store/doors';
import { StoreState } from './store';

debugData<DoorColumn[]>([
  {
    action: 'updateDoorData',
    data: [
      {
        name: 'Door name',
        passcode: 'Supersecret123',
        autolock: 300,
        id: 0,
        zone: 'Mission Row',
        characters: ['charid1', 'charid2'],
        groups: {
          ['police']: 0,
          ['ambulance']: 1,
        },
        items: [{ name: 'mrpd_key', metadata: 'lspd_key', remove: true }],
        lockpickDifficulty: [],
        lockSound: null,
        unlockSound: null,
        maxDistance: 15.2,
        state: true,
        doors: true,
        auto: true,
        lockpick: true,
        hideUi: true,
        doorRate: null,
        holdOpen: true,
      },
    ],
  },
]);

debugData(
  [
    {
      action: 'setVisible',
      data: undefined,
    },
  ],
  2000
);

debugData<string[]>([
  {
    action: 'setSoundFiles',
    data: ['button-remote', 'door-bolt-4', 'metal-locker', 'metallic-creak'],
  },
]);

if (isEnvBrowser()) {
  const root = document.getElementById('root');
  root!.style.backgroundImage = 'url("https://i.imgur.com/3pzRj9n.png")';
  root!.style.backgroundSize = 'cover';
  root!.style.backgroundRepeat = 'no-repeat';
  root!.style.backgroundPosition = 'center';
}

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableColorScheme={false}>
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
);
