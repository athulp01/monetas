import React, { useState, type ReactNode } from "react";
import { mdiClose } from "@mdi/js";

import { colorsBgLight, colorsOutline } from "~/config/colors";
import { type ColorKey } from "~/interfaces";
import BaseButton from "../buttons/BaseButton";
import BaseIcon from "../icon/BaseIcon";

type Props = {
  color: ColorKey;
  icon?: string;
  outline?: boolean;
  children: ReactNode;
  button?: ReactNode;
  className?: string;
};

const NotificationBar = ({
  outline = false,
  children,
  className,
  ...props
}: Props) => {
  const componentColorClass = outline
    ? (colorsOutline[props.color] as string)
    : colorsBgLight[props.color];

  const [isDismissed, setIsDismissed] = useState(false);

  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault();

    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={`mb-6 rounded-lg border px-3 py-6 transition-colors duration-150 last:mb-0 md:py-3 ${componentColorClass} ${className}`}
    >
      <div className="flex flex-col items-center justify-between md:flex-row">
        <div className="mb-6 flex flex-col items-center md:mb-0 md:flex-row">
          {props.icon && (
            <BaseIcon
              path={props.icon}
              w="w-10 md:w-5"
              h="h-10 md:h-5"
              size="24"
              className="md:mr-2"
            />
          )}
          <span className="text-center md:py-2 md:text-left">{children}</span>
        </div>
        {props.button}
        {!props.button && (
          <BaseButton
            icon={mdiClose}
            color="white"
            onClick={dismiss}
            small
            roundedFull
          />
        )}
      </div>
    </div>
  );
};

export default NotificationBar;
