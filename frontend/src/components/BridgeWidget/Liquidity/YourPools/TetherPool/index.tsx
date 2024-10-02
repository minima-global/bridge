import { useContext, useState } from "react"
import Decimal from "decimal.js"
import { appContext } from "../../../../../AppContext.js"
import { useOrderBookContext } from "../../../../../hooks/useOrderBook.js"
import { Formik, Form, Field } from "formik"
import * as yup from "yup"
import { MAXIMUM_MINIMA_TRADE } from "../../../../../../../dapp/js/htlcvars.js"
import useAllowanceChecker from "../../../../../hooks/useAllowanceChecker.js"
import { Lock,  ArrowRightLeft } from "lucide-react"

const TetherPool = () => {
  useAllowanceChecker()

  const { notify, _allowanceLock, setPromptAllowance } = useContext(appContext)
  const { _currentOrderBook, updateBook } = useOrderBookContext()
  const [_, setFocused] = useState(false)

  const handleDisable = () => {
    try {
      if (!_currentOrderBook) {
        throw new Error("Order book not available")
      }

      updateBook({
        wminima: { ..._currentOrderBook.wminima },
        usdt: {
          minimum: 1,
          maximum: MAXIMUM_MINIMA_TRADE,
          buy: 0,
          sell: 0,
          enable: false,
        },
      })
      notify("Trading disabled for USDT pool")
    } catch (error) {
      if (error instanceof Error) {
        notify(error.message, "error")
      }
    }
  }

  const validationSchema = yup.object().shape({
    sell: yup
      .number()
      .required("Enter your sell price")
      .positive("Price must be positive")
      .test("valid amount", "Can't exceed 4 decimal places", (val) => {
        return val ? new Decimal(val).decimalPlaces() <= 4 : true
      }),
    buy: yup
      .number()
      .required("Enter your buy price")
      .positive("Price must be positive")
      .test("valid amount", "Can't exceed 4 decimal places", (val) => {
        return val ? new Decimal(val).decimalPlaces() <= 4 : true
      }),
    minimum: yup
      .number()
      .required("Enter the minimum trade amount")
      .positive("Amount must be positive")
      .integer("Must be a whole number")
      .max(MAXIMUM_MINIMA_TRADE, `Maximum is ${MAXIMUM_MINIMA_TRADE}`),
  })

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        enable: _currentOrderBook?.usdt.enable || false,
        buy: _currentOrderBook?.usdt.buy || 0,
        sell: _currentOrderBook?.usdt.sell || 0,
        maximum: MAXIMUM_MINIMA_TRADE,
        minimum: _currentOrderBook?.usdt.minimum || 250,
      }}
      onSubmit={(values) => {
        try {
          if (!_currentOrderBook) {
            throw new Error("Order book not available")
          }

          updateBook({
            wminima: { ..._currentOrderBook.wminima },
            usdt: { ...values, enable: true },
          })
          notify("USDT trading parameters updated successfully!")
        } catch (error) {
          if (error instanceof Error) {
            notify(error.message, "error")
          }
        }
      }}
      validationSchema={validationSchema}
    >
      {({ errors, isValid, values, touched }) => (
        <Form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 mr-2 text-purple-600" />
              USDT Trading Pool
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Set your trading parameters for MINIMA/USDT exchanges. This determines the prices at which you're willing to trade.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                name="buy"
                label="Buy 1 MINIMA for (USDT)"
                placeholder="0"
                setFocused={setFocused}
                icon="./assets/tether.svg"
                error={touched.buy && errors.buy}
              />
              <InputField
                name="sell"
                label="Sell 1 MINIMA for (USDT)"
                placeholder="0"
                setFocused={setFocused}
                icon="./assets/tether.svg"
                error={touched.sell && errors.sell}
              />
            </div>

            <div className="bg-neutral-50 dark:bg-gray-700 p-6 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Trade Limits</h3>
              <div className="grid grid-cols-1 gap-6">
                <InputField
                  name="minimum"
                  label="Minimum Trade Amount (MINIMA)"
                  placeholder="0"
                  setFocused={setFocused}
                  error={touched.minimum && errors.minimum}
                  icon={<div className="w-6 h-6 overflow-hidden rounded-full"><img src="./assets/token.svg" alt="Minima" /></div>}
                />
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-center">
                    Maximum Trade Amount (MINIMA) <Lock className="inline-block w-4 h-4 text-yellow-500 ml-1" />
                  </label>
                  <div className="relative">
                    <input
                      readOnly
                      value={values.maximum}
                      className="w-full bg-gray-200 dark:bg-gray-600 rounded-md py-2 pl-3 pr-3 text-gray-700 dark:text-gray-300 font-mono"
                    />                    
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 overflow-hidden rounded-full"><img src="./assets/token.svg" /></div>
                  </div>
                </div>
              </div>
            </div>

            {!!values.sell && !!values.buy && values.sell > 0 && values.buy > 0 && (
              <div className="bg-violet-100 dark:bg-violet-900 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-violet-800 dark:text-blue-200 mb-3">
                  Trading Example
                </h3>
                <p className="text-sm text-violet-800 dark:text-violet-200 space-y-2">
                  <span className="block">With these settings:</span>
                  <span className="block">You would receive {new Decimal(100).dividedBy(values.buy).toFixed(2)} <strong>MINIMA</strong> for 100 <strong>TETHER</strong></span>
                  <span className="block">You would receive {new Decimal(100).times(values.sell).toFixed(2)} <strong>TETHER</strong> for 100 <strong>MINIMA</strong></span>
                </p>
              </div>
            )}

            {_allowanceLock ? (
              <button
                onClick={() => setPromptAllowance(true)}
                type="button"
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
              >
                Approve USDT Allowance
              </button>
            ) : (
              <div className="space-y-3">
                {!values.enable ? (
                  <button
                    type="submit"
                    disabled={!isValid}
                    className={`w-full py-3 rounded-lg font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      isValid
                        ? "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isValid ? "Enable USDT For Trading" : "Please Fill All Fields Correctly"}
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={!isValid}
                      className={`flex-1 py-3 rounded-lg font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                        isValid
                          ? "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isValid ? "Update Parameters" : "Please Fill All Fields Correctly"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDisable}
                      className="bg-red-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                      Disable Trading
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Form>
      )}
    </Formik>
  )
}

const InputField = ({ name, label, placeholder, setFocused, icon, error }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <div className="relative">
      <Field
        id={name}
        name={name}
        type="number"
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-gray-100 dark:bg-gray-700 rounded-md py-2 pl-3 pr-10 text-gray-700 dark:text-gray-300 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 ${
          error ? "border-red-500" : ""
        }`}
      />
      {icon && (
        typeof icon === 'string' 
          ? <img src={icon} alt="Token" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full" />
          : <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{icon}</div>
      )}
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
)

export default TetherPool