import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider } from "@clerk/clerk-expo";

import { tokenCache } from "~/utils/cache";
import useCachedResources from "./src/hooks/useCachedResources";
import Navigation from "./src/navigation";

// Your publishable Key goes here
const publishableKey =
  "pk_test_d29ya2FibGUtYmF0LTg5LmNsZXJrLmFjY291bnRzLmRldiQ";

export default function App() {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <SafeAreaProvider>
          <Navigation />
          <StatusBar style={"dark"} networkActivityIndicatorVisible />
        </SafeAreaProvider>
      </ClerkProvider>
    );
  }
}
