import { useState } from "react";

import { DialogProps } from "~/components/common/cards/CardBoxModal";

export const useDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogProps, setDialogProps] =
    useState<
      Pick<DialogProps, "title" | "buttonColor" | "onConfirm" | "message">
    >();
  return {
    isOpen: isDialogOpen,
    props: dialogProps,
    show: () => setIsDialogOpen(true),
    hide: () => setIsDialogOpen(false),
    setProps: setDialogProps,
  };
};
