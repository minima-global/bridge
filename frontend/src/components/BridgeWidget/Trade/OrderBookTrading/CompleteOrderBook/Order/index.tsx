import { useContext, useEffect, useState } from "react";
import { Order as OrderInterface } from "../../../../../../types/Order";
import Bear from "../../../../../UI/Avatars/Bear";
import { Favorite } from "../../../../../../types/Favorite";
import { appContext } from "../../../../../../AppContext";
import AddIcon from "../../../../../UI/Icons/AddIcon";
import { Link, Outlet } from "react-router-dom";

interface IProps {
  data: OrderInterface;
}
const Order = ({ data }: IProps) => {
  const { _favorites: favorites, promptFavorites } = useContext(appContext);
  const [contact, setContact] = useState<Favorite | null>(null);
  const [_currentNavigation, _] = useState<"orders" | "balance" | "keys">(
    "orders"
  );

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
      <Outlet />

      <li
        className={`group transition-all ease-in-out hover:p-4 grid grid-rows-[auto_1fr] bg-gray-100 bg-opacity-20 dark:!bg-opacity-50 dark:bg-[#1b1b1b] px-3 hover:bg-white dark:hover:bg-black`}
      >
        {!contact && (
          <div className="flex justify-start">
            <Link
              to={`/favorite/${data.data.publickey}/add`}
              onClick={promptFavorites}
              className={`transition-opacity pl-2 p-0 text-[#1B1B1B]  dark:text-neutral-400 opacity-0 group-hover:opacity-100 flex justify-center hover:text-neutral-800`}
            >
              <AddIcon fill="currentColor" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-[46px_1fr_auto] gap-1">
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
        </div>

        <div className="w-full mb-4">
          <hr className="w-full border border-neutral-200 dark:border-neutral-800 mt-4" />

          <div
            className={`my-auto ${
              !data.data.orderbook.usdt.enable && "opacity-50"
            }`}
          >
            <div className="grid bg-gray-50 grid-cols-[1fr_auto_1fr] items-center dark:bg-[#1B1B1B] py-2 dark:bg-opacity-10">
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
            <div className="grid grid-cols-2 bg-gray-50 bg-opacity-30 dark:bg-[#1B1B1B] dark:bg-opacity-50 p-2">
              <div className="text-center border-r dark:border-teal-300">
                <h6 className="text-xs font-bold">Buying</h6>
                <p className="font-mono text-sm">
                  {data.data.orderbook.usdt.buy}
                </p>
              </div>
              <div className="text-center">
                <h6 className="text-xs font-bold">Selling</h6>
                <p className="font-mono text-sm">
                  {data.data.orderbook.usdt.sell}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`my-auto ${
              !data.data.orderbook.wminima.enable && "opacity-50"
            }`}
          >
            <div className="grid bg-gray-50 grid-cols-[1fr_auto_1fr] items-center dark:bg-[#1B1B1B] py-2 dark:bg-opacity-10">
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
            <div className="grid grid-cols-2 bg-gray-50 bg-opacity-30 dark:bg-[#1B1B1B] dark:bg-opacity-50 p-2">
              <div className="text-center border-r dark:border-teal-300">
                <h6 className="text-xs font-bold">Buying</h6>
                <p className="font-mono text-sm">
                  {data.data.orderbook.wminima.buy}
                </p>
              </div>
              <div className="text-center">
                <h6 className="text-xs font-bold">Selling</h6>
                <p className="font-mono text-sm">
                  {data.data.orderbook.wminima.sell}
                </p>
              </div>
            </div>
          </div>
        </div>
      </li>
    </>
  );
};

export default Order;
