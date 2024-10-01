import { useContext } from "react";
import { appContext } from "../../AppContext";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { useTokenStoreContext } from "../../providers/TokenStoreProvider";
import { formatUnits } from "ethers";
import { _defaults } from "../../constants";
import {RefreshCwIcon} from "lucide-react";
import Decimal from "decimal.js";

const TokenList = () => {
  const {
    _currentNavigation,
    setTriggerBalanceUpdate,
    _triggerBalanceUpdate,
    getWalletBalance,
  } = useContext(appContext);
  const { _network, _poolPrice, getEthereumBalance } = useWalletContext();
  const { tokens } = useTokenStoreContext();

  if (_currentNavigation !== "balance") {
    return null;
  }

  const handlePullBalance = () => {
    setTriggerBalanceUpdate(true);
    setTimeout(() => {
      getWalletBalance();
      getEthereumBalance();
      setTriggerBalanceUpdate(false);
    }, 2000);
  };

  return (
    <div>
      <div className="grid grid-cols-[1fr_auto]">
        <h3 className="font-bold mb-2">Ethereum Tokens</h3>
        <span onClick={handlePullBalance} className={`dark:text-sky-500`}>
          <RefreshCwIcon
            className={`${_triggerBalanceUpdate && "animate-spin" } w-6 h-4`}            
          />
        </span>
      </div>

      {_triggerBalanceUpdate && (
        <ul className="space-y-2">
          {[...Array(2)].map((_, index) => (
            <li
              key={index}
              className="shadow-sm dark:shadow-none grid grid-cols-[auto_1fr] bg-neutral-100 dark:bg-[#1B1B1B] items-center rounded-md p-2"
            >
              <div className="w-[36px] h-[36px] bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              <div className="ml-2 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
      )}
      {!_triggerBalanceUpdate && (
        <ul>
          {tokens.map((token) => (
            <li
              key={token.address}
              className="shadow-sm dark:shadow-none grid grid-cols-[auto_1fr] bg-neutral-200 items-center rounded-md bg-opacity-30 dark:bg-[#1B1B1B] p-2 hover:bg-opacity-80 dark:hover:bg-opacity-30 mb-2"
            >
              {_defaults["wMinima"][_network] === token.address ? (
                <img
                  alt="token-icon"
                  src="./assets/wtoken.svg"
                  className="w-[36px] h-[36px] rounded-full"
                />
              ) : _defaults["Tether"][_network] === token.address ? (
                <img
                  alt="token-icon"
                  src="./assets/tether.svg"
                  className="w-[36px] h-[36px] rounded-full"
                />
              ) : (
                <div className="my-auto w-[36px] h-[36px] bg-white rounded-full overflow-hidden flex justify-center items-center shadow-md text-black font-bold">
                  {token.name.substring(0, 1).toUpperCase()}
                </div>
              )}

              <div className="flex justify-between ml-2">
                <div className="flex-grow">
                  <h3 className="font-bold">{token.name}</h3>
                  <p className="font-mono text-sm">
                    {token.address ===
                      "0xb3BEe194535aBF4E8e2C0f0eE54a3eF3b176703C" &&
                      token.balance &&
                      formatUnits(token.balance, 18).toString()}
                    {token.address !==
                      "0xb3BEe194535aBF4E8e2C0f0eE54a3eF3b176703C" &&
                      token.balance &&
                      formatUnits(token.balance, token.decimals).toString()}
                  </p>
                </div>
                {_defaults["wMinima"][_network] === token.address && (
                  <div>
                    <p className="text-xs font-bold text-neutral-500 dark:text-neutral-700">
                      {_poolPrice && "$" + new Decimal(_poolPrice).toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TokenList;
