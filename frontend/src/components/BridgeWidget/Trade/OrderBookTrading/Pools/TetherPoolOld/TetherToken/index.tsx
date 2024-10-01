import Decimal from "decimal.js"
import { useTokenStoreContext } from "../../../../../../../providers/TokenStoreProvider"
import { useWalletContext } from "../../../../../../../providers/WalletProvider/WalletProvider"
import { formatUnits } from "ethers"
import { Loader } from "lucide-react"

interface Props {
  extraClass?: string
}

const TetherToken = ({ extraClass }: Props) => {
  const { tokens } = useTokenStoreContext()
  const { _network } = useWalletContext()
  const relevantToken = tokens.find((t) => t.name === "Tether")

  const isLoading = !relevantToken || !relevantToken.balance
  const balance = relevantToken && relevantToken.balance
    ? new Decimal(formatUnits(relevantToken.balance, _network === 'sepolia' ? 18 : relevantToken.decimals)).toFixed(2)
    : null

  return (
    <div className={`flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 md:max-w-max rounded-full py-2 px-4 ${extraClass || ''}`}>
      <img
        alt="Tether"
        src="./assets/tether.svg"
        className="w-10 h-10 rounded-full"
      />
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tether</p>
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader className="w-4 h-4 text-blue-500 animate-spin" />
            <span className="text-sm text-gray-400">Loading...</span>
          </div>
        ) : (
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {balance} <span className="text-sm font-normal">USDT</span>
          </p>
        )}
      </div>
    </div>
  )
}

export default TetherToken