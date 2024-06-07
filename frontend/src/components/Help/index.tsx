import { useContext, useEffect, useRef, useState } from "react";
import { appContext } from "../../AppContext";
import Dialog from "../UI/Dialog";
import { createPortal } from "react-dom";
import { useSpring, animated, config } from "react-spring";
import RightArrow from "../UI/Icons/RightArrow";

const Help = () => {
  const { _promptHelp, promptHelp } = useContext(appContext);

  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log(scrollRef.current);
    const handleScroll = () => {
      if (scrollRef.current && scrollRef.current.scrollTop > 0) {
        setIsExpanded(true);
      }
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [scrollRef.current, _promptHelp]);

  const springProps = useSpring({
    opacity: _promptHelp ? 1 : 0,
    transform: _promptHelp
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.gentle,
  });

  if (!_promptHelp) {
    return null;
  }

  return (
    <>
      {_promptHelp &&
        createPortal(
          <Dialog dismiss={promptHelp}>
            <div
              onClick={(e) => e.stopPropagation()}
              className="h-full max-w-lg mx-auto grid items-start"
            >
              <animated.div style={springProps}>
                <div className="bg-white h-[75vh] overflow-hidden shadow-lg mt-[80px] shadow-slate-300  dark:shadow-none dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto">
                  <div className="flex justify-between items-center pr-4">
                    <h3 className="font-bold ml-4">Help</h3>
                    <svg
                      onClick={promptHelp}
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      strokeWidth="4.5"
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

                  <div className="overflow-y-scroll h-full pb-4">
                    <div className="my-3">
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <hr></hr>
                        <p className="text-xs opacity-80 tracking-wider">
                          How does MiniSwap V2 work?
                        </p>
                        <hr></hr>
                      </div>
                    </div>
                    <div className="text-sm flex flex-col gap-2 tracking-wide">
                      <p className="px-4 font-semibold">
                        <span className="font-bold">MiniSwap v2</span> let's you
                        trade Minima for WMINIMA/USDT on Ethereum.
                      </p>
                      <p className="px-4 font-semibold">
                        We use <span className="font-bold">HTLC</span>{" "}
                        contracts.{" "}
                        <span className="font-bold text-xs text-orange-500 italic">
                          (Hashed Time Lock Contracts)
                        </span>
                      </p>
                      <p className="px-4 font-semibold">
                        This is quite slow (5-10mins) and quite expensive as
                        both parties need to do an ETH transaction.
                      </p>
                      <p className="px-4 font-semibold">
                        BUT - it is completely{" "}
                        <span className="font-bold text-violet-500">
                          decentralized, server-less, trustless and secure.
                        </span>
                      </p>
                      <p className="px-4 font-semibold">
                        You can trade directly with someone you know using the{" "}
                        <span className="font-bold">OTC trade</span> feature{" "}
                        <span className="font-bold italic">OR</span> if you do
                        not know anyone you can find a matching order in the{" "}
                        <span className="font-bold">orderbook</span>.
                      </p>
                      <p className="px-4 font-semibold">
                        Orderbook messages are broadcast over the Minima network
                        as Minima tranactions which all{" "}
                        <span className="font-bold">MiniSwap V2</span> Users
                        see.
                      </p>
                      <p className="px-4 font-semibold">
                        <span className="font-bold">MiniSwap V2</span> will
                        always pick the best price for the amount you wish to
                        swap automatically.
                      </p>
                      <p className="px-4 font-semibold">
                        You do need to setup an ETH RPC end-point, unlike Minima
                        where everyone already runs everything.
                      </p>
                    </div>

                    <div className="my-3">
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <hr></hr>
                        <p className="text-xs opacity-80 tracking-wider">
                          Technical Explanation
                        </p>
                        <hr></hr>
                      </div>
                    </div>

                    <div
                      style={{ maxHeight: "200px" }}
                      ref={scrollRef}
                      className={`relative text-sm flex flex-col gap-2 tracking-wide overflow-y-scroll text ${
                        isExpanded ? "expanded" : ""
                      }`}
                    >
                      <p className="px-4 font-semibold">
                        Alice wants to swap 100 <span className="font-bold">Minima</span> for 100 <span className="font-bold">wMinima</span> with Bob.
                      </p>
                      <p className="px-4 font-semibold flex gap-2 items-center">
                        <span className="inline-block text-violet-500"><RightArrow fill="currentColor" /></span> Alice asks Bob for his public key.
                      </p>
                      <p className="px-4 font-semibold flex gap-2 items-center">
                      <span className="inline-block text-violet-500"><RightArrow fill="currentColor" /></span> Bob asks Alice for her public key.
                      </p>
                      <p className="px-4 font-semibold flex gap-2 items-center">
                        <span className="inline-block text-violet-500"><RightArrow fill="currentColor" /></span> Alice then creates a random secret that only she knows
                        and hashes that secret.
                      </p>
                      <p className="px-4 font-semibold flex gap-2 items-center">
                        <span className="inline-block text-violet-500"><RightArrow fill="currentColor" /></span> Alice then sends 100 Minima (on the Minima network) to
                        a contracts that has that hash and Bob's public key.
                      </p>
                      <p className="px-4 font-semibold">
                        The contract says, Bob can take the 100 Minima if he
                        signs and includes the secret (which when hashed is the
                        same as the hash Alice added) for the next 2 hours.
                        Alice cannot touch the funds for 2 hours.
                      </p>
                      <p className="px-4 font-semibold flex gap-2 items-center">
                        <span className="inline-block text-violet-500"><RightArrow fill="currentColor" /></span> Bob sees the contract but does not yet know the secret
                        so cannot collect. He thinks.. How can I make Alice
                        reveal the secret.. ?
                      </p>
                      <p className="px-4 font-semibold flex gap-2 items-center">
                        <span className="inline-block text-violet-500"><RightArrow fill="currentColor" /></span> Bob send 100 wMinima (on the ETH network) to a
                        contract that has that same hash and Alice's public key.
                      </p>
                      <p className="px-4 font-semibold flex gap-2 items-center">
                        <span className="inline-block text-violet-500"><RightArrow fill="currentColor" /></span> Bob send 100 wMinima (on the ETH network) to a
                        contract that has that same hash and Alice's public key.
                      </p>
                      <p className="px-4 font-semibold">
                        The contract says, Alice can take the 100 wMinima if she
                        signs and includes the secret (which when hashed is the
                        same as the hash Bob added) for the next 1 hour. Bob
                        cannot touch the funds for 1 hour.
                      </p>
                      <p className="px-4 font-semibold flex gap-2 items-center">
                        <span className="inline-block text-violet-500"><RightArrow fill="currentColor" /></span> Alice sees the contract BUT she knows the secret!.. So
                        she collects the 100 wMinima by signing and revealing
                        the secret.
                      </p>
                      <p className="px-4 font-semibold flex gap-2 items-center">
                        <span className="inline-block text-violet-500"><RightArrow fill="currentColor" /></span> Bob sees Alice collect the 100 wMinima and sees the
                        secret.. So now he knows the secret! He signs and
                        collects the 100 Minima..
                      </p>
                      <div className="my-3">
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <hr></hr>
                        <p className="text-xs opacity-80 tracking-wider">
                          Final Thoughts
                        </p>
                        <hr></hr>
                      </div>
                    </div>

                    <p className="px-4 font-semibold">
                        No-one other than Alice and Bob are involved in this
                        trade.
                      </p>
                      <p className="px-4 font-semibold">
                        Both parties must perform a transaction on Minima and on
                        ETH.
                      </p>
                      <p className="px-4 font-semibold">
                        The transactions take time to confirm on both chains -
                        slow..
                      </p>
                      <p className="px-4 font-semibold">
                        ETH transactions are expensive..
                      </p>
                      <p className="px-4 font-semibold">
                        There are initial technical challenges like getting the
                        ETH RPC end-points working and approving the ETH HTLC
                        contract.
                      </p>
                      <p className="px-4 font-semibold">
                        Yes - it is slow, expensive and a little complicated to
                        get started..
                      </p>
                      <p className="px-4 font-semibold">
                        Yes - it is secure, trustless, non-custodial and
                        completely decentralised..
                      </p>

                      {!isExpanded && (
                        <div className="absolute left-0 right-0 top-0 bottom-0 flex justify-center items-end">
                          <p className=" bg-black z-[25] text-white dark:text-black dark:bg-white px-3 shadow-lg text-xs py-1">
                            Scroll to read More
                          </p>
                        </div>
                      )}
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

export default Help;
