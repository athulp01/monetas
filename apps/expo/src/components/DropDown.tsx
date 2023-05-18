import React, { type Dispatch, type SetStateAction } from "react";
import { Text } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

interface Props {
  disabled?: boolean;
  loading: boolean;
  items: { label: string; value: string }[];
  value: string;
  placeholder: string;
  zIndex: number;
  zIndexInverse: number;
  setValue: (value: string) => void;
  setItems?: Dispatch<SetStateAction<{ label: string; value: string }[]>>;
  readonly?: boolean;
  readonlyValue?: string;
}

export const DropDown = (props: Props) => {
  const items = Array.from(props.items);
  const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
  if (props.readonly) {
    return (
      <Text className={"text-base"}>
        {props.readonlyValue ??
          props?.items?.find((item) => item.value == props?.value)?.label}
      </Text>
    );
  }
  return (
    <DropDownPicker
      disabled={props.disabled}
      zIndex={props.zIndex}
      zIndexInverse={props.zIndexInverse}
      placeholder={props.placeholder}
      loading={props.loading}
      open={isDatePickerVisible}
      items={items.length > 0 ? items : [{ label: "", value: "" }]}
      value={props.value}
      setItems={props.setItems}
      setOpen={setDatePickerVisibility}
      setValue={(value) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        props.setValue(value(props.value));
      }}
    />
  );
};
