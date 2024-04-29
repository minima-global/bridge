import { ReactNode, useEffect, useRef, useState } from "react";
import { config, useSpring, animated } from "react-spring";

type Props = {
  extraClass?: string;
  features: ReactNode[];
};
const UpdateButton = ({ extraClass, features }: Props) => {
  const [active, setActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const springProps = useSpring({
    opacity: active ? 1 : 0,
    transform: active ? "translateY(0%)" : "translateY(-50%)",
    config: config.stiff,
  });

  const handleButtonClick = () => {
    setActive((prevState) => !prevState);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div ref={dropdownRef} className="relative inline-block w-full">
        <button
          type="button"
          id="options-menu"
          aria-haspopup="true"
          aria-expanded="true"
          onClick={handleButtonClick}
          className={`bg-white w-full hover:bg-opacity-90 ${
            extraClass ? extraClass : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[24px] height-[24px] mx-auto"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {active && (
          <animated.div
            style={springProps}
            className="origin-top-right z-[50] w-full absolute right-0 mt-2 rounded-md shadow-lg"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <ul className="bg-white rounded-sm">{features}</ul>
          </animated.div>
        )}
      </div>
    </>
  );
};

export default UpdateButton;
