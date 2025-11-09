// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TripsProvider } from "@/contexts/TripsContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create-trip" options={{ title: "Create New Trip" }} />
      <Stack.Screen name="trip/[id]" options={{ title: "Trip Details" }} />
      <Stack.Screen name="trip/[id]/add-expense" options={{ title: "Add Expense", presentation: "modal" }} />
      <Stack.Screen name="trip/[id]/summary" options={{ title: "Split Summary" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TripsProvider>
        <GestureHandlerRootView>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </TripsProvider>
    </QueryClientProvider>
  );
}
