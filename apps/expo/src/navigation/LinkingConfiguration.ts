/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import * as Linking from "expo-linking";
import { type LinkingOptions } from "@react-navigation/native";

import { type RootStackParamList } from "~/utils/types";

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.makeUrl("/")],
  config: {
    screens: {
      Root: {
        screens: {
          SignUp: {
            screens: {
              SignUpScreen: "SignUp",
            },
          },
          SignIn: {
            screens: {
              SignInScreen: "SignIn",
            },
          },
        },
      },
    },
  },
};

export default linking;
