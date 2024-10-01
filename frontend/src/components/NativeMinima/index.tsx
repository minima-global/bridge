import { useContext, useEffect, useState } from "react"
import { appContext } from "../../AppContext"
import Decimal from "decimal.js"

const NativeMinima = () => {
  const { _minimaBalance } = useContext(appContext)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (_minimaBalance !== null) {
      setIsLoading(false)
    }
  }, [_minimaBalance])

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full" />
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-24" />
      </div>
    )
  }

  if (_minimaBalance === null) {
    return null
  }

  const balance = _minimaBalance && _minimaBalance.unconfirmed === "0" 
    ? new Decimal(_minimaBalance.confirmed).toFixed(2) 
    : _minimaBalance && _minimaBalance.unconfirmed !== "0" 
      ? `${new Decimal(_minimaBalance.confirmed).toFixed(2)}/${new Decimal(_minimaBalance.unconfirmed).toFixed(2)}`
      : '-'

  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-full py-2 px-4 md:max-w-max">
      <img
        alt="Minima"
        src="./assets/token.svg"
        className="w-10 h-10 rounded-full"
      />
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Native Minima</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {balance} <span className="text-sm font-normal">MINIMA</span>
        </p>
      </div>
    </div>
  )
}

export default NativeMinima