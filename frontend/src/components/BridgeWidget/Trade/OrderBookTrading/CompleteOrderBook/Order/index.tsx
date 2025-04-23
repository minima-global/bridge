import { useContext, useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Order as OrderInterface } from "../../../../../../types/Order";
import { Favorite } from "../../../../../../types/Favorite";
import { appContext } from "../../../../../../AppContext";
import Bear from "../../../../../UI/Avatars/Bear";
import AddIcon from "../../../../../UI/Icons/AddIcon";

interface IProps {
  data: OrderInterface;
}

export default function Order({ data }: IProps) {
  const { _favorites: favorites, promptFavorites } = useContext(appContext);
  const [contact, setContact] = useState<Favorite | null>(null);

  useEffect(() => {
    const match = favorites.find(obj => obj && obj.BRIDGEUID.toUpperCase() === data.data.publickey.toUpperCase());
    setContact(match || null);
  }, [favorites, data.data.publickey]);

  return (
    <>
      <Outlet />
      <li className="group transition-all ease-in-out hover:bg-white  bg-gray-100 bg-opacity-20 dark:bg-neutral-800 dark:bg-opacity-50 p-2 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Bear extraClass="!w-[32px]" input={data.data.publickey} />
            <div>
              <input
                readOnly
                value={contact ? contact.NAME : "N/A"}
                className="bg-transparent cursor-default text-xs focus:outline-none w-full truncate font-bold text-gray-800 dark:text-gray-200"
              />
              <input
                readOnly
                value={data.data.publickey}
                className="bg-transparent cursor-default focus:outline-none text-[10px] w-full truncate font-mono text-gray-600 dark:text-gray-400"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 mr-2">            
            <div className="flex gap-1">
              {/* {data.data.orderbook.wminima.enable && (
                <img className="min-w-[16px] min-h-[16px] w-[16px] h-[16px] rounded-full" alt="wminima" src="./assets/wtoken.svg" />
              )} */}
              {data.data.orderbook.usdt.enable && (
                <img className="min-w-[16px] min-h-[16px] w-[16px] h-[16px]" alt="usdt" src="./assets/tether.svg" />
              )}
            </div>
            {!contact && (
              <Link
                to={`/fav?uid=${data.data.publickey}&action=add`}
                onClick={() => promptFavorites("read")}
                className="text-teal-500 hover:text-teal-400 dark:text-neutral-300 w-4"
              >
                <AddIcon fill="currentColor" />
              </Link>
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          {data.data.orderbook.usdt.enable && (
            <OrderBook
              title="USDT"
              buy={data.data.orderbook.usdt.buy}
              sell={data.data.orderbook.usdt.sell}
            />
          )}
          {/* {data.data.orderbook.wminima.enable && (
            <OrderBook
              title="WMINIMA"
              buy={data.data.orderbook.wminima.buy}
              sell={data.data.orderbook.wminima.sell}
            />
          )} */}
        </div>
      </li>
    </>
  );
}

interface OrderBookProps {
  title: string;
  buy: number;
  sell: number;
}

function OrderBook({ title, buy, sell }: OrderBookProps) {
  return (
    <div className="bg-white dark:bg-[#1b1b1b] p-1 rounded text-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-700 dark:text-gray-300">Native ↔ {title}</span>
        <div className="flex space-x-2">
          <span className="text-gray-600 dark:text-gray-400">Buy: <span className="font-mono text-gray-800 dark:text-gray-200">{buy}</span></span>
          <span className="text-gray-600 dark:text-gray-400">Sell: <span className="font-mono text-gray-800 dark:text-gray-200">{sell}</span></span>
        </div>
      </div>
    </div>
  );
}