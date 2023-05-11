import { useState } from 'react'
import { type FieldValues, useForm } from 'react-hook-form'

export const useTable = <T extends FieldValues>() => {
  const [isInEditMode, setIsInEditMode] = useState(-1)
  const createForm = useForm<T>()
  const editForm = useForm<T>()

  return [isInEditMode, setIsInEditMode, createForm, editForm] as const
}
