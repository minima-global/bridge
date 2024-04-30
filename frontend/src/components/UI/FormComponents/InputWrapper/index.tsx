import { ReactNode, useState } from "react";

interface Props {
  label: string;
  inputProps: any;
  action?: ReactNode;
  wrapperStyle?: string;
}

const InputWrapper = ({ label, inputProps, action, wrapperStyle }: Props) => {
  const [_f, setF] = useState(false);
  
    const hasAction = !!action;

  return (
    <div
      className={`${wrapperStyle} grid ${_f  ? "outline dark:outline-yellow-300" : ""} ${
        hasAction ? "grid-cols-[1fr_auto]" : "grid-cols-1"
      } rounded bg-gray-100 bg-opacity-50 dark:bg-[#1B1B1B]`}
    >
      <div className="px-4 py-4">
        <label className={`${_f  ? 'dark:text-yellow-300' : ''} font-bold text-sm dark:opacity-70`}>{label}</label>
        <input
          {...inputProps}
          className="bg-gray-100 font-mono bg-opacity-50 dark:bg-[#1B1B1B] truncate w-full focus:outline-none"
          onBlur={() => setF(false)}
          onFocus={() => setF(true)}
        />
      </div>
      {action}
    </div>
  );
};

export default InputWrapper;
