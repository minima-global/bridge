var INFURA_API_KEY = "05c98544804b478994665892aeff361c";

var NETWORKS = {
  mainnet: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
  sepolia: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
  hardhat: "http://127.0.0.1:8545",
};

const HTLC_CONTRACT_ADDRESSES = {
  native: {
    polygon: "0xf4188600176727caf29d0ca523479334f38f99ed",
    sepolia: "0xDF45127318f78b5F422c6ddD6e11e6e7c986Ca78",
    mainnet: "0x00678A4D4ad7aa891Ab250fA274EB0f2C155242f",
  },
  erc20: {
    polygon: "0x6c9a1013EdaFb2e9C9c6034F1870fEc1166273f0",
    sepolia: "0x0e0d7b45339d247938446f720652a2d5af70f22c",
    mainnet: "0x05f2ce2a177b0fd960bbf485530d347f71e81352",
  },
};

var ABIs = {
  mainnet: {
    abi: [
      { inputs: [], stateMutability: "nonpayable", type: "constructor" },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "spender",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        name: "Approval",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "wminimaAddress",
            type: "address",
          },
        ],
        name: "DeleteAddress",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "wminimaAddress",
            type: "address",
          },
          {
            indexed: false,
            internalType: "bytes32",
            name: "minimaAddress",
            type: "bytes32",
          },
        ],
        name: "NewAddress",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        name: "Paused",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
          },
          {
            indexed: true,
            internalType: "bytes32",
            name: "previousAdminRole",
            type: "bytes32",
          },
          {
            indexed: true,
            internalType: "bytes32",
            name: "newAdminRole",
            type: "bytes32",
          },
        ],
        name: "RoleAdminChanged",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
          },
          {
            indexed: true,
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "sender",
            type: "address",
          },
        ],
        name: "RoleGranted",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
          },
          {
            indexed: true,
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "sender",
            type: "address",
          },
        ],
        name: "RoleRevoked",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        name: "Transfer",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        name: "Unpaused",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "wminimaAddress",
            type: "address",
          },
          {
            indexed: false,
            internalType: "bytes32",
            name: "minimaAddress",
            type: "bytes32",
          },
        ],
        name: "UpdateAddress",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "block",
            type: "uint256",
          },
        ],
        name: "UpdateLastBridgeBlock",
        type: "event",
      },
      {
        inputs: [],
        name: "DEFAULT_ADMIN_ROLE",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "MINTER_ROLE",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "PAUSER_ROLE",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "address", name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
        name: "burn",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "account", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "burnFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "subtractedValue", type: "uint256" },
        ],
        name: "decreaseAllowance",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "deleteAddress",
        outputs: [{ internalType: "bool", name: "success", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "getAddressCount",
        outputs: [
          { internalType: "uint256", name: "minimaCount", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }],
        name: "getRoleAdmin",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes32", name: "role", type: "bytes32" },
          { internalType: "uint256", name: "index", type: "uint256" },
        ],
        name: "getRoleMember",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }],
        name: "getRoleMemberCount",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes32", name: "role", type: "bytes32" },
          { internalType: "address", name: "account", type: "address" },
        ],
        name: "grantRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes32", name: "role", type: "bytes32" },
          { internalType: "address", name: "account", type: "address" },
        ],
        name: "hasRole",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "addedValue", type: "uint256" },
        ],
        name: "increaseAllowance",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "wminimaAddress", type: "address" },
        ],
        name: "isMapped",
        outputs: [{ internalType: "bool", name: "isIndeed", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "latestBridgeBlock",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        name: "minimaList",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "minimaStructs",
        outputs: [
          { internalType: "bytes32", name: "minimaAddress", type: "bytes32" },
          { internalType: "uint256", name: "listPointer", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "mint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "name",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes32", name: "minimaAddress", type: "bytes32" },
        ],
        name: "newAddress",
        outputs: [{ internalType: "bool", name: "success", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "pause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "paused",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes32", name: "role", type: "bytes32" },
          { internalType: "address", name: "account", type: "address" },
        ],
        name: "renounceRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes32", name: "role", type: "bytes32" },
          { internalType: "address", name: "account", type: "address" },
        ],
        name: "revokeRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes4", name: "interfaceId", type: "bytes4" },
        ],
        name: "supportsInterface",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "totalSupply",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "transferFrom",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "unpause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes32", name: "minimaAddress", type: "bytes32" },
        ],
        name: "updateAddress",
        outputs: [{ internalType: "bool", name: "success", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "updateLatestBridge",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    address: "0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF",
  },
  hardhat: {
    abi: [
      {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "_from",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "_to",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "_value",
            type: "uint256",
          },
        ],
        name: "Transfer",
        type: "event",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "name",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "owner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "symbol",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "totalSupply",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "transfer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    address: "0x0165878a594ca255338adfa4d48449f69242eb8f",
  },
};

