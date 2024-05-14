import { useContext, useEffect, useState } from "react";
import Decimal from "decimal.js";
import { PoolType } from "../../../../../types/Pool.js";
import { appContext } from "../../../../../AppContext.js";
import Toolbar from "../Toolbar/index.js";
import { useOrderBookContext } from "../../../../../hooks/useOrderBook.js";

const TetherPool = () => {
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
  const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (_currentOrderBook && _currentOrderBook.usdt) {
      setDefault(_currentOrderBook.usdt);
    }
  }, [_currentOrderBook]);

  const handleUpdateBook = async () => {
    const updatedBook = {
      usdt: {
        ..._def,
        enable: true      
      },
      wminima: {
        ..._currentOrderBook?.wminima!,
      },
    };
    updateBook(updatedBook);
    notify("Book updated!");
  };

  const disableBook = () => {
    const updatedBook = {
      usdt: {
        enable: false,
        buy: 0,
        sell: 0,
        maximum: 1000,
        minimum: 10,
      },
      wminima: {
        ..._currentOrderBook?.wminima!,
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
  // Check if there are any differences between _def and tetherPool
  useEffect(() => {
    if (_def.buy === 0 || _def.sell === 0) {
      return setIsButtonEnabled(false);
    }

    if (!_def.buy || !_def.sell) {
      return setIsButtonEnabled(false);
    }


    const userUpdatedValues =
      JSON.stringify(_def) !== JSON.stringify(_currentOrderBook?.usdt);

    // Update the state of the button based on whether the user has updated values or not
    setIsButtonEnabled(userUpdatedValues);
  }, [_def, _currentOrderBook]);

  return (
    <div
      className={`shadow-sm dark:shadow-none bg-transparent dark:bg-[#1B1B1B] rounded ${
        f && "outline dark:outline-yellow-300"
      }`}
    >
      <Toolbar token="USDT" />

      <div className="grid grid-rows-[16px_1fr]">
        <div />
        <div className="px-4">
          <div className="grid grid-cols-2 bg-transparent  dark:bg-[#1B1B1B] relative divide-x-2 divide-red-300">
            <div className="relative border-l-2 border-teal-300 grid grid-cols-[1fr_auto]">
              <div className="grid grid-cols-[1fr_auto]">
                <div className="pl-4">
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
                    className="bg-transparent w-full rounded font-mono focus:outline-none truncate"
                    placeholder="0"
                  />
                </div>
                <div className="my-auto pr-4">
                  <img
                    className="rounded-full w-[36px] h-[36px] my-auto"
                    alt="wrappedtoken"
                    src="./assets/tether.svg"
                  />
                </div>
              </div>
            </div>
            <div className="relative grid grid-cols-[1fr_auto]">
              <div className="pl-4">
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
                  className="bg-transparent w-full font-mono rounded focus:outline-none truncate"
                  placeholder="0"
                />
              </div>
              <div className="my-auto">
                <img
                  className="rounded-full w-[36px] h-[36px] my-auto"
                  alt="wrappedtoken"
                  src="./assets/tether.svg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 px-4 mb-3">
        {_def && !_def.enable && (
          <button
            onClick={handleUpdateBook}
            disabled={!isButtonEnabled}
            className="hover:bg-teal-600 w-full text-white bg-teal-500 dark:text-[#1B1B1B] font-bold disabled:bg-opacity-20"
          >
            Enable
          </button>
        )}

        {_def && _def.enable && (
          <div className="w-full grid grid-cols-[1fr_minmax(0,_100px)] gap-1">
            <button
              onClick={handleUpdateBook}
              disabled={!isButtonEnabled}
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

export default TetherPool;
