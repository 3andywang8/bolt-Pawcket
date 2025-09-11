import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AdoptionProvider } from '@/contexts/AdoptionContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { DonationProvider } from '@/contexts/DonationContext';
import { UserProfileProvider } from '@/contexts/UserProfileContext';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    // We'll use system fonts for now since Noto Sans TC requires specific setup
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <UserProfileProvider>
      <AdoptionProvider>
        <FavoritesProvider>
          <DonationProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="loading" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="animal/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="TreatSelectionScreen" options={{ headerShown: false }} />
              <Stack.Screen name="PaymentScreen" options={{ headerShown: false }} />
              <Stack.Screen name="PaymentSuccessScreen" options={{ headerShown: false }} />
              <Stack.Screen name="AdoptionProcessScreen" options={{ headerShown: false }} />
              <Stack.Screen name="AdoptionProgressScreen" options={{ headerShown: false }} />
              <Stack.Screen name="MyDonationsScreen" options={{ headerShown: false }} />
              <Stack.Screen name="ProfileSettingsScreen" options={{ headerShown: false }} />
              <Stack.Screen name="FavoritesScreen" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </DonationProvider>
        </FavoritesProvider>
      </AdoptionProvider>
    </UserProfileProvider>
  );
}