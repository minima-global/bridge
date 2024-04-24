import { createContext, useRef, useEffect, useState } from "react";

import { initBridgeSystemsStartup } from "../../dapp/js/auth.js";
import { setInfuraApiKeys, getInfuraGASAPI } from "../../dapp/js/ethutil.js";
import { JsonRpcProvider } from "ethers";
import { Networks } from "./types/Network.js";
import { sql } from "./utils/SQL/index.js";

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
  // Is App in Read or Write Mode
  const [_promptReadMode, setReadMode] = useState<null | boolean>(null);
  // Set up API Keys
  const [_promptJsonRpcSetup, setPromptJsonRpcSetup] = useState<null | boolean>(
    false
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

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      (window as any).MDS.init((msg: any) => {
        //Do initialisation
        if (msg.event == "inited") {
          // Check if read or write mode
          (window as any).MDS.cmd(`checkmode`, function (response: any) {
            if (response.status) {
              // If in write mode, generate & set key
              if (response.response.mode === "WRITE") {
                initBridgeSystemsStartup(function (userdets) {
                  console.log(userdets);
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

            setWorking(false);
          })();

          //Messages from back end
        } else if (msg.event == "MDSCOMMS") {
          //Make sure is a private message
          if (!msg.data.public) {
            var comms = JSON.parse(msg.data.message);
            if (comms.action == "FRONTENDMSG") {
              //Show the message
              alert(JSON.stringify(comms, null, 2));
            }
          }
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
        function (setresp) {
          //Now test
          getInfuraGASAPI(function (gas) {
            if (gas.response.length > 10) {
              alert("API Keys Work!\n\n" + JSON.stringify(gas));
            }
          });
        }
      );

      setProvider(networkToConnect);
    } else {
      console.error("Network configuration not found.");
    }
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

  const promptJsonRpcSetup = () => {
    setPromptJsonRpcSetup((prevState) => !prevState);
  };

  return (
    <appContext.Provider
      value={{
        isWorking,

        _provider,

        _promptReadMode,
        _promptJsonRpcSetup,
        promptJsonRpcSetup,

        _currentNavigation,
        setCurrentNavigation,

        _generatedKey,
        _userKeys,
        updateApiKeys,
      }}
    >
      {children}
    </appContext.Provider>
  );
};

export default AppProvider;
