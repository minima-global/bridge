import { useEffect, useRef, useState } from "react";
import CaretIcon from "../../../../UI/Icons/CaretIcon";
import { animated, config, useSpring } from "react-spring";

interface Props {
  setToken: (id: string) => void;
  token: string;
}
const EthereumTokenSelect = ({ setToken, token }: Props) => {
  const [active, setActive] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const springProps = useSpring({
    opacity: active ? 1 : 0,
    transform: active ? "translateY(0%)" : "translateY(-50%)",
    config: config.stiff,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const promptDropdown = () => {
    setActive((prevState) => !prevState);
  };

  return (
    <div
      onClick={promptDropdown}
      ref={dropdownRef}
      className="relative bg-white dark:bg-black dark:bg-opacity-10 p-2 pl-5 grid grid-cols-[1fr_auto] items-center hover:bg-opacity-50"
    >
      <div className="flex flex-col pr-2 justify-center items-center">
        <img
          alt="token-icon"
          src={
            token === "WMINIMA" ? "./assets/token.svg" : "./assets/tether.svg"
          }
          className="w-[30px] h-[30px] rounded-full"
        />
        <p className="text-xs font-bold pt-1">{token}</p>
      </div>

      {active && (
        <animated.div
          style={springProps}
          className="origin-top-right z-[50] w-[105px] absolute right-0 top-[70px] mt-2 rounded-r-sm shadow-lg bg-white dark:bg-opacity-100 dark:bg-[#1B1B1B]"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <ul className="grid grid-rows-2 divide-y divide-teal-100">
            <li onClick={() => setToken("USDT")} className="hover:bg-gray-200 hover:dark:bg-black px-2 cursor-pointer grid grid-cols-[auto_1fr] items-center gap-1">
              <img
                alt="token-icon"
                src={"./assets/tether.svg"}
                className="w-[22px] h-[22px] rounded-full"
              />
              <p className="text-xs font-bold">Tether</p>
            </li>
            <li onClick={() => setToken("WMINIMA")} className="px-2 hover:bg-gray-200 hover:dark:bg-black cursor-pointer py-3 grid grid-cols-[auto_1fr] items-center gap-1">
              <img
                alt="token-icon"
                src={"./assets/token.svg"}
                className="w-[22px] h-[24px] rounded-full"
              />
              <p className="text-xs font-bold">wMinima</p>
            </li>
          </ul>
        </animated.div>
      )}

      <div className="flex items-center justify-center">
        <CaretIcon />
      </div>
    </div>
  );
};

export default EthereumTokenSelect;
