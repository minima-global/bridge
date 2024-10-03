import { FormikContextType, FormikValues, useFormikContext } from "formik"
import { useState } from "react"
import NativeMinima from "../../../../../NativeMinima"
import InputWrapper from "../../../../../UI/FormComponents/InputWrapper"
import Charts from "../../Charts"
import TetherToken from "../TetherPoolOld/TetherToken"
import {
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  BarChart2,
  ArrowDownUp,
} from "lucide-react"

const TetherPool = ({ onShowConfirm }) => {
  const [focused, setFocused] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const formik: FormikContextType<FormikValues> = useFormikContext()
  const { dirty, errors, touched,  getFieldProps } = formik

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 mb-4">
          <div className="w-full md:w-auto">
            <NativeMinima />
          </div>
          <div className="flex justify-center">
            <div className="bg-violet-100 dark:bg-violet-900 rounded-full p-2">
              <ArrowDownUp className="w-6 h-6 text-violet-500 md:hidden" />
              <ArrowRightLeft className="w-6 h-6 text-violet-500 hidden md:block" />
            </div>
          </div>
          <div className="w-full md:w-auto">
            <TetherToken />
          </div>
        </div>

        <InputWrapper
          orderbook={true}
          orderbookFocus={focused}
          errors={
            errors && errors.native && touched && touched.native
              ? errors.native
              : false
          }
          wrapperStyle="mb-6"
          inputProps={{
            placeholder: "0.0",
            ...getFieldProps("native"),
            className: "text-lg font-medium",
          }}
          label="Amount of Minima"
          setOrderFocus={setFocused}
        />

        <div className="grid grid-cols-2 gap-4">
          <button
            disabled={!!errors.native || !dirty}
            onClick={() => onShowConfirm("buy")}
            type="button"
            className="py-3 px-6 rounded-lg font-bold text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 transition-colors duration-200"
          >
            Buy
          </button>
          <button
            disabled={!!errors.native || !dirty}
            onClick={() => onShowConfirm("sell")}
            type="button"
            className="py-3 px-6 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 transition-colors duration-200"
          >
            Sell
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="bg-transparent w-full py-3 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-violet-500" />
              Advanced View
            </div>
            {showAdvanced ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </button>
      </div>

      {showAdvanced && (
        <div className="p-6 bg-gray-50 dark:bg-gray-900">
          <Charts  book="usdt"  />
          <Charts  book="usdt"  />
        </div>
      )}
    </div>
  )
}

export default TetherPool