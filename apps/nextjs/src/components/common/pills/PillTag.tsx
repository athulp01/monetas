import React from "react";

import { colorsBgLight, colorsOutline } from "~/config/colors";
import { type ColorKey } from "~/interfaces";
import PillTagPlain from "./PillTagPlain";

type Props = {
  label?: string;
  color: ColorKey;
  icon?: string;
  small?: boolean;
  outline?: boolean;
  className?: string;
};

const PillTag = ({
  small = false,
  outline = false,
  className = "",
  ...props
}: Props) => {
  const layoutClassName = small ? "py-1 px-3" : "py-1.5 px-4";
  const colorClassName: string = outline
    ? (colorsOutline[props.color] as string)
    : colorsBgLight[props.color];

  return (
    <PillTagPlain
      className={`rounded-full border ${layoutClassName} ${colorClassName} ${className}`}
      icon={props.icon}
      label={props.label}
      small={small}
    />
  );
};

export default PillTag;
