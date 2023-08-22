import { createContext } from "react";

export const TopLoadingBarStateContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  show: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  hide: () => {},
});
