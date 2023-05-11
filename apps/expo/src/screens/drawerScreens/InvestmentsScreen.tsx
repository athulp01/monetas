import React from "react";
import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { api } from "~/utils/api";
import InvestmentItem from "~/components/InvestmentItem";

export const InvestmentsScreen = () => {
  const investmentsQuery = api.investment.listInvestments.useQuery();

  return (
    <FlashList
      data={investmentsQuery.data?.investments ?? []}
      estimatedItemSize={20}
      ItemSeparatorComponent={() => <View className="h-0" />}
      renderItem={(p) => <InvestmentItem investment={p.item} />}
    />
  );
};
