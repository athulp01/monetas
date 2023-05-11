import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useCachedResources from "./src/hooks/useCachedResources";
import Navigation from "./src/navigation";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "~/utils/cache";

// Your publishable Key goes here
const publishableKey = "pk_test_d29ya2FibGUtYmF0LTg5LmNsZXJrLmFjY291bnRzLmRldiQ";

export default function App() {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}
      >
        <SafeAreaProvider>
          <Navigation />
          <StatusBar style={"light"} translucent networkActivityIndicatorVisible />
        </SafeAreaProvider>
      </ClerkProvider>
    );
  }
}
