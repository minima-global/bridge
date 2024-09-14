import { useContext, useState } from "react";
import { useSpring, animated, config } from "react-spring";
import { appContext } from "../../AppContext";
import { Formik } from "formik";
import * as yup from "yup";

import EthereumNetwork from "../UI/EthereumNetwork";
import SepoliaNetwork from "../UI/SepoliaNetwork";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import BackIcon from "../UI/Icons/BackIcon";
import AnimatedDialog from "../UI/AnimatedDialog";
import Cross from "../UI/Cross";

const SelectNetwork = () => {
  const {
    addCustomNetwork,
    _currentNetwork,
    _defaultNetworks,
    _promptSelectNetwork,
    promptSelectNetwork,
    verifyRPCNetwork,
    updatePreferredNetwork,
  } = useContext(appContext);
  const { _network } = useWalletContext();

  const [step, setStep] = useState(1);

  const addCustomNetworkSpringProps = useSpring({
    opacity: step === 2 ? 1 : 0,
    config: config.gentle,
  });

  const handleNetworkChange = (networkName: string) => {
    updatePreferredNetwork(networkName);
  };

  return (
    <>
      <div
        className="my-4 hover:cursor-pointer grid grid-cols-[1fr_auto] bg-neutral-100 hover:bg-neutral-50 dark:bg-[#1B1B1B] dark:hover:bg-[#2C2C2C] dark:text-neutral-300 rounded-full w-max text-xs shadow-lg pr-2"
        // onClick={promptSelectNetwork}
      >
        {_network === "mainnet" && <EthereumNetwork />}
        {_network === "sepolia" && <SepoliaNetwork />}
        {_network.length === 0 && <p className="font-bold">Select Network</p>}
      </div>

      <AnimatedDialog
        display={_promptSelectNetwork}
        dismiss={() => null}
        up={2000}
      >
        <div className=" p-4 px-0 rounded mx-auto">
          {step === 1 && (
            <div>
              <div className="flex justify-between pr-4">
                <h1 className="text-lg md:text-xl px-4 mb-4">
                  Select a network
                </h1>
                <Cross dismiss={promptSelectNetwork} />
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
                      <span className="text-gray-600 font-bold text-xl">S</span>
                    </div>
                    Sepolia
                  </li>
                </ul>

                {_defaultNetworks && (
                  <>
                    <div className="grid grid-cols-[1fr_auto] items-center">
                      <h6 className="px-4 text-sm py-2">Custom networks</h6>
                      <a
                        className="mx-4 px-2 hover:bg-indigo-500 hover:text-indigo-200 hover:font-bold cursor-pointer text-sm rounded bg-none text-indigo-500 border border-indigo-500"
                        onClick={() => setStep(2)}
                      >
                        Add Network
                      </a>
                    </div>
                    {Object.keys(_defaultNetworks).filter(
                      (k) => k !== "mainnet" && k !== "sepolia",
                    ).length === 0 && (
                      <p className="text-sm px-4 text-gray-400">
                        No custom networks added yet
                      </p>
                    )}
                    <ul className="mb-4 max-h-32 overflow-y-auto">
                      {Object.keys(_defaultNetworks)
                        .filter((k) => k !== "mainnet" && k !== "sepolia")
                        .map((k) => (
                          <li
                            key={_defaultNetworks[k].chainId}
                            onClick={() =>
                              handleNetworkChange(_defaultNetworks[k].name)
                            }
                            className={`flex items-center gap-2 p-4 ${
                              _network === "unknown" &&
                              _currentNetwork === _defaultNetworks[k].name
                                ? "bg-indigo-400 text-white font-bold dark:bg-indigo-600"
                                : " hover:bg-violet-100 hover:text-black"
                            }`}
                          >
                            <div className="rounded-full w-8 h-8 bg-violet-300 flex justify-center items-center">
                              <span className="text-gray-600 font-bold text-xl">
                                {_defaultNetworks[k].name
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                            {_defaultNetworks[k].name}
                          </li>
                        ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}
          {step === 2 && (
            <animated.div style={addCustomNetworkSpringProps}>
              <div className="flex items-center mb-4 px-4">
                <span
                  className=" dark:text-neutral-600"
                  onClick={() => setStep(1)}
                >
                  <BackIcon fill="currentColor" />
                </span>
                <h3 className="px-4">Add a custom network</h3>
              </div>

              <div className="grid grid-cols-1">
                <Formik
                  validationSchema={yup.object().shape({
                    rpc: yup
                      .string()
                      .test(
                        "unique-rpc",
                        "This RPC already exists on the network",
                        function (value) {
                          const { path, createError } = this;
                          const networkWithRPC: any = Object.values(
                            _defaultNetworks,
                          ).find((network: any) => network.rpc === value);

                          if (networkWithRPC) {
                            const networkName = networkWithRPC.name;
                            return createError({
                              path,
                              message: `This RPC already exists on the network ${networkName}`,
                            });
                          }

                          return true;
                        },
                      ),
                  })}
                  initialValues={{
                    rpc: "",
                    name: "",
                    chainId: "",
                    symbol: "",
                  }}
                  onSubmit={async (
                    { rpc, name, chainId, symbol },
                    { setErrors },
                  ) => {
                    try {
                      // First we verify if node is online...
                      await verifyRPCNetwork(rpc);

                      // add new
                      await addCustomNetwork({
                        rpc,
                        name,
                        chainId,
                        symbol,
                      });
                      // Toast message that we added a new network would be nice...
                      setStep(1);
                    } catch (error) {
                      setErrors({
                        rpc: "Invalid JSON-RPC URL.  Could not establish connection.",
                      });
                      console.error(error);
                    }
                  }}
                >
                  {({ getFieldProps, errors, isValid, handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4 pt-4">
                        <div className="flex flex-col px-4">
                          <label
                            htmlFor="rpc"
                            className="px-4 text-sm pb-1 dark:text-neutral-500"
                          >
                            JSON-RPC API
                          </label>
                          <input
                            type="text"
                            required
                            id="rpc"
                            {...getFieldProps("rpc")}
                            placeholder="Custom JSON-RPC"
                            className="w-full p-4 rounded text-white dark:text-neutral-100 dark:placeholder:text-neutral-600 focus:outline-neutral-500 dark:focus:outline-neutral-800"
                          />
                        </div>
                        {errors.rpc && (
                          <div className="px-6">
                            <p className="text-black text-sm dark:text-neutral-800">
                              {errors.rpc}
                            </p>
                          </div>
                        )}
                        <div className="flex flex-col px-4">
                          <label
                            htmlFor="name"
                            className="px-4 text-sm pb-1 dark:text-neutral-500"
                          >
                            Network Name
                          </label>
                          <input
                            required
                            type="number"
                            id="decimals"
                            {...getFieldProps("name")}
                            placeholder="Token Decimals"
                            className="w-full p-4 rounded text-white dark:text-neutral-100 dark:placeholder:text-neutral-600 focus:outline-neutral-500 dark:focus:outline-neutral-800 disabled:opacity-80"
                          />
                        </div>
                        {errors.name && (
                          <div className="px-6">
                            <p className="text-black text-sm dark:text-neutral-800">
                              {errors.name}
                            </p>
                          </div>
                        )}
                        <div className="flex flex-col px-4">
                          <label
                            htmlFor="name"
                            className="px-4 text-sm pb-1 dark:text-neutral-500"
                          >
                            Chain ID
                          </label>
                          <input
                            required
                            type="text"
                            id="chainId"
                            {...getFieldProps("chainId")}
                            placeholder="Chain ID"
                            className="w-full p-4 rounded text-white dark:text-neutral-100 dark:placeholder:text-neutral-600 focus:outline-neutral-500 dark:focus:outline-neutral-800 disabled:opacity-80"
                          />
                        </div>
                        {errors.chainId && (
                          <div className="px-6">
                            <p className="text-black text-sm dark:text-neutral-800">
                              {errors.chainId}
                            </p>
                          </div>
                        )}
                        <div className="flex flex-col px-4">
                          <label
                            htmlFor="name"
                            className="px-4 text-sm pb-1 dark:text-neutral-500"
                          >
                            Token Symbol
                          </label>
                          <input
                            required
                            type="text"
                            id="symbol"
                            {...getFieldProps("symbol")}
                            placeholder="Token Symbol"
                            className="w-full p-4 rounded text-white dark:text-neutral-100 dark:placeholder:text-neutral-600 focus:outline-neutral-500 dark:focus:outline-neutral-800 disabled:opacity-80"
                          />
                        </div>
                        {errors.symbol && (
                          <div className="px-6">
                            <p className="text-black text-sm dark:text-neutral-800">
                              {errors.symbol}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mx-4 mt-8">
                        <button
                          disabled={!isValid}
                          type="submit"
                          className="w-full full-rounded border border-neutral-200 hover:border-neutral-500 bg-transparent dark:text-neutral-100 dark:border-neutral-500 hover:dark:border-neutral-400 font-bold disabled:opacity-30"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  )}
                </Formik>
              </div>
            </animated.div>
          )}
        </div>
      </AnimatedDialog>
    </>
  );
};

export default SelectNetwork;
