import React from "react";
import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { api } from "~/utils/api";
import { type InvestmentsStackScreenProps } from "~/utils/types";
import InvestmentItem, { type Investment } from "~/components/InvestmentItem";

export const InvestmentsScreen = ({
  navigation,
}: InvestmentsStackScreenProps<"Investments">) => {
  const investmentsQuery = api.investment.listInvestments.useQuery();

  const handleInvestmentPress = (investment: Investment) => {
    navigation.push("InvestmentDetails", { investment });
  };

  return (
    <FlashList
      data={investmentsQuery.data?.investments ?? []}
      estimatedItemSize={20}
      ItemSeparatorComponent={() => <View className="h-0" />}
      renderItem={(p) => (
        <InvestmentItem
          handleItemPress={handleInvestmentPress}
          investment={p.item}
        />
      )}
    />
  );
};
