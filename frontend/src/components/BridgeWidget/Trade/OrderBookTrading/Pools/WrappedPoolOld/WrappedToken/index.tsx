import Decimal from "decimal.js"
import { useTokenStoreContext } from "../../../../../../../providers/TokenStoreProvider"
import { formatUnits } from "ethers"
import { Loader } from "lucide-react"

interface Props {
  extraClass?: string
}

const WrappedToken = ({ extraClass }: Props) => {
  const { tokens } = useTokenStoreContext()
  const relevantToken = tokens.find((t) => t.name === "wMinima")

  const isLoading = !relevantToken || !relevantToken.balance
  const balance = relevantToken && relevantToken.balance
    ? new Decimal(formatUnits(relevantToken.balance, relevantToken.decimals)).toFixed(2)
    : null

  return (
    <div className={`flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 md:max-w-max rounded-full py-2 px-4 ${extraClass || ''}`}>
      <img
        alt="Wrapped Minima"
        src="./assets/wtoken.svg"
        className="w-10 h-10 rounded-full"
      />
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Wrapped Minima</p>
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader className="w-4 h-4 text-violet-500 animate-spin" />
            <span className="text-sm text-gray-400">Loading...</span>
          </div>
        ) : (
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {balance} <span className="text-sm font-normal">wMINIMA</span>
          </p>
        )}
      </div>
    </div>
  )
}

export default WrappedToken