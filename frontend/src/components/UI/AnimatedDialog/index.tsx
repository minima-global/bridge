import { useSpring, animated, config } from "react-spring";
import { createPortal } from "react-dom";
import Dialog from "../Dialog";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  extraClass: string;
  position: string;
  children: any;
  dialogStyles?: string;
  animationStyle?: string;
}
const AnimatedDialog = ({
  isOpen,
  onClose,
  extraClass,
  position,
  children,
  dialogStyles,
  animationStyle
}: Props) => {
  const springProps = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config[animationStyle ? animationStyle : "wobbly"],
  });

  return (
    <>
      {isOpen &&
        createPortal(
          <Dialog extraClass={extraClass} dismiss={onClose}>
            <div className={`h-full grid ${position}`}>
              <animated.div style={springProps}>
                <div
                  onClick={(e) => e.stopPropagation() }
                  className={`bg-white shadow-lg shadow-slate-300 dark:shadow-none dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto ${dialogStyles}`}
                >
                  {children}
                </div>
              </animated.div>
            </div>
          </Dialog>,
          document.body
        )}
    </>
  );
};

export default AnimatedDialog;
