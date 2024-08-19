import { ChangeEventHandler } from "react";

interface IProps {
  selectedOption: "wminima" | "usdt";
  handleOptionChange: ChangeEventHandler<HTMLInputElement>;
}
const SelectPool = ({ selectedOption, handleOptionChange }: IProps) => {
  return (
    <div className="flex-1 flex flex-col">
      {/* Custom Radio Buttons */}
      <div className="mb-1">
        <fieldset>
          <div className="grid grid-cols-2 gap-2 md:mx-16">
            <label
              className={`tracking-widest text-center gap-1 justify-center text-sm p-4 rounded-full sm:flex-row flex items-center transition-all ${
                selectedOption === "wminima"
                  ? "bg-black dark:bg-black font-bold"
                  : "bg-neutral-200 dark:bg-[#1B1B1B]"
              }`}
            >
              <input
                type="radio"
                name="option"
                value="wminima"
                checked={selectedOption === "wminima"}
                onChange={handleOptionChange}
                className="hidden"
              />
              <span>
                <img
                  src="./assets/wtoken.svg"
                  alt="wrapped"
                  className="w-[24px] h-[24px] rounded-full"
                />
              </span>
              <span
                className={`ml-0 md:ml-2 ${
                  selectedOption === "wminima" ? "text-white" : ""
                }`}
              >
                wMinima
              </span>
            </label>
            <label
              className={`tracking-widest text-center gap-1 justify-center text-sm rounded-full sm:flex-row p-4 flex items-center transition-all ${
                selectedOption === "usdt"
                  ? "bg-black dark:bg-black font-bold"
                  : "bg-neutral-200 dark:bg-[#1B1B1B]"
              }`}
            >
              <input
                type="radio"
                name="option"
                value="usdt"
                checked={selectedOption === "usdt"}
                onChange={(e) => {
                  handleOptionChange(e);
                }}
                className="hidden"
              />
              <span>
                <img
                  src="./assets/tether.svg"
                  alt="wrapped"
                  className="w-[24px] h-[24px] rounded-full"
                />
              </span>
              <span
                className={`ml-0 md:ml-2 ${
                  selectedOption === "usdt" ? "text-white" : ""
                }`}
              >
                USDT
              </span>
            </label>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default SelectPool;
