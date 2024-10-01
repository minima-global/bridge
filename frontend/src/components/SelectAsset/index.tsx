import { useFormikContext } from "formik"
import { useContext, useEffect, useRef, useState } from "react"
import { useSpring, animated, config } from "react-spring"
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider"
import { useTokenStoreContext } from "../../providers/TokenStoreProvider"
import { Asset } from "../../types/Asset"
import { formatUnits } from "ethers"
import defaultAssetsStored, { _defaults } from "../../constants"
import { appContext } from "../../AppContext"
import { ChevronDown, ChevronUp } from "lucide-react"

const SelectAsset = () => {
  const formik: any = useFormikContext()
  const [active, setActive] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { tokens } = useTokenStoreContext()
  const { _balance, _network } = useWalletContext()

  const { _currentNetwork, _defaultNetworks } = useContext(appContext)

  const Ethereum = defaultAssetsStored[0]

  const springProps = useSpring({
    opacity: active ? 1 : 0,
    transform: active ? "translateY(0%)" : "translateY(-10%)",
    config: config.stiff,
  })

  const handleButtonClick = () => {
    setActive((prevState) => !prevState)
  }

  const handleSelect = (asset: Asset) => {
    formik.setFieldValue("asset", asset)
    setActive(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActive(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const renderAssetIcon = (asset: Asset) => {
    if (asset.type === "ether") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" className="rounded-full">
          <g fill="none" fillRule="evenodd">
            <circle cx="16" cy="16" r="16" fill="#627EEA" />
            <g fill="#FFF" fillRule="nonzero">
              <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
              <path d="M16.498 4L9 16.22l7.498-3.35z" />
              <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z" />
              <path d="M16.498 27.995v-6.028L9 17.616z" />
              <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z" />
              <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z" />
            </g>
          </g>
        </svg>
      )
    } else if (_defaults["wMinima"][_network] === asset.address) {
      return <img alt="token-icon" src="./assets/wtoken.svg" className="w-9 h-9 rounded-full" />
    } else if (_defaults["Tether"][_network] === asset.address) {
      return <img alt="token-icon" src="./assets/tether.svg" className="w-9 h-9 rounded-full" />
    } else {
      return (
        <div className="w-9 h-9 bg-white rounded-full overflow-hidden flex justify-center items-center shadow-md text-black font-bold">
          {asset.name.substring(0, 1).toUpperCase()}
        </div>
      )
    }
  }

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        id="options-menu"
        aria-haspopup="true"
        aria-expanded={active}
        onClick={handleButtonClick}
        className="mt-4 border-2 border-violet-100 flex items-center justify-between w-full p-4 rounded-lg hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 bg-violet-100"
      >
        <div className="flex items-center space-x-3">
          {renderAssetIcon(formik.values.asset)}
          <div className="flex flex-col items-start">
            <span className="font-bold text-gray-900 dark:text-white">{formik.values.asset.name}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
              {formik.values.asset.type === 'erc20'
                ? formatUnits(formik.values.asset.balance, formik.values.asset.name === 'Tether' && _network === 'sepolia' ? 18 : formik.values.asset.decimals)
                : formik.values.asset.balance}
            </span>
          </div>
        </div>
        {active ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>

      {active && (
        <animated.div
          style={springProps}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <ul className="py-1">
            {tokens.map((token) => (
              <li
                key={token.address}
                onClick={() => handleSelect(token)}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150 ease-in-out"
              >
                <div className="flex items-center space-x-3">
                  {renderAssetIcon(token)}
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-gray-900 dark:text-white">{token.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {formatUnits(token.balance, token.name === 'Tether' && _network === 'sepolia' ? 18 : token.decimals)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
            <li
              onClick={() => handleSelect({ ...Ethereum, balance: _balance, name: _defaultNetworks[_currentNetwork].name, symbol: _defaultNetworks[_currentNetwork].symbol })}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150 ease-in-out"
            >
              <div className="flex items-center space-x-3">
                {renderAssetIcon(Ethereum)}
                <div className="flex flex-col items-start">
                  <span className="font-medium text-gray-900 dark:text-white">{_defaultNetworks[_currentNetwork].name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{_balance}</span>
                </div>
              </div>
            </li>
          </ul>
        </animated.div>
      )}
    </div>
  )
}

export default SelectAsset