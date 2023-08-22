import React from "react";
import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { api } from "~/utils/api";
import PayeeItem from "~/components/PayeeItem";

export const PayeesScreen = () => {
  const payeeQuery = api.payee.listPayees.useQuery();

  return (
    <FlashList
      data={payeeQuery.data?.payees ?? []}
      estimatedItemSize={20}
      ItemSeparatorComponent={() => <View className="h-0" />}
      renderItem={(p) => <PayeeItem payee={p.item} />}
    />
  );
};
