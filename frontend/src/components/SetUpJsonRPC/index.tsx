import { useContext, useEffect, useState } from "react";
import { appContext } from "../../AppContext";
import { JsonRpcProvider } from "ethers";
import { config, useSpring, animated } from "react-spring";

const SetUpJsonRPC = () => {
  const {
    loaded,
    _promptSettings,
    promptJsonRpcSetup,
    _promptJsonRpcSetup,
    updateApiKeys,
    userKeys,
  } = useContext(appContext);
  const [checkboxes, setCheckboxes] = useState({
    ethereum: false,
    sepolia: false,
    expansion: false,
    save: false,
  });

  const [error, setError] = useState<false | string>(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState<{
    api: null | boolean;
    secret: null | boolean;
    ethereum: null | boolean;
    sepolia: null | boolean;
    expansion: null | boolean;
  }>({
    api: null,
    secret: null,
    ethereum: null,
    sepolia: null,
    expansion: null,
  });
  const SETUPSTATE = {
    INTRO: 0,
    FORM: 1,
    CHECK: 2,
    DONE: 3,
    RETRY: 4,
  };
  const [step, setStep] = useState(SETUPSTATE["INTRO"]);

  const [apiKey, setApiKey] = useState("");
  const [apiKeySecret, setApiKeySecret] = useState("");

  const springProps = useSpring({
    opacity: _promptJsonRpcSetup ? 1 : 0,
    config: config.default,
  });

  useEffect(() => {
    (async () => {
      if (loaded && loaded.current && userKeys !== null) {
        setApiKey(userKeys.apiKey);
        setApiKeySecret(userKeys.apiKeySecret);
      }
    })();
  }, [loaded, userKeys]);

  const handleCheckboxChange = (event) => {
    const { id, checked } = event.target;
    setCheckboxes((prevState) => ({
      ...prevState,
      [id]: checked,
    }));
  };

  const handleApiKeyChange = (event) => {
    const { value } = event.target;

    setApiKey(value);
  };
  const handleApiKeySecretChange = (event) => {
    const { value } = event.target;

    setApiKeySecret(value);
  };

  const handleValidateForm = async () => {
    setError(false);
    setLoading(true);
    /** We create a base64 encoded token for authorisation header */
    const preAuth = btoa(apiKey + ":" + apiKeySecret);
    const mainnet = `https://mainnet.infura.io/v3/${apiKey}`;
    const sepolia = `https://sepolia.infura.io/v3/${apiKey}`;
    const gasApi = `https://gas.api.infura.io/networks/1/suggestedGasFees`;

    try {
      const mainnetProvider = new JsonRpcProvider(mainnet);
      const sepoliaProvider = new JsonRpcProvider(sepolia);

      // Await for both providers to get block numbers
      await Promise.all([
        mainnetProvider.getBlockNumber(),
        sepoliaProvider.getBlockNumber(),
      ]);

      setChecking((prevState) => ({
        ...prevState,
        api: true,
        ethereum: true,
        sepolia: true,
      }));

      // Make a call to gasApi
      const gasPromise = new Promise((resolve, reject) => {
        (window as any).MDS.net.GETAUTH(gasApi, preAuth, (resp) => {
          if (!resp.status) {
            reject("Gas API failed...");
          }

          try {
            JSON.parse(resp.response);
            setChecking((prevState) => ({
              ...prevState,
              expansion: true,
              secret: true,
            }));
            resolve(true);
          } catch (error) {
            reject("Gas API failed");
          }
        });
      });

      await gasPromise;
      await updateApiKeys(apiKey, apiKeySecret);

      return true;
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong...");
      }
    } finally {
      setLoading(false);
    }
  };

  const allFormValid = Object.values(checking).every(
    (c) => typeof c === "boolean" && c
  );

  if (!_promptJsonRpcSetup) {
    return null;
  }

  return (
    <animated.div style={springProps} className="bg-gray-200 dark:bg-black fixed left-0 right-0 bottom-0 top-0 z-[20000] overflow-y-scroll">
      {step === SETUPSTATE["INTRO"] && (
        <div className={`px-4 grid grid-rows-[56px_1fr_86px] h-full md:h-max`}>
          <header className="grid grid-cols-[1fr_minmax(0,_560px)_1fr]">
            <div />
            {_promptSettings && (
              <div className="pt-4">
                <div className="flex gap-1 items-center justify-between pb-2">
                  <h6 className="font-bold text-xl">Setup API Keys</h6>

                  <svg
                    onClick={promptJsonRpcSetup}
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
                <div className="border-t border-gray-300"></div>
              </div>
            )}
            <div />
          </header>
          <main className="grid grid-cols-[1fr_minmax(0,_560px)_1fr]">
            <div />
            <section className="text-left">
              <h1 className="text-2xl font-bold dark:text-orange-300">
                Hello, let's get started
              </h1>
              <p className="mt-2">
                {" "}
                In order to maintain decentralization, we've opted not to be a
                third party between you and the Ethereum network. Instead, to
                use this application, you will need to set up your own
                Ethereum RPC API key, which you can obtain for free.
              </p>
              <p className="my-2">
                {" "}
                This setup process will only be required <b>once</b> and should
                take approximately <b>5 minutes</b>.
              </p>
              <h2 className="text-xl font-bold mt-3 dark:text-orange-300">
                Create an API Key
              </h2>
              <p className="my-2">
                {" "}
                We will use Infura to get this API Key for you, please register
                for the free account with{" "}
                <a
                  onClick={(e) => {
                    if (window.navigator.userAgent.includes("Minima Browser")) {
                      e.preventDefault();
                      // @ts-ignore
                      Android.openExternalBrowser(
                        "https://app.infura.io/register",
                        "_blank"
                      );
                    }
                  }}
                  target="_blank"
                  href="https://app.infura.io/register"
                >
                  Infura
                </a>{" "}
                and an API Key will be automatically generated for you. Click
                continue after you're done.
              </p>
            </section>
            <div />
          </main>
          <footer className="grid grid-cols-[1fr_minmax(0,_560px)_1fr]">
            <div />
            <nav className="flex justify-end items-center flex-col">
              <button
                onClick={() => setStep(SETUPSTATE["FORM"])}
                className="py-4 hover:bg-opacity-90 bg-teal-300 text-black text-lg w-full font-bold my-2"
              >
                Continue
              </button>
            </nav>
            <div />
          </footer>
        </div>
      )}
      {step === SETUPSTATE["FORM"] && (
        <div className="px-4 grid grid-rows-[56px_1fr_86px] h-full md:h-max">
          <header />
          <main className="grid grid-cols-[1fr_minmax(0,_560px)_1fr]">
            <div />
            <section className="text-left">
              <h1 className="text-2xl font-bold dark:text-orange-300">
                Almost done...
              </h1>
              <p className="mt-2">
                {" "}
                Now that you have your own API Key, we just need to configure 3
                options. Once logged into Infura, click on the name of your API
                Key, it should be called <b>My First Key</b>.
              </p>
              <h2 className="text-xl font-bold mt-3 dark:text-orange-300">
                You will need:
              </h2>
              <p className="my-2 font-bold">To paste your API Key below...</p>
              <input
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="e.g. 05c98...ff361c"
                className="w-full p-2 rounded-lg text-2xl truncate bg-gray-100 dark:bg-gray-800 font-mono focus:border-none focus:outline-none dark:placeholder:text-teal-300 font-bold"
              />
              <p className="my-2 font-bold">
                To paste your secret API Key below...
              </p>
              <input
                value={apiKeySecret}
                onChange={handleApiKeySecretChange}
                placeholder="e.g. vcGUP0+u....1rNeLT4qg"
                className="w-full p-2 rounded-lg text-2xl truncate bg-gray-100 dark:bg-gray-800 font-mono focus:border-none focus:outline-none dark:placeholder:text-teal-300 font-bold"
              />
              <p className="mt-2 text-[13px] font-bold dark:text-green-400">
                You can find this in your API Settings where you can click to
                reveal your secret.
              </p>
              <ul className="list-none p-0 m-0 space-y-2 my-4 mt-1">
                <li>
                  <p className="font-bold">
                    In the All Endpoints section, enable 3 endpoints:
                  </p>
                </li>
                <li className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ethereum"
                    checked={checkboxes.ethereum}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 accent-teal-300"
                  />
                  <label htmlFor="ethereumCheckbox">
                    I have enabled the Ethereum MAINNET endpoint
                  </label>
                </li>
                <li className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sepolia"
                    checked={checkboxes.sepolia}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 accent-teal-300"
                  />
                  <label htmlFor="ethereumCheckbox">
                    I have enabled the Ethereum SEPOLIA endpoint
                  </label>
                </li>
                <li className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="expansion"
                    checked={checkboxes.expansion}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 accent-teal-300"
                  />
                  <label htmlFor="expansionCheckbox">
                    I have enabled the Gas API endpoint in the Expansion section
                  </label>
                </li>
                <li className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="save"
                    checked={checkboxes.save}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 accent-teal-300"
                  />
                  <label htmlFor="saveCheckbox">
                    I have clicked SAVE CHANGES
                  </label>
                </li>
              </ul>
              <p>
                Once you have ticked all the right checkboxes you need to make
                sure you <b>save changes</b> and you are all set.
              </p>
            </section>
            <div />
          </main>
          <footer className="grid grid-cols-[1fr_minmax(0,_560px)_1fr]">
            <div />
            <nav className="flex justify-end items-center">
              <button
                disabled={
                  !apiKey.length ||
                  !apiKeySecret.length ||
                  !checkboxes.ethereum ||
                  !checkboxes.sepolia ||
                  !checkboxes.save ||
                  !checkboxes.expansion
                }
                onClick={() => {
                  setStep(SETUPSTATE["CHECK"]);
                  handleValidateForm();
                }}
                className="py-4 hover:bg-opacity-90 disabled:bg-gray-800 disabled:text-gray-600 bg-teal-300 text-black text-lg w-full font-bold my-2"
              >
                Final Step
              </button>
            </nav>
            <div />
          </footer>
        </div>
      )}
      {step === SETUPSTATE["CHECK"] && (
        <div className="px-4 grid grid-rows-[56px_1fr_86px] h-full md:h-max">
          <header />
          <main className="grid grid-cols-[1fr_minmax(0,_560px)_1fr]">
            <div />
            <section className="text-left">
              {!error && loading && (
                <div>
                  <div className="flex gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="26"
                      height="32"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-spin"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M12 3a9 9 0 1 0 9 9" />
                    </svg>
                    <h1 className="text-2xl font-bold dark:text-orange-300">
                      Checking your API...
                    </h1>
                  </div>

                  <p className="mt-2 mb-4">
                    {" "}
                    Please be patient as we check all your configurations are
                    correct.
                  </p>
                </div>
              )}
              {error && !loading && (
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-bold dark:text-orange-300">
                    You missed something...
                  </h1>
                  <p className="mt-2 mb-4">
                    {" "}
                    You may have missed a configuration, double check and try
                    again.
                  </p>
                </div>
              )}
              {!error && allFormValid && (
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-bold dark:text-orange-300">
                    All set!
                  </h1>
                  <p className="mt-2 mb-4"> You are ready to play.</p>
                </div>
              )}

              <input
                readOnly
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="e.g. 05c98...ff361c"
                className={` w-full p-2 rounded-lg text-2xl truncate bg-gray-100 dark:bg-gray-800 font-mono focus:border-none focus:outline-none dark:placeholder:text-teal-300 font-bold ${
                  checking.api
                    ? "!bg-teal-300 !text-teal-800"
                    : "!bg-red-300 !text-red-800"
                }`}
              />

              <input
                readOnly
                value={apiKeySecret}
                onChange={handleApiKeyChange}
                placeholder="e.g. 05c98...ff361c"
                className={`mt-4 w-full p-2 rounded-lg text-2xl truncate bg-gray-100 dark:bg-gray-800 font-mono focus:border-none focus:outline-none dark:placeholder:text-teal-300 font-bold ${
                  checking.secret
                    ? "!bg-teal-300 !text-teal-800"
                    : "!bg-red-300 !text-red-800"
                }`}
              />
              <ul className="list-none p-0 m-0 space-y-2 my-4">
                <li>
                  <p>Then enable these configurations:</p>
                </li>
                <li className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ethereum"
                    checked={!!checking.ethereum}
                    readOnly
                    className={`form-checkbox h-5 w-5 accent-teal-300`}
                  />
                  <label
                    htmlFor="ethereumCheckbox"
                    className={`${
                      checking.ethereum
                        ? "dark:!text-teal-300"
                        : "!text-red-300"
                    }`}
                  >
                    I have enabled the Ethereum MAINNET endpoint
                  </label>
                </li>
                <li className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sepolia"
                    readOnly
                    checked={!!checking.sepolia}
                    className="form-checkbox h-5 w-5 accent-teal-300"
                  />
                  <label
                    htmlFor="ethereumCheckbox"
                    className={`${
                      checking.sepolia ? "dark:!text-teal-300" : "!text-red-300"
                    }`}
                  >
                    I have enabled the Ethereum SEPOLIA endpoint
                  </label>
                </li>
                <li className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="expansion"
                    readOnly
                    checked={!!checking.expansion}
                    className="form-checkbox h-5 w-5 accent-teal-300"
                  />
                  <label
                    htmlFor="expansionCheckbox"
                    className={`${
                      checking.expansion
                        ? "dark:!text-teal-300"
                        : "!text-red-300"
                    }`}
                  >
                    I have enabled the Gas API endpoint in the Expansion section
                  </label>
                </li>
              </ul>
            </section>
            <div />
          </main>
          <footer className="grid grid-cols-[1fr_minmax(0,_560px)_1fr]">
            <div />
            <nav className="flex justify-end items-center">
              {!error && !loading && (
                <button
                  disabled={
                    !checkboxes.ethereum ||
                    !checkboxes.sepolia ||
                    !checkboxes.expansion
                  }
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="py-4 hover:bg-opacity-90 disabled:bg-gray-800 disabled:text-gray-600 bg-teal-300 text-black text-lg w-full font-bold my-2"
                >
                  Done
                </button>
              )}
              {error && !loading && (
                <button
                  onClick={() => {
                    setStep(SETUPSTATE["FORM"]);
                  }}
                  className="py-4 hover:bg-opacity-90 disabled:bg-gray-800 disabled:text-gray-600 bg-orange-300 text-black text-lg w-full font-bold my-2"
                >
                  Try again
                </button>
              )}
            </nav>
            <div />
          </footer>
        </div>
      )}
    </animated.div>
  );
};

export default SetUpJsonRPC;
