import { useEffect, useState } from "react";

const checkIfElectron = () => {
  if (
    typeof window !== "undefined" &&
    typeof window.process === "object" &&
    window.process["type"] === "renderer"
  ) {
    return true;
  }

  // Main process
  if (
    typeof process !== "undefined" &&
    typeof process.versions === "object" &&
    !!process.versions.electron
  ) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to false
  return (
    typeof navigator === "object" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.indexOf("Electron") >= 0
  );
};
export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setIsElectron(checkIfElectron());
  }, [setIsElectron]);
  return isElectron;
};
