import React, { useEffect, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";

interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  isOpen: boolean;
  onClose: () => void;
}
export const ConfirmationSheet = (props: Props) => {
  const actionSheetRef = useRef<ActionSheetRef>(null);

  useEffect(() => {
    if (props.isOpen) actionSheetRef.current?.show();
    else actionSheetRef.current?.hide();
  }, [props.isOpen]);

  return (
    <ActionSheet ref={actionSheetRef} closable headerAlwaysVisible>
      <View className={"p-4"}>
        <Text className={"text-center text-lg font-bold"}>{props.title}</Text>
        <Text className={"p-6 text-center text-lg font-light text-gray-500"}>
          {props.message}
        </Text>
        <View className={"mb-6 mt-6 flex-row justify-between"}>
          <TouchableOpacity
            className={"w-5/12 rounded-2xl border bg-white p-4"}
            onPress={() => {
              props.onClose();
              actionSheetRef.current?.hide();
            }}
          >
            <Text className={"text-center text-black"}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={"ml-4 w-5/12 rounded-2xl border bg-black p-4"}
            onPress={props.onConfirm}
          >
            <Text className={"text-center text-white"}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ActionSheet>
  );
};
