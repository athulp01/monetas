import { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";

export const useTable = <T extends FieldValues>() => {
  const [isInEditMode, setIsInEditMode] = useState(-1);
  const createForm = useForm<T>();
  const editForm = useForm<T>();

  return [isInEditMode, setIsInEditMode, createForm, editForm] as const;
};
