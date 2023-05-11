import React from "react";
import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { api } from "~/utils/api";
import AccountItem from "~/components/AccountItem";

export const AccountsScreen = () => {
  const accountsQuery = api.account.listAccounts.useQuery();

  return (
    <FlashList
      data={accountsQuery.data?.accounts ?? []}
      estimatedItemSize={20}
      ItemSeparatorComponent={() => <View className="h-0" />}
      renderItem={(p) => <AccountItem account={p.item} />}
    />
  );
};
