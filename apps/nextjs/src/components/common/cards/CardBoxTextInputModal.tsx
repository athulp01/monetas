import { mdiClose } from "@mdi/js";
import { useForm } from "react-hook-form";

import { ControlledInput } from "~/components/forms/ControlledInput";
import type { ColorButtonKey } from "~/interfaces";
import BaseButton from "../buttons/BaseButton";
import BaseButtons from "../buttons/BaseButtons";
import OverlayLayer from "../sections/OverlayLayer";
import CardBox from "./CardBox";
import CardBoxComponentTitle from "./CardBoxComponentTitle";

type DialogProps = {
  title: string;
  warning?: string;
  buttonColor: ColorButtonKey;
  buttonLabel: string;
  isActive: boolean;
  message?: string;
  placeholder?: string;
  onConfirm: (input: string) => void;
  onCancel?: () => void;
};

const CardBoxTextInputModal = ({
  title,
  buttonColor,
  buttonLabel,
  isActive,
  message,
  onConfirm,
  onCancel,
}: DialogProps) => {
  const inputForm = useForm<{ input: string }>();

  if (!isActive) {
    return null;
  }

  const onFormSubmit = (data: { input: string }) => {
    onConfirm(data.input);
  };
  const footer = (
    <BaseButtons>
      <BaseButton
        label={buttonLabel}
        color={buttonColor}
        onClick={inputForm.handleSubmit(onFormSubmit)}
      />
      {!!onCancel && (
        <BaseButton
          label="Cancel"
          color={buttonColor}
          outline
          onClick={onCancel}
        />
      )}
    </BaseButtons>
  );

  return (
    <OverlayLayer
      onClick={onCancel}
      className={onCancel ? "cursor-pointer" : ""}
    >
      <CardBox
        className={`z-50 max-h-modal w-11/12 shadow-lg transition-transform md:w-3/5 lg:w-2/5 xl:w-4/12`}
        isModal
        footer={footer}
      >
        <CardBoxComponentTitle title={title}>
          {!!onCancel && (
            <BaseButton
              icon={mdiClose}
              color="whiteDark"
              onClick={onCancel}
              small
              roundedFull
            />
          )}
        </CardBoxComponentTitle>

        <div className="mt-3 space-y-3">
          <p>{message}</p>
          <ControlledInput
            inputProps={{ required: true, type: "password" }}
            control={inputForm.control}
            name={"input"}
            form={"inputForm"}
          ></ControlledInput>
        </div>
      </CardBox>
    </OverlayLayer>
  );
};

export default CardBoxTextInputModal;