var CURRENT_NETWORK = "mainnet";

// Balance of Eth and wMinima
function getEthereumBalance(ofAddress) {
  return new Promise((resolve) => {
    MDS.net.POST(
      NETWORKS[CURRENT_NETWORK],
      JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [ofAddress, "latest"],
        id: 1,
      }),
      function (resp) {
        const balance = JSON.parse(resp.response).result;

        // Using normal Maths loses precision, may need to use
        // BigNumber.js for this.
        const number = parseInt(balance) / Math.pow(10, 18);

        resolve(number);
      }
    );
  });
}

function getWrappedBalance(ofAddress) {
  const contractABI = JSON.stringify(ABIs[CURRENT_NETWORK].abi);
  const contractAddress = ABIs[CURRENT_NETWORK].address;
  const payload = {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [
      {
        to: contractAddress,
        data: `0x70a08231000000000000000000000000${ofAddress
          .slice(2)
          .toLowerCase()}`,
      },
      "latest",
    ],
    id: 1,
  };

  return new Promise((resolve) => {
    MDS.net.POST(
      NETWORKS[CURRENT_NETWORK],
      JSON.stringify(payload),
      function (resp) {
        const balance = JSON.parse(resp.response).result;

        // Using normal Maths loses precision, may need to use
        // BigNumber.js for this.
        const number = parseInt(balance) / Math.pow(10, 18);

        resolve(number);
      }
    );
  });
}

// The ability to check the timelock of an ETH HTLC and to collect it.
/**
 *
 * @param {string} blocksAgo This will have to be hexified
 * @param {keccak256} makersPublicKey This will be the indexed Minima Public Key of the Maker (We can make this anything unique which then we know what to look for)
 * @returns
 */
function getTimeLockForHTLC(blocksAgo, makersPublicKey) {
  getCurrentBlock().then(function (currentBlock) {
    MDS.log("currentBlock :" + currentBlock);
    const block = currentBlock - blocksAgo;
    MDS.log("block : " + block);
    const payload = {
      jsonrpc: "2.0",
      method: "eth_getLogs",
      params: [
        {
          address: HTLC_CONTRACT_ADDRESSES["erc20"][CURRENT_NETWORK],
          topics: [
            "0x31a346f672cf5073bda81a99e0a28aff2bfe8c2db87d462bb2f4c114476a46ee",
          ],
          fromBlock: "0x" + block.toString(16),
          toBlock: "latest",
        },
      ],
      id: 1,
    };

    return new Promise((resolve) => {
      MDS.net.POST(
        NETWORKS[CURRENT_NETWORK],
        JSON.stringify(payload),
        function (resp) {
          MDS.log(JSON.stringify(resp));
          // const balance = JSON.parse(resp.response).result;

          // Using normal Maths loses precision, may need to use
          // BigNumber.js for this.
          // const number = parseInt(balance) / Math.pow(10, 18);

          // resolve(number);
        }
      );
    });
  });
}

function getCurrentBlock() {
  const payload = {
    jsonrpc: "2.0",
    method: "eth_blockNumber",
    params: [],
    id: 1,
  };
  return new Promise((resolve) => {
    MDS.net.POST(
      NETWORKS[CURRENT_NETWORK],
      JSON.stringify(payload),
      function (resp) {
        resolve(parseInt(JSON.parse(resp.response).result, 16));
      }
    );
  });
}

// The ability to check for HTLC relevant to me.. so I can send the Minima HTLC.

// The ability to collect an ETH HTLC with a secret.. AND for the other user to also know the secret..

// Utility functions
function decodeParameterDataFromTransaction(data) {
  return new Promise((resolve) => {
    const params = ethers.utils.defaultAbiCoder.decode(["uint256", data]);
    MDS.log(JSON.stringify(params));
    resolve(params);
  });
}
