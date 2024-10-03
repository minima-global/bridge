import { useContext } from "react"
import { appContext } from "../../../AppContext"

const Navigation = () => {
  const { _currentNavigation, setCurrentNavigation, _currentTradeWindow, setCurrentTradeWindow } = useContext(appContext)

  const isActive = (_current: string) => {
    return _currentNavigation === _current
      ? "bg-violet-500 rounded-lg text-white dark:text-black font-bold py-2 px-4"
      : "text-violet-300 hover:text-violet-400 cursor-pointer opacity-50 py-2 px-4 transition-colors duration-200"
  }

  return (
    <div className="mx-4 sm:mx-0">
      <nav className="bg-violet-800 rounded-lg p-1 max-w-sm mx-auto">
        <ul className="grid grid-cols-2 gap-1">
          <li>
            <button
              onClick={() => setCurrentNavigation("balance")}
              className={`w-full ${isActive("balance")}`}
            >
              Balance
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                if (_currentTradeWindow !== null && _currentNavigation === 'trade') {
                  setCurrentTradeWindow(null)
                }
                setCurrentNavigation("trade")
              }}
              className={`w-full ${isActive("trade")}`}
            >
              Trade
            </button>
          </li>                                    
        </ul>
      </nav>
    </div>
  )
}

export default Navigation