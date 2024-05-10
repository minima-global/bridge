import { useEffect, useState } from "react";
import { Order as OrderInterface } from "../../../../../../types/Order";
import AnimatedDialog from "../../../../../UI/AnimatedDialog";
import Bear from "../../../../../UI/Avatars/Bear";
import { Favorite } from "../../../../../../types/Favorite";
import NativeMinima from "../../../../../NativeMinima";
import EthereumTokens from "../../../../../EthereumTokens";
import DetailsNavigation from "./Navigation";

interface IProps {
  data: OrderInterface;
  favorites: Favorite[];
}
const Order = ({ data, favorites }: IProps) => {
  const [details, setDetails] = useState(false);
  const [contact, setContact] = useState<Favorite | null>(null);
  const [_currentNavigation, setCurrentNavigation] = useState<
    "orders" | "balance" | "keys"
  >("orders");

  const promptDetails = () => {
    setDetails((prevState) => !prevState);
  };

  const handleClickEvent = () => {
    promptDetails();
  };

  function findMatchingPublickey(uid, array) {
    for (const obj of array) {
      if (obj && obj.BRIDGEUID.toUpperCase() === uid.toUpperCase()) {
        return obj;
      }
    }
    return null;
  }

  useEffect(() => {
    const match = findMatchingPublickey(data.data.publickey, favorites);
    setContact(match);
  }, [favorites]);

  return (
    <>
      <AnimatedDialog
        extraClass="max-w-sm mx-auto"
        dialogStyles="h-[400px] rounded-lg !shadow-teal-800 !shadow-sm overflow-hidden"
        position="items-center"
        isOpen={details}
        onClose={promptDetails}
      >
        <>
          <div className="px-4 flex justify-between">
            <h3 className="font-bold">Details</h3>
            <svg
              onClick={promptDetails}
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
          <div className="px-4 my-2">
            <DetailsNavigation
              _currentNavigation={_currentNavigation}
              setCurrentNavigation={setCurrentNavigation}
            />

            {_currentNavigation === "balance" && (
              <div className="h-[calc(100%_-_60px)]">
                <NativeMinima
                  display={false}
                  external={data.data.balance.minima.total}
                />
                <EthereumTokens
                  externalEthereum={data.data.balance.eth}
                  externalUSDT={data.data.balance.usdt}
                  externalWMINIMA={data.data.balance.wminima}
                />
              </div>
            )}

            {_currentNavigation === "orders" && (
              <div className="grid grid-rows-2 h-[250px]">
                <div className="my-auto">
                  <div className="grid border-b-[1px] bg-gray-50 dark:border-teal-300 grid-cols-[1fr_auto_1fr] items-center dark:bg-[#1B1B1B] p-1 py-3 rounded-full dark:bg-opacity-10 rounded-b-none">
                    <div />
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <h3 className="text-xs font-bold text-center">Native</h3>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 10h14l-4 -4" />
                        <path d="M17 14h-14l4 4" />
                      </svg>
                      <h3 className="text-xs font-bold text-center">USDT</h3>
                    </div>
                    <div />
                  </div>
                  <div className="grid grid-cols-2 bg-gray-50 dark:bg-[#1B1B1B] dark:bg-opacity-10 p-2 rounded-full rounded-t-none">
                    <div className="text-center border-r dark:border-teal-300">
                      <h6 className="text-xs">Buying</h6>
                      <p className="font-mono text-sm">
                        {data.data.orderbook.usdt.buy}
                      </p>
                    </div>
                    <div className="text-center">
                      <h6 className="text-xs">Selling</h6>
                      <p className="font-mono text-sm">
                        {data.data.orderbook.usdt.sell}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="my-auto">
                  <div className="grid border-b-[1px] bg-gray-50 dark:border-teal-300 grid-cols-[1fr_auto_1fr] items-center dark:bg-[#1B1B1B] p-1 py-3 dark:bg-opacity-10 rounded-full rounded-b-none">
                    <div />
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <h3 className="text-xs font-bold text-center">Native</h3>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 10h14l-4 -4" />
                        <path d="M17 14h-14l4 4" />
                      </svg>
                      <h3 className="text-xs font-bold text-center">WMINIMA</h3>
                    </div>
                    <div />
                  </div>
                  <div className="grid grid-cols-2 bg-gray-50 dark:bg-[#1B1B1B] dark:bg-opacity-10 p-2 rounded-full rounded-t-none">
                    <div className="text-center border-r dark:border-teal-300">
                      <h6 className="text-xs">Buying</h6>
                      <p className="font-mono text-sm">
                        {data.data.orderbook.usdt.buy}
                      </p>
                    </div>
                    <div className="text-center">
                      <h6 className="text-xs">Selling</h6>
                      <p className="font-mono text-sm">
                        {data.data.orderbook.usdt.sell}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {_currentNavigation === "keys" && (
              <>
                <div className="p-3 bg-gray-100 rounded mb-2 dark:bg-[#1B1B1B] dark:bg-opacity-10">
                  <h6 className="text-xs font-bold">Minima</h6>
                  <input
                    className="w-full truncate text-xs bg-transparent focus:outline-none"
                    readOnly
                    value={data.data.publickey}
                  />
                </div>

                <div className="p-3 bg-gray-100 rounded mb-2 dark:bg-[#1B1B1B] dark:bg-opacity-10">
                  <h6 className="text-xs font-bold">Maxima</h6>
                  <input
                    className="w-full truncate text-xs bg-transparent focus:outline-none"
                    readOnly
                    value={data.maximapublickey}
                  />
                </div>

                <div className="p-3 bg-gray-100 rounded mb-2 dark:bg-[#1B1B1B] dark:bg-opacity-10">
                  <h6 className="text-xs font-bold">Ethereum</h6>
                  <input
                    className="w-full truncate text-xs bg-transparent focus:outline-none"
                    readOnly
                    value={data.data.ethpublickey}
                  />
                </div>
              </>
            )}
          </div>
        </>
      </AnimatedDialog>

      <li
        onClick={handleClickEvent}
        className={`grid grid-cols-[46px_1fr_auto]
                    } gap-1 mb-3 bg-gray-100 bg-opacity-20 dark:!bg-opacity-50 dark:bg-[#1b1b1b] px-3 hover:bg-white dark:hover:bg-black`}
      >
        <div className="my-auto">
          <Bear extraClass="w-[46px]" input={data.data.publickey} />
        </div>
        <div className="pt-2 pl-1">
          <input
            readOnly
            value={contact ? contact.NAME : "-"}
            className="bg-transparent cursor-default text-xs focus:outline-none w-full truncate font-bold"
          />
          <input
            onClick={(e) => e.stopPropagation()}
            readOnly
            value={data.data.publickey}
            className="bg-transparent cursor-default focus:outline-none text-xs w-full truncate font-mono"
          />
        </div>
        <div className="flex gap-1 my-auto">
          {data.data.orderbook.wminima.enable && (
            <img
              className="w-[20px] h-[20px] rounded-full"
              alt="wminima"
              src="./assets/wtoken.svg"
            />
          )}
          {data.data.orderbook.usdt.enable && (
            <img
              className="w-[18px] h-[18px]"
              alt="usdt"
              src="./assets/tether.svg"
            />
          )}
        </div>
      </li>
    </>
  );
};

export default Order;
