import { useContext, useEffect, useState } from "react";
import Decimal from "decimal.js";
import { PoolData, PoolType } from "../../../../../types/Pool";
import { appContext } from "../../../../../AppContext";
import Toolbar from "../Toolbar";
import { useOrderBookContext } from "../../../../../hooks/useOrderBook";

const WrappedPool = () => {
  const { notify } = useContext(appContext);
  const { _currentOrderBook, updateBook } = useOrderBookContext();
  const [_def, setDefault] = useState<PoolType>({
    buy: 0,
    enable: false,
    maximum: 1000,
    minimum: 10,
    sell: 0,
  });
  const [f, setF] = useState(false);
  const [isButtonEnable, setIsButtonEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (_currentOrderBook && _currentOrderBook?.wminima) setDefault(_currentOrderBook.wminima);
  }, [_currentOrderBook]);

  const handleUpdateBook = () => {
    const updatedBook = {
      wminima: {
        ..._def,
        enable: true,
      },
      usdt: {
        ..._currentOrderBook?.usdt!,
      },
    };
    updateBook(updatedBook as PoolData);
    notify("Book updated!");
  };

  const disableBook = () => {
    const updatedBook = {
      wminima: {
        enable: false,
        buy: 0,
        sell: 0,
        maximum: 1000,
        minimum: 10,
      },
      usdt: {
        ..._currentOrderBook?.usdt!,
      },
    };
    updateBook(updatedBook);
    notify("Book disabled!");
  };

  const handleChange = (e) => {
    const name = e.target.id;
    const value = e.target.value;
    try {
      if (value.trim() === '') {
        setDefault((prevState) => ({ ...prevState, [name]: '' }));
      } else {
        if (!new Decimal(value)) {
          throw new Error();
        }
        
        setDefault((prevState) => ({
          ...prevState,
          [name]: new Decimal(value).toNumber(),
        }));
      }
    } catch (error) {
      setDefault((prevState) => ({ ...prevState, [name]: 0 }));
    }
  };
  // Check if there are any differences betwe en _def and tetherPool
  useEffect(() => {
    if (_def.buy === 0 || _def.sell === 0) {
      return setIsButtonEnabled(false);
    }

    if (!_def.buy || !_def.sell) {
      return setIsButtonEnabled(false);
    }

    const userUpdatedValues =
      JSON.stringify(_def) !== JSON.stringify(_currentOrderBook?.wminima);

    // Update the state of the button based on whether the user has updated values or not
    setIsButtonEnabled(userUpdatedValues);
  }, [_def, _currentOrderBook]);

  return (
    <div
      className={`shadow-sm dark:shadow-none bg-slate-100 bg-opacity-10 dark:bg-[#1B1B1B] rounded ${
        f && "outline dark:outline-yellow-300"
      }`}
    >
      <Toolbar token="WMINIMA" />

      <div className="grid grid-rows-[16px_1fr]">
        <div />
        <div className="grid grid-cols-2 divide-x-2 divide-teal-300 px-4">
          <div className="px-4 border-l-2 border-teal-300">
            <div className="grid grid-cols-[1fr_36px]">
              <div>
                <label className="text-xs font-bold mb-1 text-opacity-50">
                  I want to buy Minima for
                </label>

                <input
                  id="buy"
                  type="number"
                  onChange={handleChange}
                  onFocus={() => setF(true)}
                  onBlur={() => setF(false)}
                  value={_def.buy}
                  className="w-full bg-transparent font-mono focus:outline-none truncate"
                  placeholder="0"
                />
              </div>
              <div className="my-auto">
                <img
                  className="rounded-full w-[36px] h-[36px] my-auto"
                  alt="wrappedtoken"
                  src="./assets/wtoken.svg"
                />
              </div>
            </div>
          </div>

          <div className="relative grid grid-cols-[1fr_36px]">
            <div className="px-4">
              <label className="text-xs font-bold mb-1 text-opacity-50">
                I want to sell Minima for
              </label>

              <input
                id="sell"
                type="number"
                onChange={handleChange}
                onFocus={() => setF(true)}
                onBlur={() => setF(false)}
                value={_def.sell}
                className="w-full bg-transparent font-mono focus:outline-none truncate"
                placeholder="0"
              />
            </div>
            <div className="my-auto">
              <img
                className="rounded-full my-auto"
                alt="wrappedtoken"
                src="./assets/wtoken.svg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 px-4 mb-3">
        {_def && !_def.enable && (
          <button
            onClick={handleUpdateBook}
            disabled={!isButtonEnable}
            className="hover:bg-teal-600 w-full text-white bg-teal-500 dark:text-[#1B1B1B] font-bold disabled:bg-opacity-20"
          >
            Enable
          </button>
        )}

        {_def && _def.enable && (
          <div className="w-full grid grid-cols-[1fr_minmax(0,_100px)] gap-1">
            <button
              onClick={handleUpdateBook}
              disabled={!isButtonEnable}
              className="hover:bg-teal-600 bg-teal-500 text-[#1B1B1B] font-bold disabled:bg-opacity-20"
            >
              Update
            </button>
            <button
              onClick={disableBook}
              className="hover:bg-opacity-90 bg-red-500 text-[#1B1B1B] font-bold"
            >
              Disable
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WrappedPool;
