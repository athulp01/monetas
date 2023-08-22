import React from "react";
import { Text, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface Props {
  value: Date;
  onChange: (value: Date) => void;
  disabled: boolean;
}

export const DateTime = (props: Props) => {
  const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
  if (props.disabled)
    return (
      <Text
        className={"text-base"}
      >{`${props?.value?.toLocaleDateString()}`}</Text>
    );
  return (
    <>
      <TouchableOpacity
        onPress={() => setDatePickerVisibility(true)}
        className={"rounded-md border p-3.5"}
      >
        <Text>{`📆  ${props?.value?.toLocaleDateString()}`}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        style={{ marginTop: 20 }}
        date={props.value}
        mode="date"
        onConfirm={(date) => {
          props.onChange(date);
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </>
  );
};
