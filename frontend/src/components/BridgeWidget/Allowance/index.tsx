import { useState } from "react"
import { Formik } from "formik"
import { useContext } from "react"
import { appContext } from "../../../AppContext"
import { MaxUint256 } from "ethers"
import { getTokenTransferApproval } from "../../../libs/getTokenTransferApproval"
import { Token } from "@uniswap/sdk-core"
import { useWalletContext } from "../../../providers/WalletProvider/WalletProvider"
import { _defaults } from "../../../constants"
import { sendSimpleBackendMSG } from "../../../../../dapp/js/jslib.js"
import { AlertCircle, CheckCircle, X, Loader, DollarSign } from "lucide-react"
import AnimatedDialog from "../../UI/AnimatedDialog"

const Allowance = () => {
  const {
    _network: currentNetwork,
    _wallet: signer,
    _address,
  } = useWalletContext()
  const { _promptAllowance, setPromptAllowance, _approving, setApproving } = useContext(appContext)

  const [error, setError] = useState<string | false>(false)
  const [step, setStep] = useState(1)

  const handleRefreshNonce = () => {
    sendSimpleBackendMSG("REFRESHNONCE", () => {
      // run refresh nonce after approving contract spends, so that backend nonce is up to date...
    })
  }

  const isDefault = !_approving && !error && step === 1
  const isApproved = !_approving && !error && step === 2
  const isError = !_approving && error
  const isApproving = _approving && !error

  const allowanceContent = (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden  flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          {isDefault && "Allowance Approval"}
          {isApproved && "Allowance Approved"}
          {isError && "Approval Failed"}
          {isApproving && "Approving Allowance"}
        </h3>
        {!isApproving && (
          <button
            onClick={() => setPromptAllowance(false)}
            className="bg-transparent text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 transition-colors duration-200"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="p-6 flex-grow overflow-y-auto">
        <div className="mb-6">
          {isDefault && (
            <div className=" dark:bg-blue-900 rounded-lg">
              <p className="text-sm">
                To start trading, please approve your wMinima and USDT. ETH is required for this approval. You can deposit ETH by navigating to the Balance page and clicking the 'Deposit' button on your Ethereum balance.
              </p>
            </div>
          )}
          {isApproved && (
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg flex items-center">
              <CheckCircle className="mr-3 h-6 w-6 text-green-500 dark:text-green-400" />
              <p className="text-sm font-medium text-green-700 dark:text-green-200">Approved Allowances, ready to go!</p>
            </div>
          )}
          {isError && (
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg flex items-center">
              <AlertCircle className="mr-3 h-6 w-6 text-red-500 dark:text-red-400" />
              <p className="text-sm font-medium text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}
          {_approving && (
            <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg flex items-center">
              <Loader className="mr-3 h-6 w-6 animate-spin text-yellow-500 dark:text-yellow-400" />
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-200">Approving... Please be patient and do not refresh this page.</p>
            </div>
          )}
        </div>

        <Formik
          initialValues={{}}
          onSubmit={async () => {
            setApproving(true)
            setError(false)

            try {
              const supportedChains = currentNetwork === "mainnet" ? 1 : 11155111
              const wMinimaAddress = _defaults["wMinima"][currentNetwork]
              const tetherAddress = _defaults["Tether"][currentNetwork]

              const wMinima = new Token(
                supportedChains,
                wMinimaAddress,
                18,
                "WMINIMA",
                "wMinima"
              )
              const tether = new Token(
                11155111,
                tetherAddress,
                currentNetwork === "mainnet" ? 6 : 18,
                "USDT",
                "Tether"
              )

              await getTokenTransferApproval(
                wMinima,
                MaxUint256.toString(),
                signer!,
                _address!
              )
              await getTokenTransferApproval(
                tether,
                MaxUint256.toString(),
                signer!,
                _address!
              )

              handleRefreshNonce()

              setStep(2)
            } catch (error) {
              setStep(1)
              if (error instanceof Error) {
                return setError(error.message.includes("insufficient funds") ? "Insufficient funds.  Please deposit more ETH on the Balance page and try again." : error.message)
              }

              setError("Allowance approval failed")
            } finally {
              setApproving(false)
            }
          }}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <button
                  type="submit"
                  disabled={_approving}
                  className="w-full rounded-lg bg-teal-500 px-4 py-3 font-bold text-white transition-colors duration-200 hover:bg-teal-600 disabled:bg-gray-400 disabled:text-gray-200 dark:bg-teal-600 dark:hover:bg-teal-700 dark:disabled:bg-gray-600 flex items-center justify-center"
                >
                  {_approving ? (
                    <>
                      <Loader className="animate-spin mr-2 h-5 w-5" />
                      Approving...
                    </>
                  ) : isDefault ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Approve
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-2 h-5 w-5" />
                      Retry
                    </>
                  )}
                </button>
              )}
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setPromptAllowance(false)}
                  className="w-full rounded-lg bg-green-500 px-4 py-3 font-bold text-white transition-colors duration-200 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 flex items-center justify-center"
                >
                  <DollarSign className="mr-2 h-5 w-5" />
                  Ready to trade
                </button>
              )}
            </form>
          )}
        </Formik>
      </div>
    </div>
  )

  return (
    <AnimatedDialog
      up={2000}
      display={_promptAllowance}
      dismiss={() => setPromptAllowance(false)}
    >
      {allowanceContent}
    </AnimatedDialog>
  )
}

export default Allowance