import { FormikErrors } from "formik"
import { ReactNode, useState } from "react"
import { AlertCircle } from "lucide-react"

interface Props {
  label: string
  inputProps: any
  errors: string | false | string[] | FormikErrors<any> | FormikErrors<any>[]
  action?: ReactNode
  wrapperStyle?: string
  orderbook?: boolean
  orderbookFocus?: boolean
  setOrderFocus?: (focused: boolean) => void
}

const InputWrapper = ({
  label,
  inputProps,
  action,
  wrapperStyle,
  errors,
  orderbook,
  orderbookFocus,
  setOrderFocus
}: Props) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = () => {
    setIsFocused(true)
    if (orderbook && setOrderFocus) {
      setOrderFocus(true)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    if (setOrderFocus) {
      setOrderFocus(false)
    }
    if (inputProps.onBlur) {
      inputProps.onBlur(e)
    }
  }

  const inputClasses = `
    bg-transparent font-mono w-full
    text-gray-800 dark:text-gray-200
    placeholder-gray-400 dark:placeholder-gray-600
    focus:outline-none
  `

  const wrapperClasses = `
    ${wrapperStyle}
    rounded-lg overflow-hidden
    bg-white dark:bg-gray-800
    border border-gray-200 dark:border-gray-700
    ${errors ? "border-red-500 dark:border-red-400" : ""}
    ${(isFocused || orderbookFocus) ? "ring-2 ring-violet-500 dark:ring-violet-400" : ""}
    transition-all duration-200 ease-in-out
  `

  const labelClasses = `
    block text-sm font-medium mb-1
    ${errors ? "text-red-500 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}
    ${(isFocused || orderbookFocus) ? "text-violet-500 dark:text-violet-400" : ""}
  `

  return (
    <div className={wrapperClasses}>
      <div className={`px-4 py-3 ${action ? "sm:grid sm:grid-cols-[1fr_auto] sm:gap-4 sm:items-center" : ""}`}>
        <div>
          <label htmlFor={inputProps.id || inputProps.name} className={labelClasses}>
            {label}
          </label>
          <input
            {...inputProps}
            className={inputClasses}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        {action && <div className="mt-2 sm:mt-0">{action}</div>}
      </div>
      {errors && (
        <div className="bg-red-50 dark:bg-red-900 px-4 py-2 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
          <p className="text-sm text-red-600 dark:text-red-300">
            {typeof errors === 'string' ? errors : "Invalid input"}
          </p>
        </div>
      )}
    </div>
  )
}

export default InputWrapper