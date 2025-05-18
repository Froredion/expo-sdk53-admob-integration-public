import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Platform, StatusBar } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import React, { useEffect } from 'react';
import { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';
import mobileAds from 'react-native-google-mobile-ads/src';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [adsLoaded, setAdsLoaded] = React.useState(false);

  // Add status bar handling for iOS
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // This ensures the status bar can be controlled by child view controllers
      // which is necessary for GMA to hide the status bar during full-screen ads
      const originalStatusBarStyle = StatusBar.currentHeight;
      return () => {
        // Restore original status bar style when component unmounts
        if (originalStatusBarStyle !== undefined) {
          StatusBar.setBarStyle('default');
        }
      };
    }
  }, []);

  useEffect(() => {
    const prepare = async () => {
      console.log('Starting ad initialization...');
      // TODO: if the ATT doesn't show up, add a small delay
      const trackingResult = await requestTrackingPermissionsAsync();
      console.log('Tracking permission result:', trackingResult);
      try {
        const consentInfo = await AdsConsent.requestInfoUpdate();
        console.log('Consent info:', consentInfo);
        if (consentInfo.isConsentFormAvailable && consentInfo.status === AdsConsentStatus.REQUIRED) {
          console.log('Showing consent form...');
          try {
            await AdsConsent.showForm();
          } catch (formError) {
            console.log('Error showing consent form:', formError);
            // Continue even if form fails to show
          }
        }
        console.log('Initializing mobile ads...');
        await mobileAds().initialize();
        console.log('Mobile ads initialized successfully');
        setAdsLoaded(true);
      } catch (e) {
        console.log('Error during ad initialization:', e);
        // Still try to initialize ads even if consent fails
        try {
          await mobileAds().initialize();
          console.log('Mobile ads initialized successfully despite consent error');
          setAdsLoaded(true);
        } catch (initError) {
          console.log('Failed to initialize ads:', initError);
        }
      }
    }
    void prepare();
  }, []);

  if (!adsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Slot />
      <ExpoStatusBar style="auto" />
    </ThemeProvider>
  );
}
