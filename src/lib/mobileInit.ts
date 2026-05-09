import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export async function initializeMobile(): Promise<void> {
  // Check if running on mobile platform
  if (Capacitor.isNativePlatform()) {
    // Configure status bar
    try {
      await StatusBar.setStyle({
        style: 'light',
      });
      await StatusBar.setBackgroundColor({
        color: '#6366F1',
      });
      await StatusBar.show();
    } catch (e) {
      console.log('Status bar not available:', e);
    }

    // Configure splash screen
    try {
      await SplashScreen.hide({
        fadeOutDuration: 500,
      });
    } catch (e) {
      console.log('Splash screen not available:', e);
    }
  }
}

export default initializeMobile;