import { useContext } from "react";
import { useSpring, animated, config } from "react-spring";
import { createPortal } from "react-dom";
import { appContext } from "../../AppContext";

import Dialog from "../UI/Dialog";
import EthereumNetwork from "../UI/EthereumNetwork";
import SepoliaNetwork from "../UI/SepoliaNetwork";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";

const SelectNetwork = () => {
  const { _promptSelectNetwork, promptSelectNetwork, updatePreferredNetwork } =
    useContext(appContext);
  const { _network } = useWalletContext();

  const springProps = useSpring({
    opacity: _promptSelectNetwork ? 1 : 0,
    transform: _promptSelectNetwork
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.wobbly,
  });

  const handleNetworkChange = (networkName: string) => {
    updatePreferredNetwork(networkName);
  };

  return (
    <>
      <div
        className="my-4 p-2 px-3 hover:cursor-pointer bg-gray-50 bg-opacity-80 dark:bg-[#1B1B1B] hover:bg-opacity-30 dark:bg-opacity-50 grid grid-cols-[1fr_auto]"
        onClick={promptSelectNetwork}
      >
        {_network === "mainnet" && <EthereumNetwork />}
        {_network === "sepolia" && <SepoliaNetwork />}
        {_network.length === 0 && <p className="font-bold">Select Network</p>}
      </div>

      {_promptSelectNetwork &&
        createPortal(
          <Dialog extraClass="z-[22] max-w-sm mx-auto" dismiss={promptSelectNetwork}>
            <div onClick={(e) => e.stopPropagation() } className="h-full grid items-center">
              <animated.div style={springProps}>
                <div className="bg-white shadow-lg  shadow-slate-300 dark:shadow-none dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 mt-20 rounded mx-auto">
                  <div>
                    <div className="flex justify-between pr-4">
                      <h1 className="text-lg md:text-xl px-4 mb-4">
                        Select a network
                      </h1>
                      <svg
                        onClick={promptSelectNetwork}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M18 6l-12 12" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="grid grid-cols-1">
                      <ul>
                        <li
                          key="1"
                          onClick={() => handleNetworkChange("mainnet")}
                          className={`flex items-center gap-2 p-4 ${
                            _network === "mainnet"
                              ? " bg-indigo-400 text-white font-bold dark:bg-indigo-600 "
                              : " hover:bg-violet-100 hover:text-black"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="33"
                          >
                            <g fill="none" fillRule="evenodd">
                              <circle cx="16" cy="16" r="16" fill="#627EEA" />
                              <g fill="#FFF" fillRule="nonzero">
                                <path
                                  fillOpacity=".602"
                                  d="M16.498 4v8.87l7.497 3.35z"
                                />
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
                          Ethereum Mainnet
                        </li>
                      </ul>
                      <h6 className="px-4 text-sm py-2">Test networks</h6>
                      <ul className="mb-4">
                        <li
                          key="11155111"
                          onClick={() => handleNetworkChange("sepolia")}
                          className={`flex items-center gap-2  p-4 ${
                            _network === "sepolia"
                              ? "bg-indigo-400 text-white font-bold dark:bg-indigo-600"
                              : " hover:bg-violet-100 hover:text-black"
                          }`}
                        >
                          <div className="rounded-full w-8 h-8 bg-violet-300 flex justify-center items-center">
                            <span className="text-gray-600 font-bold text-xl">
                              S
                            </span>
                          </div>
                          Sepolia
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </animated.div>
            </div>
          </Dialog>,
          document.body
        )}
    </>
  );
};

export default SelectNetwork;
