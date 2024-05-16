import { useFormikContext } from "formik";
import { useContext, useEffect, useRef, useState } from "react";
import { useSpring, animated, config } from "react-spring";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { useTokenStoreContext } from "../../providers/TokenStoreProvider";
import { Asset } from "../../types/Asset";
import { formatUnits } from "ethers";
import defaultAssetsStored, { _defaults } from "../../constants";
import { appContext } from "../../AppContext";

const SelectAsset = () => {
  const formik: any = useFormikContext();
  const [active, setActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { tokens } = useTokenStoreContext();
  const { _balance, _network } = useWalletContext();

  const { _currentNetwork, _defaultNetworks } = useContext(appContext);

  const Ethereum = defaultAssetsStored[0];

  const springProps = useSpring({
    opacity: active ? 1 : 0,
    transform: active ? "translateY(0%)" : "translateY(-50%)",
    config: config.stiff,
  });

  const handleButtonClick = () => {
    setActive((prevState) => !prevState);
  };

  const handleSelect = (asset: Asset) => {
    formik.setFieldValue("asset", asset);
    setActive(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block w-full">
      <button
        type="button"
        id="options-menu"
        aria-haspopup="true"
        aria-expanded="true"
        onClick={handleButtonClick}
        className="mt-4 border-2 border-[#464C4F] items-center grid gap-2 grid-cols-[auto_1fr_auto] break-all p-4 rounded-full hover:!border-teal-500 hover:border-4 w-full hover:outline-none"
      >
        {formik.values.asset.type === "ether" && (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <g fill="none" fillRule="evenodd">
              <circle cx="16" cy="16" r="16" fill="#627EEA" />
              <g fill="#FFF" fillRule="nonzero">
                <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
                <path d="M16.498 4L9 16.22l7.498-3.35z" />
                <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z" />
                <path d="M16.498 27.995v-6.028L9 17.616z" />
                <path
                  fillOpacity=".2"
                  d="M16.498 20.573l7.497-4.353-7.497-3.348z"
                />
                <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z" />
              </g>
            </g>
          </svg>
        )}
        {formik.values.asset.type === "erc20" &&
          (_defaults["wMinima"][_network] === formik.values.asset.address ? (
            <img
              alt="token-icon"
              src="./assets/wtoken.svg"
              className="w-[36px] h-[36px] rounded-full"
            />
          ) : _defaults["Tether"][_network] === formik.values.asset.address ? (
            <img
              alt="token-icon"
              src="./assets/tether.svg"
              className="w-[36px] h-[36px] rounded-full"
            />
          ) : (
            <div className="my-auto w-[36px] h-[36px] bg-white rounded-full overflow-hidden flex justify-center items-center shadow-md text-black font-bold">
              {formik.values.asset.name.substring(0, 1).toUpperCase()}
            </div>
          ))}
        <div className="flex flex-col text-left">
          <h6 className="m-0 p-0 font-bold text-black dark:text-white">
            {formik.values.asset.name}
          </h6>
          <p className="m-0 p-0 text-sm font-mono text-black dark:text-white">
          {formik.values.asset.type === 'erc20' && formatUnits(formik.values.asset.balance, formik.values.asset.decimals)}
          {formik.values.asset.type !== 'erc20' && formik.values.asset.balance}
          </p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M18 9c.852 0 1.297 .986 .783 1.623l-.076 .084l-6 6a1 1 0 0 1 -1.32 .083l-.094 -.083l-6 -6l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057v-.118l.005 -.058l.009 -.06l.01 -.052l.032 -.108l.027 -.067l.07 -.132l.065 -.09l.073 -.081l.094 -.083l.077 -.054l.096 -.054l.036 -.017l.067 -.027l.108 -.032l.053 -.01l.06 -.01l.057 -.004l12.059 -.002z"
            strokeWidth="0"
            fill="currentColor"
          />
        </svg>
      </button>

      {active && (
        <animated.div
          style={springProps}
          className="origin-top-right z-[50] w-full absolute right-0 mt-2 rounded-md shadow-lg bg-black dark:bg-white"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <ul>
            {tokens.map((token) => (
              <li
                key={token.address}
                onClick={() => handleSelect(token)}
                className="p-4 grid grid-cols-[auto_1fr] gap-2 items-center break-all hover:bg-white hover:bg-opacity-10 dark:hover:bg-opacity-10 dark:hover:bg-teal-300"
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
                <div>
                  <h6 className="m-0 p-0 font-bold text-white dark:text-black">
                    {token.name}
                  </h6>
                  <p className="m-0 p-0 text-sm opacity-80 font-mono text-white dark:text-black">
                    {formatUnits(token.balance, token.decimals)}
                  </p>
                </div>
              </li>
            ))}
            <li
              onClick={() => handleSelect({ ...Ethereum, balance: _balance, name: _defaultNetworks[_currentNetwork].name, symbol: _defaultNetworks[_currentNetwork].symbol })}
              className="p-4 grid grid-cols-[auto_1fr] gap-2 items-center break-all hover:bg-white  hover:bg-opacity-10 dark:hover:bg-opacity-10 dark:hover:bg-teal-300"
            >
              <div className="my-auto w-[36px] h-[36px] bg-white rounded-full overflow-hidden flex justify-center items-center shadow-md text-black font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                  <g fill="none" fillRule="evenodd">
                    <circle cx="16" cy="16" r="16" fill="#627EEA" />
                    <g fill="#FFF" fillRule="nonzero">
                      <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
                      <path d="M16.498 4L9 16.22l7.498-3.35z" />
                      <path
                        fillOpacity=".602"
                        d="M16.498 21.968v6.027L24 17.616z"
                      />
                      <path d="M16.498 27.995v-6.028L9 17.616z" />
                      <path
                        fillOpacity=".2"
                        d="M16.498 20.573l7.497-4.353-7.497-3.348z"
                      />
                      <path
                        fillOpacity=".602"
                        d="M9 16.22l7.498 4.353v-7.701z"
                      />
                    </g>
                  </g>
                </svg>
              </div>
              <div>
                <h6 className="m-0 p-0 font-bold text-white dark:text-black">
                  {_defaultNetworks[_currentNetwork].name}
                </h6>
                <p className="m-0 p-0 text-sm opacity-80 font-mono text-white dark:text-black">
                  {_balance}
                </p>
              </div>
            </li>
          </ul>
        </animated.div>
      )}
    </div>
  );
};

export default SelectAsset;
