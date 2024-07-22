import { ReactNode } from "react";

interface IProps {
    children: ReactNode;
    extraClass?: string;
}

const Activity = ({ children, extraClass }:IProps) => {
  return (
    <div>
      <p className={`${extraClass && extraClass} text-black font-bold tracking-wider dark:text-white mx-auto text-xs`}>
        {children}
      </p>
    </div>
  );
};

export default Activity;
