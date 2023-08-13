import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { localStorageDarkModeKey, localStorageStyleKey } from "~/config/config";
import { type StyleKey } from "~/interfaces";
import * as styles from "../config/styles";

interface StyleState {
  asideStyle: string;
  asideScrollbarsStyle: string;
  asideBrandStyle: string;
  asideMenuItemStyle: string;
  asideMenuItemActiveStyle: string;
  asideMenuDropdownStyle: string;
  navBarItemLabelStyle: string;
  navBarItemLabelHoverStyle: string;
  navBarItemLabelActiveColorStyle: string;
  overlayStyle: string;
  darkMode: boolean;
}

const initialState: StyleState = {
  asideStyle: styles.white.aside,
  asideScrollbarsStyle: styles.white.asideScrollbars,
  asideBrandStyle: styles.white.asideBrand,
  asideMenuItemStyle: styles.white.asideMenuItem,
  asideMenuItemActiveStyle: styles.white.asideMenuItemActive,
  asideMenuDropdownStyle: styles.white.asideMenuDropdown,
  navBarItemLabelStyle: styles.white.navBarItemLabel,
  navBarItemLabelHoverStyle: styles.white.navBarItemLabelHover,
  navBarItemLabelActiveColorStyle: styles.white.navBarItemLabelActiveColor,
  overlayStyle: styles.white.overlay,
  darkMode: false,
};

export const styleSlice = createSlice({
  name: "style",
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean | null>) => {
      state.darkMode =
        action.payload !== null ? action.payload : !state.darkMode;

      if (typeof localStorage !== "undefined") {
        localStorage.setItem(
          localStorageDarkModeKey,
          state.darkMode ? "1" : "0",
        );
      }

      if (typeof document !== "undefined") {
        document.body.classList[state.darkMode ? "add" : "remove"](
          "dark-scrollbars",
        );

        document.documentElement.classList[state.darkMode ? "add" : "remove"](
          "dark-scrollbars-compat",
        );
      }
    },

    setStyle: (state, action: PayloadAction<StyleKey>) => {
      if (!styles[action.payload]) {
        return;
      }

      if (typeof localStorage !== "undefined") {
        localStorage.setItem(localStorageStyleKey, action.payload);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const style = styles[action.payload];

      for (const key in style) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        state[`${key}Style`] = style[key];
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { setDarkMode, setStyle } = styleSlice.actions;

export default styleSlice.reducer;
