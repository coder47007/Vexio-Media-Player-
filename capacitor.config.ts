import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vexio.mediaplayer',
  appName: 'Vexio Media player',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#f8d9ba",
      showSpinner: false,
    },
    MediaSession: {
      foregroundService: "always"
    }
  },
};

export default config;
