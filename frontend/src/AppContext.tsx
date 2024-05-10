import { createContext, useRef, useEffect, useState } from "react";
import { JsonRpcProvider } from "ethers";
import { Networks } from "./types/Network.js";
import { sql } from "./utils/SQL/index.js";
import { Asset } from "./types/Asset.js";
import defaultAssetsStored, { _defaults } from "./constants/index.js";
import { CoinStats } from "./types/MinimaBalance.js";
import { toast } from "react-toastify";

import { initBridgeSystemsStartup } from "../../dapp/js/auth.js";
import { setInfuraApiKeys, getInfuraGASAPI } from "../../dapp/js/ethutil.js";
import { sendBackendMSG } from "../../dapp/js/jslib.js";
import { setNetwork } from "../../dapp/js/htlcvars.js";
import { OTCDeal } from "./types/OTCDeal.js";
import { Favorite } from "./types/Favorite.js";
import { getFavourites } from "../../dapp/js/sql.js";

export var USER_DETAILS;
export const appContext = createContext({} as any);

interface IProps {
  children: any;
}
const AppProvider = ({ children }: IProps) => {
  const loaded = useRef(false);

  // Loading App
  const [isWorking, setWorking] = useState(false);
  // App's navigation
  const [_currentNavigation, setCurrentNavigation] = useState("balance");
  // Trading Method Navigation
  const [_currentTradeWindow, setCurrentTradeWindow] = useState<
    "otc" | "orderbook" | null
  >(null);
  // current Minima block height
  const [_currentBlock, setCurrentBlock] = useState<null | string>(null);
  // Accept OTC dialog
  const [_promptAcceptOTC, setPromptAcceptOTC] = useState<null | OTCDeal>(null);
  // Deposit Modal
  const [_promptDeposit, setPromptDeposit] = useState(false);
  // Withdraw Modal
  const [_promptWithdraw, setPromptWithdraw] = useState(false);
  // Withdraw Modal
  const [_promptAllowance, setPromptAllowance] = useState(false);
  // Is App in Read or Write Mode
  const [_promptReadMode, setReadMode] = useState<null | boolean>(null);
  // Set up API Keys
  const [_promptJsonRpcSetup, setPromptJsonRpcSetup] = useState<null | boolean>(
    false
  );
  // Set up API Keys
  const [_promptFavorites, setPromptFavorites] = useState(
    false
  );
  // Select Network
  const [_promptSelectNetwork, setSelectNetwork] = useState(false);
  // Settings
  const [_promptSettings, setPromptSettings] = useState(false);
  // Settings
  const [_promptLogs, setPromptLogs] = useState(false);

  // Current Network
  const [_currentNetwork, setCurrentNetwork] = useState("mainnet");
  // Default ERC 20 Assets
  const [_defaultAssets, setDefaultAssets] = useState<{ assets: Asset[] }>({
    assets: [],
  });
  // Default ERC 20 Assets
  const [_defaultNetworks, setDefaultNetworks] = useState<Networks | null>(
    null
  );
  // Generated Key by MDS seedrandom generator
  const [_generatedKey, setGeneratedKey] = useState("");
  // JSON RPC Network Provider
  const [_provider, setProvider] = useState<JsonRpcProvider | null>(null);
  // User's Infura API Keys
  const [_userKeys, setUserKeys] = useState<{
    apiKey: string;
    apiKeySecret: string;
  } | null>(null);
  // User Details Sync with Backend
  const [_userDetails, setUserDetails] = useState<any>(null);
  // Native Minima Balance
  const [_minimaBalance, setMinimaBalance] = useState<null | CoinStats>(null);
  // User Favorite Traders
  const [_favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    (async () => {
      // if MDS inited then we can run our init SQL/re-sql on network change
      if (loaded && loaded.current && _provider) {
        setWorking(true);
        setDefaultAssets({ assets: [] });

        // We get the current provider
        const currentNetwork = await _provider.getNetwork();
        // Fetch assets according to the default network (different network, different assets)
        const defaultAssets: any = await sql(
          `SELECT * FROM cache WHERE name = 'DEFAULTASSETS_${currentNetwork.chainId}'`
        );

        // if exists, set them in memory
        if (defaultAssets) {
          setDefaultAssets(JSON.parse(defaultAssets.DATA));
        } else {
          // let's initialize the default assets
          const _d = defaultAssetsStored
            .filter((asset) => {
              // Check if _defaults has the network for the current asset
              const networkExists =
                _defaults[asset.name] &&
                _defaults[asset.name][currentNetwork.name];

              // Return true if the network exists, false otherwise
              return networkExists;
            })
            .map((asset) => ({
              ...asset,
              address: _defaults[asset.name]
                ? _defaults[asset.name][currentNetwork.name]
                : "",
            }));

          await sql(
            `INSERT INTO cache (name, data) VALUES ('DEFAULTASSETS_${
              currentNetwork.chainId
            }', '${JSON.stringify({ assets: _d })}')`
          );
          setDefaultAssets({ assets: _d });
        }
        setWorking(false);
      }
    })();
  }, [_provider, loaded]);

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      (window as any).MDS.init((msg: any) => {
        console.log(msg);
        //Do initialisation
        if (msg.event == "inited") {
          // Check if read or write mode
          (window as any).MDS.cmd(`checkmode`, function (response: any) {
            if (response.status) {
              // If in write mode, generate & set key
              if (response.response.mode === "WRITE") {
                initBridgeSystemsStartup(function (userdets) {
                  console.log(userdets);
                  // @ts-ignore
                  window.USER_DETAILS = userdets;
                  Object.freeze(USER_DETAILS);
                  setUserDetails(userdets);

                  const { mxaddress } = userdets.minimaaddress;
                  (window as any).MDS.cmd(
                    `balance tokenid:0x00 address:${mxaddress}`,
                    (resp: any) => {
                      if (resp.status) {
                        const { confirmed, unconfirmed, coins } =
                          resp.response[0];

                        // Use Minima Maths to calculate total of confirmed + unconfirmed
                        const add =
                          'runscript script:"LET total=' +
                          confirmed +
                          "+" +
                          unconfirmed +
                          ' LET roundedtotal=FLOOR(total)"';

                        (window as any).MDS.cmd(add, function (respo) {
                          const total = respo.response.variables.roundedtotal;
                          setMinimaBalance({
                            confirmed,
                            unconfirmed,
                            total,
                            coins,
                          });
                        });
                      }
                    }
                  );
                });

                // Generate key for Eth Wallet
                (window as any).MDS.cmd(
                  "seedrandom modifier:ethbridge",
                  (resp) => {
                    setGeneratedKey(resp.response.seedrandom);
                  }
                );
              }

              return setReadMode(response.response.mode === "READ");
            }

            return setReadMode(false);
          });

          (async () => {
            setWorking(true);
            // Initialize cache-ing table
            await sql(
              `CREATE TABLE IF NOT EXISTS cache (name varchar(255), data longtext);`
            );

            // Now we check if user has previously chosen a network, if not connect Sepolia
            const cachedNetwork: any = await sql(
              `SELECT * FROM cache WHERE name = 'CURRENT_NETWORK'`
            );
            // Fetch all saved networks
            const defaultNetworks: any = await sql(
              `SELECT * FROM cache WHERE name = 'DEFAULTNETWORKS'`
            );

            const cachedApiKeys: any = await sql(
              `SELECT * FROM cache WHERE name = 'API_KEYS'`
            );

            // USER PREFERENCES
            if (cachedApiKeys) {
              console.log("Keys are cached", JSON.parse(cachedApiKeys.DATA));
              setUserKeys(JSON.parse(cachedApiKeys.DATA));

              // DEFAULT NETWORK
              if (cachedNetwork) {
                const previouslySetNetwork = JSON.parse(cachedNetwork.DATA);
                setRPCNetwork(
                  previouslySetNetwork.default,
                  {
                    mainnet: {
                      name: "Ethereum",
                      rpc: "https://mainnet.infura.io/v3/",
                      chainId: "1",
                      symbol: "ETH",
                    },
                    sepolia: {
                      name: "SepoliaETH",
                      rpc: "https://sepolia.infura.io/v3/",
                      chainId: "11155111",
                      symbol: "SepoliaETH",
                    },
                  },
                  JSON.parse(cachedApiKeys.DATA)
                );
              } else {
                // initialize it..
                const initializeFirstNetwork = {
                  default: "sepolia",
                };
                await sql(
                  `INSERT INTO cache (name, data) VALUES ('CURRENT_NETWORK', '${JSON.stringify(
                    initializeFirstNetwork
                  )}')`
                );
                setRPCNetwork(
                  initializeFirstNetwork.default,
                  {
                    mainnet: {
                      name: "Ethereum",
                      rpc: "https://mainnet.infura.io/v3/",
                      chainId: "1",
                      symbol: "ETH",
                    },
                    sepolia: {
                      name: "SepoliaETH",
                      rpc: "https://sepolia.infura.io/v3/",
                      chainId: "11155111",
                      symbol: "SepoliaETH",
                    },
                  },
                  JSON.parse(cachedApiKeys.DATA)
                );
              }
            } else {
              console.log("Keys are not cached, prompt set up");
              // No default api keys.. let's set up
              promptJsonRpcSetup();
            }

            if (defaultNetworks) {
              // set all networks saved
              setDefaultNetworks(JSON.parse(defaultNetworks.DATA));
            } else {
              // Initialize networks
              await sql(
                `INSERT INTO cache (name, data) VALUES ('DEFAULTNETWORKS', '${JSON.stringify(
                  {
                    mainnet: {
                      name: "Ethereum",
                      rpc: "https://mainnet.infura.io/v3/",
                      chainId: "1",
                      symbol: "ETH",
                    },
                    sepolia: {
                      name: "SepoliaETH",
                      rpc: "https://sepolia.infura.io/v3/",
                      chainId: "11155111",
                      symbol: "SepoliaETH",
                    },
                  }
                )}')`
              );
              setDefaultNetworks({
                mainnet: {
                  name: "Ethereum",
                  rpc: "https://mainnet.infura.io/v3/",
                  chainId: "1",
                  symbol: "ETH",
                },
                sepolia: {
                  name: "SepoliaETH",
                  rpc: "https://sepolia.infura.io/v3/",
                  chainId: "11155111",
                  symbol: "SepoliaETH",
                },
              });
            }

            setWorking(false);
          })();

          //Messages from back end
        } else if (msg.event == "MDSCOMMS") {
          //Make sure is a private message
          if (!msg.data.public) {
            var comms = JSON.parse(msg.data.message);
            if (comms.action == "FRONTENDMSG") {
              console.log(comms);
              //Show the message
              globalNotify(JSON.stringify(comms));

              // alert(JSON.stringify(comms, null, 2));
            }
          }
        }

        if (msg.event === "NEWBLOCK") {
          (window as any).MDS.cmd("block", (resp) => {
            setCurrentBlock(resp.response.block);
          });
        }
      });
    }
  }, [loaded]);

  const setRPCNetwork = (
    network: string,
    networks: Networks,
    cachedApiKeys: any
  ) => {
    let rpcUrl = networks && networks[network] ? networks[network].rpc : null;

    // SYNC BACKEND + FRONTEND
    const message = {
      action: network === "sepolia" ? "SWITCHSEPOLIA" : "SWITCHMAINNET",
    };
    setNetwork(network);

    handleActionViaBackend(message);

    if (rpcUrl) {
      // Check if the RPC URL is an Infura URL
      const isInfura = rpcUrl.includes("infura.io");

      // If it's an Infura URL and an API key is available, append the API key
      if (isInfura && cachedApiKeys.apiKey) {
        rpcUrl += cachedApiKeys.apiKey;
      }

      const networkToConnect = new JsonRpcProvider(rpcUrl);
      const preAuth = btoa(
        cachedApiKeys.apiKey + ":" + cachedApiKeys.apiKeySecret
      );
      setInfuraApiKeys(
        cachedApiKeys.apiKey,
        cachedApiKeys.apiKeySecret,
        preAuth,
        function () {
          //Now test
          getInfuraGASAPI(function (gas) {
            if (gas.response.length > 10) {
              // alert("API Keys Work!\n\n" + JSON.stringify(gas));
            }
          });
        }
      );

      setProvider(networkToConnect);
      setCurrentNetwork(network);
    } else {
      console.error("Network configuration not found.");
    }
  };

  const updatePreferredNetwork = async (name: string) => {
    const updatedData = {
      default: name,
    };

    // Fetch all saved networks
    const defaultNetworks: any = await sql(
      `SELECT * FROM cache WHERE name = 'DEFAULTNETWORKS'`
    );

    setRPCNetwork(name, JSON.parse(defaultNetworks.DATA), _userKeys);

    const rows = await sql(
      `SELECT * FROM cache WHERE name = 'CURRENT_NETWORK'`
    );

    if (!rows) {
      await sql(
        `INSERT INTO cache (name, data) VALUES ('CURRENT_NETWORK', '${JSON.stringify(
          updatedData
        )}')`
      );
    } else {
      await sql(
        `UPDATE cache SET data = '${JSON.stringify(
          updatedData
        )}' WHERE name = 'CURRENT_NETWORK'`
      );
    }

    promptSelectNetwork();
    promptSettings();
  };

  const updateApiKeys = async (apiKey: string, apiKeySecret: string) => {
    const updatedData: { apiKey: string; apiKeySecret: string } = {
      apiKey,
      apiKeySecret,
    };

    setUserKeys(updatedData);

    const preAuth = btoa(apiKey + ":" + apiKeySecret);
    setInfuraApiKeys(apiKey, apiKeySecret, preAuth, () => {});

    const rows = await sql(`SELECT * FROM cache WHERE name = 'API_KEYS'`);

    if (!rows) {
      await sql(
        `INSERT INTO cache (name, data) VALUES ('API_KEYS', '${JSON.stringify(
          updatedData
        )}')`
      );
    } else {
      await sql(
        `UPDATE cache SET data = '${JSON.stringify(
          updatedData
        )}' WHERE name = 'API_KEYS'`
      );
    }
  };

  const getAndSetFavorites = () => {
    getFavourites((favs) => {
      setFavorites(favs.rows);
    });
  }

  const handleActionViaBackend = async (action: any) => {
    console.log("sending message to backend", action);
    return new Promise((resolve) => {
      sendBackendMSG(action, (resp) => {
        console.log(resp);
        resolve(resp);
      });
    });
  };

  const promptJsonRpcSetup = () => {
    setPromptJsonRpcSetup((prevState) => !prevState);
  };

  const promptDeposit = () => {
    setPromptDeposit((prevState) => !prevState);
  };

  const promptWithdraw = () => {
    setPromptWithdraw((prevState) => !prevState);
  };

  const promptSelectNetwork = () => {
    setSelectNetwork((prevState) => !prevState);
  };

  const promptSettings = () => {
    setPromptSettings((prevState) => !prevState);
  };

  const promptAcceptOTC = (deal: OTCDeal) => {
    setPromptAcceptOTC((prevState) =>
      prevState ? null : deal
    );
  };

  const promptLogs = () => {
    setPromptLogs((prevState) => !prevState);
  }

  const promptFavorites = () => {
    setPromptFavorites((prevState) => !prevState);
  }

  const promptAllowance = () => {
    setPromptAllowance((prevState) => !prevState);
  }

  const notify = (message: string) =>
    toast(message, { position: "bottom-right", theme: "dark" });
  
  const globalNotify = (message: string) =>
    toast(message, { position: "top-center", theme: "dark" });

  return (
    <appContext.Provider
      value={{
        isWorking,

        _currentBlock,

        _promptAcceptOTC,
        promptAcceptOTC,

        _favorites,
        getAndSetFavorites,

        handleActionViaBackend,

        _provider,

        _promptAllowance,
        promptAllowance,

        _promptWithdraw,
        promptWithdraw,

        _promptLogs,
        promptLogs,

        _promptFavorites,
        promptFavorites,

        _promptSettings,
        promptSettings,

        updatePreferredNetwork,

        _promptSelectNetwork,
        promptSelectNetwork,

        _promptDeposit,
        promptDeposit,

        _promptReadMode,
        _promptJsonRpcSetup,
        promptJsonRpcSetup,

        _currentTradeWindow,
        setCurrentTradeWindow,

        _currentNavigation,
        setCurrentNavigation,

        _minimaBalance,
        _currentNetwork,
        _defaultAssets,
        _defaultNetworks,

        _generatedKey,
        _userKeys,
        _userDetails,
        updateApiKeys,

        notify,
      }}
    >
      {children}
    </appContext.Provider>
  );
};

export default AppProvider;
