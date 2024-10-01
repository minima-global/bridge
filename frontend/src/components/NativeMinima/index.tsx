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
      <div className="flex items-center gap-1 animate-pulse">
        <div className="w-[32px] h-[32px] bg-gray-300 dark:bg-gray-700 rounded-lg" />
        <div className="h-9 bg-gray-300 dark:bg-gray-700 rounded w-40" />
      </div>
    )
  }

  if (_minimaBalance === null) {
    return null
  }

  const balance = _minimaBalance && _minimaBalance.unconfirmed === "0" 
    ? new Decimal(_minimaBalance.confirmed).toFixed(1) 
    : _minimaBalance && _minimaBalance.unconfirmed !== "0" 
      ? new Decimal(_minimaBalance.confirmed).toFixed(1) + "/" + new Decimal(_minimaBalance.unconfirmed).toString()
      : '-'

  return (
    <div className="flex items-center gap-1">
      <img
        alt="token-icon"
        src="./assets/token.svg"
        className="w-[32px] h-[32px] rounded-lg"
      />
      <p className="text-3xl font-bold">
        {balance} MINIMA
      </p>
    </div>
  )
}

export default NativeMinima