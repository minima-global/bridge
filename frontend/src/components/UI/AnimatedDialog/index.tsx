import { ReactElement, useEffect, useState } from "react";
import { animated, useTransition } from "react-spring";
import { createPortal } from "react-dom";

interface AnimatedDialogProps {
  children: ReactElement;
  display: boolean;
  dismiss: () => void;
  extraClass?: string;
  noRest?: boolean;
  up?: number;
}

const AnimatedDialog = ({
  children,
  display,
  extraClass,
  noRest,
  dismiss,
  up,
}: AnimatedDialogProps) => {
  const [show, setShow] = useState(display);
  const [zIndex] = useState(22);

  // Update the show state based on display and noRest
  useEffect(() => {
    if (display) {
      setShow(true);
      document.body.classList.add("overflow-hidden");
    } else if (!noRest) {
      // Wait for animation to finish before hiding
      const timeout = setTimeout(() => setShow(false), 300); // 300ms matches the animation duration
      return () => clearTimeout(timeout);
    } else {
      setShow(false);
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [display, noRest]);

  // Define transitions
  const transitions = useTransition(display, {
    from: { opacity: 0, transform: "translateY(100%) scale(1)" },
    enter: { opacity: 1, transform: "translateY(0%) scale(1)" },
    leave: { opacity: 0, transform: "translateY(150%) scale(1)" },
    config: { duration: 300 }, // Match the duration of the timeout
  });

  return (
    <>
      {show &&
        createPortal(
          transitions((styles, item) =>
            item ? (
              <animated.div
                style={{ ...styles, zIndex: !up ? zIndex + 1 : up + 1 }}
                className={`fixed top-[80px] right-0 left-0 bottom-0 md:grid md:grid-cols-[1fr_minmax(0,_560px)_1fr] h-full z-[${!up ? zIndex + 2 : up + 1}]`}
              >
                <div />
                <div className={`h-full mx-4 ${extraClass || ""}`}>
                  {children}
                </div>
                <div />
              </animated.div>
            ) : null,
          ),
          document.body,
        )}

      {show &&
        createPortal(
          <div
            onClick={dismiss}
            style={{ zIndex: !up ? zIndex - 1 : up - 2 }}
            className={`fixed backdrop-blur-sm left-0 right-0 top-0 bottom-0 bg-neutral-200/90 dark:bg-black/90`}
          />,
          document.body,
        )}
    </>
  );
};

export default AnimatedDialog;
