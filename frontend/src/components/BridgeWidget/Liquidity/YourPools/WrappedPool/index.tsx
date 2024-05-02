import { useContext, useEffect, useState } from "react";
import Decimal from "decimal.js";
import { PoolType } from "../../../../../types/Pool";
import { appContext } from "../../../../../AppContext";
import useOrderBook from "../../../../../hooks/useOrderBook";

const WrappedPool = () => {
    const { notify } = useContext(appContext);
    const { wrappedPool, setBook, tetherPool } = useOrderBook();
    const [_def, setDefault] = useState<PoolType>({buy: 0, enable: false, maximum: 1000, minimum: 10, sell: 0});
    const [f, setF] = useState(false);
    const [isButtonEnable, setIsButtonEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (wrappedPool)
      setDefault(wrappedPool);
  }, [wrappedPool]);

  const updateBook = () => {
    const updatedBook = {
      wminima: {
        ..._def,
        enable: true,
        maximum: 1000,
        minimum: 10,
      },
      usdt: {
        ...tetherPool!
      }
    }
    setBook(updatedBook);
    notify("Book updated!");
    
  }

  const disableBook = () => {
    const updatedBook = {
      wminima: {
        enable: false,
        buy: 0,
        sell: 0,
        maximum: 0,
        minimum: 0
      },
      usdt: {
        ...tetherPool!
      }
    }
    setBook(updatedBook);
    notify("Book disabled!");

  }

  const handleChange = (e) => {
    const name = e.target.id;
    const value = e.target.value;
    try {        
        if (!new Decimal(value)){
            throw new Error();
        }

        setDefault((prevState) => ({...prevState, [name]: new Decimal(value).toNumber()}));
    } catch (error) {
        setDefault((prevState => ({...prevState, [name]: 0})))
    }
  }
  // Check if there are any differences betwe en _def and tetherPool
  useEffect(() => {
    if (_def.buy === 0 || _def.sell === 0) {
      return setIsButtonEnabled(false);
    }


    const userUpdatedValues = JSON.stringify(_def) !== JSON.stringify(wrappedPool);

    console.log('d', _def);

    console.log(wrappedPool);
    // Update the state of the button based on whether the user has updated values or not
    setIsButtonEnabled(userUpdatedValues);
  }, [_def, wrappedPool]);

  return (
    <div
      className={`bg-slate-100 dark:bg-[#1B1B1B] border border-[#1B1B1B] rounded-lg p-4 ${
        f && "outline outline-yellow-300"
      }`}
    >
      <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center">
        <div />
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <h3 className="text-lg font-bold text-center">Native</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 10h14l-4 -4" />
            <path d="M17 14h-14l4 4" />
          </svg>
          <h3 className="text-lg font-bold text-center">wMinima</h3>
        </div>
        <div />
      </div>
      <hr className="border-teal-300 mb-4" />
      <div className="grid grid-cols-2 bg-slate-300 dark:bg-[#1B1B1B] relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 bg-teal-300 w-1" />

          <label className="text-sm font-bold mb-1 pl-4 text-opacity-50">
            I want to buy Minima for
          </label>
          <div className="grid grid-cols-[1fr_auto] items-center pl-4">
            <input
              id="buy"
              type="number"
              onChange={handleChange}
              onFocus={() => setF(true)}
              onBlur={() => setF(false)}
              value={_def.buy}
              className="dark:bg-[#1B1B1B] rounded font-mono focus:outline-none truncate"
              placeholder="0"
            />
            <span className="text-[12px] font-bold pr-2">WMINIMA</span>
          </div>
        </div>
        {/* Vertical separator */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 bg-orange-300 w-1" />
          <label className="text-sm font-bold mb-1 pl-4 text-opacity-50">
            I want to sell Minima for
          </label>
          <div className="grid grid-cols-[1fr_auto] items-center pl-4">
            <input
              id="sell"
              type="number"
              onChange={handleChange}
              onFocus={() => setF(true)}
              onBlur={() => setF(false)}
              value={_def.sell}
              className="bg-slate-300 dark:bg-[#1B1B1B] font-mono rounded focus:outline-none truncate"
              placeholder="0"
            />
            <span className="text-[12px] font-bold">WMINIMA</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {_def && !_def.enable && (
          <button onClick={updateBook} disabled={!isButtonEnable} className="hover:bg-teal-600 w-full bg-teal-500 text-[#1B1B1B] font-bold disabled:bg-opacity-20">
            Enable
          </button>
        )}

        {_def && _def.enable && (
          <div className="w-full grid grid-cols-[1fr_minmax(0,_100px)] gap-1">
            <button onClick={updateBook} disabled={!isButtonEnable} className="hover:bg-teal-600 bg-teal-500 text-[#1B1B1B] font-bold disabled:bg-opacity-20">
              Update
            </button>
            <button onClick={disableBook} className="hover:bg-opacity-90 bg-red-500 text-[#1B1B1B] font-bold">
              Disable
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WrappedPool;
