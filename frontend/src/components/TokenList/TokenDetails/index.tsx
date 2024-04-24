import { useContext } from "react";
import { appContext } from "../../../AppContext";
import { useSpring, animated, config } from "react-spring";
import { createPortal } from "react-dom";
import Dialog from "../../UI/Dialog";
import Cross from "../../UI/Cross";
import { formatUnits } from "ethers";
import { createAvatar } from "@dicebear/core";
import { rings } from "@dicebear/collection";
import { _defaults } from "../../../constants";
import { useWalletContext } from "../../../providers/WalletProvider/WalletProvider";

const TokenDetails = () => {
  const { _tokenDetails, _promptTokenDetails, promptTokenDetails } =
    useContext(appContext);

  const { _network } = useWalletContext();

  const springProps = useSpring({
    opacity: _promptTokenDetails ? 1 : 0,
    transform: _promptTokenDetails
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.wobbly,
  });

  if (!_promptTokenDetails) {
    return null;
  }

  const { name: tokenName, balance, decimals, address } = _tokenDetails;
  return (
    <>
      {_promptTokenDetails &&
        createPortal(
          <Dialog extraClass="z-[22]" dismiss={promptTokenDetails}>
            <div className="h-full grid items-center">
              <animated.div style={springProps}>
                <div className="bg-white shadow-lg  shadow-slate-300  dark:shadow-none dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto">
                  <div className="px-4 flex items-center justify-between">
                    <h6 className="font-bold">Token Details</h6>
                    <Cross dismiss={promptTokenDetails} />
                  </div>
                  <div className="break-all">
                    <div className="flex flex-col items-center justify-center">
                      {_defaults["wMinima"][_network] === address ? (
                        <img
                          alt="token-icon"
                          src="./assets/token.svg"
                          className="w-[48px] h-[48px] rounded-full"
                        />
                      ) : _defaults["Tether"][_network] === address ? (
                        <img
                          alt="token-icon"
                          src="./assets/tether.svg"
                          className="w-[48px] h-[48px] rounded-full"
                        />
                      ) : (
                        <Bear extraClass="w-[48px]" input={address} />
                      )}

                      <h6 className="font-bold text-xl my-4 mb-2">
                        {tokenName}
                      </h6>
                      <p className="font-mono dark:text-teal-300">
                        {formatUnits(balance, decimals).toString()}
                      </p>
                    </div>
                    <div className="px-4 my-8">
                      <div>
                        <h6 className="font-bold text-sm">
                          Τoken contract address
                        </h6>
                        <p className="font-mono">{address}</p>
                      </div>
                      <div className="my-4">
                        <h6 className="font-bold text-sm">Decimals</h6>
                        <p className="font-mono">{decimals}</p>
                      </div>
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

export default TokenDetails;

interface BearProps {
  input: string;
  extraClass?: string;
}

const Bear = ({ input, extraClass }: BearProps) => {
  const avatar = createAvatar(rings, {
    seed: input,
    // ... other options
  });

  const svg = avatar.toDataUriSync();

  return (
    <div className="rounded-full bg-teal-300">
      <img className={`${extraClass && extraClass}`} src={svg} />
    </div>
  );
};
