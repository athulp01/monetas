import { createContext } from "react";

export const TopLoadingBarStateContext = createContext({
  show: () => void 0,
  hide: () => void 0,
});
