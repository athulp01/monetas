import React from "react";
import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { api } from "~/utils/api";
import { type AccountStackScreenProps } from "~/utils/types";
import AccountItem, { type Account } from "~/components/AccountItem";

export const AccountsScreen = ({
  navigation,
}: AccountStackScreenProps<"Accounts">) => {
  const accountsQuery = api.account.listAccounts.useQuery();

  const handleAccountPress = (account: Account) => {
    navigation.push("AccountDetails", { account });
  };

  return (
    <FlashList
      data={accountsQuery.data?.accounts ?? []}
      estimatedItemSize={20}
      ItemSeparatorComponent={() => <View className="h-0" />}
      renderItem={(p) => (
        <AccountItem handleItemPress={handleAccountPress} account={p.item} />
      )}
    />
  );
};
