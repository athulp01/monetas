const options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const DateFormater = new Intl.DateTimeFormat('default', options as any)

export const CurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  notation: 'compact',
  compactDisplay: 'long',
})
