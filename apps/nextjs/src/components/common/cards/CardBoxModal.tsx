import { mdiClose } from '@mdi/js'
import type { ColorButtonKey } from '../../../interfaces'
import BaseButton from '../buttons/BaseButton'
import BaseButtons from '../buttons/BaseButtons'
import CardBox from './CardBox'
import CardBoxComponentTitle from './CardBoxComponentTitle'
import OverlayLayer from '../sections/OverlayLayer'

export type DialogProps = {
  title: string
  warning?: string
  buttonColor: ColorButtonKey
  buttonLabel: string
  isActive: boolean
  message: string
  onConfirm: () => void
  onCancel?: () => void
}

const CardBoxModal = ({
  title,
  warning,
  buttonColor,
  buttonLabel,
  isActive,
  message,
  onConfirm,
  onCancel,
}: DialogProps) => {
  if (!isActive) {
    return null
  }

  const footer = (
    <BaseButtons>
      <BaseButton label={buttonLabel} color={buttonColor} onClick={onConfirm} />
      {!!onCancel && <BaseButton label="Cancel" color={buttonColor} outline onClick={onCancel} />}
    </BaseButtons>
  )

  return (
    <OverlayLayer onClick={onCancel} className={onCancel ? 'cursor-pointer' : ''}>
      <CardBox
        className={`z-50 max-h-modal w-11/12 shadow-lg transition-transform md:w-3/5 lg:w-2/5 xl:w-4/12`}
        isModal
        footer={footer}
      >
        <CardBoxComponentTitle title={title}>
          {!!onCancel && (
            <BaseButton icon={mdiClose} color="whiteDark" onClick={onCancel} small roundedFull />
          )}
        </CardBoxComponentTitle>

        <div className="space-y-3">
          <p>{message}</p>
          {warning && (
            <div
              className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
              role="alert"
            >
              <span className="font-medium">{warning}</span>
            </div>
          )}
        </div>
      </CardBox>
    </OverlayLayer>
  )
}

export default CardBoxModal
