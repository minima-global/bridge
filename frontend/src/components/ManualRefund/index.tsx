import { useContext, useState } from "react";
import { appContext } from "../../AppContext";
import AnimatedDialog from "../UI/AnimatedDialog";
import CloseIcon from "../UI/Icons/CloseIcon";
import { ethers, formatUnits } from "ethers";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import RefundIcon from "../UI/Icons/RefundIcon";

const ManualRefund = () => {
  const {
    _promptManualRefund,
    handleActionViaBackend,
    setPromptManualRefund,
    _provider,
  } = useContext(appContext);

  const { getTokenType } = useWalletContext();

  // refunding...
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<false | string>(false);
  const [transactionId, setTransactionId] = useState("");
  const [contract, setContract] = useState<null | {
    contractId: string;
    timeLock: number;
    hashLock: string;
    amount: number;
    otc: boolean;
    tokenContract: string;
    expired: boolean;
  }>(null);

  const handleChangeInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value } = e.target;

    // Update other fields as strings
    setTransactionId(value);
  };

  const handleDismiss = () => setContract(null);

  const handleRefund = async () => {
    if (!contract) return;

    setLoading(true);

    const message = {
      action: "MANUALETHREFUND",
      contractId: contract.contractId,
      tokenContract: contract.tokenContract,
      amount: contract.amount.toString(),
      hashLock: contract.hashLock,
    };

    // sendBackendMSG
    handleActionViaBackend(message);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    setContract(null);
  };

  const fetchParametersForEthereumTransaction = async () => {
    if (!_provider) return;

    setError(false);

    try {
      const tx = await _provider.getTransaction(transactionId);

      const contractABI = [
        "function newContract(bytes32 _senderminima, address _receiver, bytes32 _hashlock, uint256 _timelock, address _tokenContract, uint256 _amount, uint256 _requestamount, bool _otc) external returns (bytes32 contractId)",
      ];

      const iface = new ethers.Interface(contractABI);
      // Decode the input data to get the parameters
      const decodedInput = iface.decodeFunctionData("newContract", tx.data);

      // Destructure the parameters
      const {
        _senderminima,
        _receiver,
        _hashlock,
        _timelock,
        _tokenContract,
        _amount,
        _requestamount,
        _otc,
      } = decodedInput;

      // Now calculate the contractId using the extracted parameters
      const abiEncoded = ethers.AbiCoder.defaultAbiCoder().encode(
        [
          "bytes32",
          "address",
          "bytes32",
          "uint256",
          "address",
          "uint256",
          "uint256",
          "bool",
        ],
        [
          _senderminima,
          _receiver,
          _hashlock,
          _timelock,
          _tokenContract,
          _amount,
          _requestamount,
          _otc,
        ],
      );

      // check contract expiry..
      const latestBlock = await _provider.getBlock("latest");

      let expired = false;
      if (latestBlock.timestamp > parseInt(_timelock)) {
        expired = true;
      }

      const contractId = ethers.keccak256(abiEncoded);
      setContract({
        contractId: contractId,
        timeLock: _timelock,
        hashLock: _hashlock,
        amount: _amount,
        otc: _otc,
        tokenContract: _tokenContract,
        expired,
      });
    } catch (err) {
      console.error(err);
      setError(
        "Invalid contract, are you sure this is an Ethereum HTLC contract?",
      );
    }
  };

  return (
    <div>
      <AnimatedDialog
        up={50}
        display={_promptManualRefund}
        dismiss={() => null}
      >
        <div>
          <div className="flex">
            <h3 className="flex-grow font-bold">Manual Refund</h3>
            <span onClick={() => setPromptManualRefund(false)}>
              <CloseIcon fill="currentColor" />
            </span>
          </div>

          <div>
            <p className="mt-4">
              If your Ethereum contract expired and was not automatically
              refunded, this will assist you to re-fund your tokens manually.
            </p>

            <div className="my-8">
              {!contract && (
                <>
                  <div className="flex flex-col bg-neutral-100 dark:bg-[#1B1B1B] p-4 rounded">
                    <span className="text-xs font-bold">
                      Contract transaction ID
                    </span>
                    <input
                      name="transactionId"
                      value={transactionId}
                      onChange={handleChangeInput}
                      type="text"
                      placeholder="Transaction hash"
                      className="bg-transparent focus:outline-none w-full"
                    />
                  </div>
                  {error && (
                    <div className="my-4">
                      <p className="text-sm text-center text-neutral-500 dark:text-neutral-600">
                        {error}
                      </p>
                    </div>
                  )}
                  <div className="mt-4">
                    <button
                      onClick={fetchParametersForEthereumTransaction}
                      type="button"
                      className="bg-neutral-100 dark:bg-black dark:border dark:border-neutral-800 dark:hover:border-neutral-700 font-bold w-full"
                    >
                      Get Contract
                    </button>
                  </div>
                </>
              )}
              <div className="my-4">
                {contract && (
                  <div>
                    <div className="flex rounded-lg bg-neutral-100 dark:bg-[#1B1B1B] p-2">
                      <div className="flex-grow">
                        <p className="my-auto font-bold dark:text-neutral-600">
                          Contract deposit
                        </p>
                        <p
                          className={`my-auto text-xs  font-bold ${contract.expired ? "text-orange-800" : "text-teal-600"}`}
                        >
                          {contract.expired ? "Expired" : "Active"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-neutral-200 dark:bg-neutral-900 pl-2 pr-3 rounded-full py-1">
                        <div className="w-8 h-8 overflow-hidden rounded-full">
                          <img
                            className=""
                            src={
                              getTokenType(contract.tokenContract, "1") ===
                              "wMinima"
                                ? "./assets/wtoken.svg"
                                : "./assets/tether.svg"
                            }
                          />
                        </div>
                        <div>
                          <h6 className="text-neutral-700 font-bold dark:text-neutral-600 text-xs">
                            {getTokenType(contract.tokenContract, "1") ===
                            "wMinima"
                              ? "WMINIMA"
                              : "USDT"}
                          </h6>
                          <p className="font-bold">
                            {formatUnits(
                              contract.amount.toString(),
                              getTokenType(contract.tokenContract, "1") ===
                                "wMinima"
                                ? 18
                                : 6,
                            ).toString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-4">
                      {!contract.expired && (
                        <div>
                          <p className="text-sm text-center text-neutral-500 dark:text-neutral-600">
                            This contract is not expired yet and therefore is
                            not refundable.
                          </p>

                          <div className="flex">
                            <div className="flex-grow" />
                            <div className="flex gap-2 my-8">
                              <button
                                onClick={handleDismiss}
                                className="bg-transparent border border-neutral-600 hover:border-neutral-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {contract.expired && (
                        <div>
                          <p className="text-sm text-center text-neutral-500 dark:text-neutral-600">
                            If you are the owner of this contract and it has not
                            been completed, you can refund it now.
                          </p>

                          <div className="flex">
                            <div className="flex-grow" />
                            <div className="flex gap-2 my-8">
                              <button
                                disabled={loading}
                                onClick={handleDismiss}
                                className="bg-transparent border border-neutral-600 hover:border-neutral-500"
                              >
                                Cancel
                              </button>
                              <button
                                disabled={loading}
                                onClick={handleRefund}
                                className="text-white dark:bg-neutral-900"
                              >
                                {loading && "Refunding..."}
                                {!loading && "Refund"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AnimatedDialog>
      <div
        className="my-4 p-2 hover:cursor-pointer bg-neutral-100 hover:bg-neutral-50 rounded-full dark:bg-[#1B1B1B] hover:dark:bg-[#2C2C2C] grid grid-cols-[auto_1fr] items-center gap-1 shadow-lg"
        onClick={() => setPromptManualRefund(true)}
      >
        <span className=" text-sky-800 dark:text-neutral-500">
          <RefundIcon fill="currentColor" size={24} />
        </span>
        <p className="pl-1 text-sm">Refund Ethereum Contract</p>
      </div>
    </div>
  );
};

export default ManualRefund;
