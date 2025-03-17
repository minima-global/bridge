import { useContext, useMemo } from "react"
import Decimal from "decimal.js"
import { formatUnits } from "ethers"
import { appContext } from "../../../../../../AppContext"
import { useTokenStoreContext } from "../../../../../../providers/TokenStoreProvider"
import { useWalletContext } from "../../../../../../providers/WalletProvider/WalletProvider"
import { ArrowDownUp } from "lucide-react"

export default function BalanceOverview() {
  const { _minimaBalance } = useContext(appContext)
  const { tokens } = useTokenStoreContext()
  const { _network } = useWalletContext()

  const tetherToken = tokens.find((t) => t.name === "Tether")

  const minimaBalance = useMemo(() => {
    if (!_minimaBalance) return new Decimal(0)
    return new Decimal(_minimaBalance.confirmed).toDecimalPlaces(6)
  }, [_minimaBalance])

  const tetherBalance = useMemo(() => {
    if (!tetherToken) return new Decimal(0)
    return new Decimal(
      formatUnits(tetherToken.balance, 6),
    ).toDecimalPlaces(4)
  }, [tetherToken, _network])


  return (
    <div className="w-full rounded-lg bg-white bg-opacity-30 dark:bg-opacity-10 dark:bg-[#1B1B1B] p-4 mb-4 shadow-sm">
      <h3 className="text-sm font-medium text-center mb-2 text-gray-700 dark:text-gray-300">Your Balance</h3>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img alt="Minima token" src="./assets/token.svg" className="w-[28px] h-[28px] rounded-full" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Minima</p>
            <p className="font-mono text-sm font-medium">{minimaBalance.toString()}</p>
          </div>
        </div>

        <ArrowDownUp className="w-4 h-4 text-gray-400" />

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Tether</p>
            <p className="font-mono text-sm font-medium">{tetherBalance.toString()}</p>
          </div>
          <img alt="Tether token" src="./assets/tether.svg" className="w-[28px] h-[28px] rounded-full" />
        </div>
      </div>
    </div>
  )
}

