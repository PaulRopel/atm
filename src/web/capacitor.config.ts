import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.atm.app',
  appName: 'atm',
  webDir: 'build-static',
  android: {
    path: '../android'
  }
};

export default config;
