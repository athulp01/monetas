import { createContext } from "react";

export const TopLoadingBarStateContext = createContext({
  show: () => {},
  hide: () => {},
});
