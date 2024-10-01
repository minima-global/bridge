import { useContext, useEffect, useState } from "react"
import TetherPool from "../Pools/TetherPool"
import WrappedPool from "../Pools/WrappedPool"
import { appContext } from "../../../../../AppContext"
import SelectPool from "../Pools/SelectPool"
import withConfirmation from "../Pools/withConfirmation"
import { Formik } from "formik"
import * as yup from "yup"
import Decimal from "decimal.js"
import { MAXIMUM_MINIMA_TRADE } from "../../../../../../../dapp/js/htlcvars.js"
import { useWalletContext } from "../../../../../providers/WalletProvider/WalletProvider"
import SelectFavorites from "../Pools/SelectFavorites"
import { Repeat } from "lucide-react"

const WrappedPoolWithConfirmation = withConfirmation(WrappedPool, "wminima")
const TetherPoolWithConfirmation = withConfirmation(TetherPool, "usdt")

const OrderBookForm = () => {
  const { loaded, handleActionViaBackend, notify } = useContext(appContext)
  const { callBalanceForApp } = useWalletContext()
  const [selectedOption, setSelectedOption] = useState<'wminima' | 'usdt'>("wminima")

  useEffect(() => {
    if (loaded && loaded.current) {
      callBalanceForApp()
    }
  }, [loaded, selectedOption])

  const handleOptionChange = (e) => {
    const val = e.target.value
    setSelectedOption(val)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-left">
        Trade Native Minima
      </h2>

      <div className="mb-6 space-y-4">
        <SelectPool
          selectedOption={selectedOption}
          handleOptionChange={handleOptionChange}
        />
      </div>

      <Formik
        initialValues={{ native: "", favorites: false, transaction: "" }}
        validationSchema={yup.object().shape({
          native: yup
            .number()            
            .required("Enter your offer")
            .test("valid amount", function (val) {
              const { path, createError } = this
              try {
                if (new Decimal(val).isZero()) {
                  throw new Error("Enter your offer")
                }
                if (new Decimal(val).decimalPlaces() > 4) {
                  throw new Error("Can't exceed more than 4 decimal places")
                }
                if (new Decimal(val).greaterThan(MAXIMUM_MINIMA_TRADE)) {
                  throw new Error(
                    "Order too big, must be less than " + MAXIMUM_MINIMA_TRADE
                  )
                }
                return true
              } catch (error) {
                if (error instanceof Error) {
                  return createError({
                    path,
                    message: error && error.message ? error.message : "Invalid number",
                  })
                }
              }
            }),
        })}
        onSubmit={async ({ transaction }, { resetForm }) => {
          try {
            if (!transaction) {
              throw new Error("Transaction payload not available")
            }
            await handleActionViaBackend(transaction)
            notify("Order requested...")
            resetForm()
            callBalanceForApp()
          } catch (error: any) {
            console.error(error)
            if (error instanceof Error) {
              return notify("Error : " + error.message)
            }
            notify(
              error.message ? error.message : "Error, something went wrong!"
            )
          }
        }}
      >
        {({ submitForm }) => (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Repeat className="w-5 h-5 text-violet-600 mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedOption === 'wminima' ? 'WMINIMA' : 'USDT'} Pool
                </span>
              </div>
              <div className="flex items-center">
                <SelectFavorites />
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              {selectedOption === 'wminima' && (
                <WrappedPoolWithConfirmation onSubmit={() => submitForm()} />
              )}
              {selectedOption === 'usdt' && (
                <TetherPoolWithConfirmation onSubmit={() => submitForm()} />
              )}
            </div>
          </>
        )}
      </Formik>
    </div>
  )
}

export default OrderBookForm