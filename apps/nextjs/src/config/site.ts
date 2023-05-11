import { type DrawerOptions } from 'flowbite'

export const ITEMS_PER_PAGE = 10

export const DRAWER_OPTIONS: DrawerOptions = {
  placement: 'right',
  backdrop: true,
  bodyScrolling: false,
  edge: false,
  edgeOffset: '',
  backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
}

export const TOAST_OPTIONS = {
  transition: 'transition-opacity',
  duration: 1000,
  timing: 'ease-out',
}

export const DATEPICKER_OPTIONS = {
  autoHide: true,
  todayBtn: false,
  clearBtn: false,
  maxDate: new Date('2030-01-01'),
  minDate: new Date('1950-01-01'),
  theme: {
    background: '',
    todayBtn: '',
    clearBtn: '',
    icons: '',
    text: '',
    disabledText: '',
    input: '',
    inputIcon: '',
    selected: '',
  },
  datepickerClassNames: 'top-12',
  defaultDate: new Date(),
  language: 'en',
}
