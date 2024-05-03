import { ReactElement } from "react";

interface ComponentProps {
  children: ReactElement;
  dismiss?: () => void;
  extraClass?: string;
}

const Dialog = ({ children, dismiss, extraClass }: ComponentProps) => {
  return (
    <div className={`fixed left-0 right-0 bottom-0 top-0 grid grid-cols-[1fr_minmax(0,_560px)_1fr] ${extraClass ? extraClass : ''}`}>
      <div
        onClick={dismiss}
        id="backdrop"
        className="backdrop-blur-sm fixed left-0 right-0 top-0 bottom-0"
      />
      <div />
      <div onClick={dismiss} className="relative z-[21] h-max">{children}</div>
      <div />
    </div>
  );
};

export default Dialog;
