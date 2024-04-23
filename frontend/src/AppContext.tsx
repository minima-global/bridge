import { createContext, useRef, useEffect, useState } from "react";

export const appContext = createContext({} as any);

interface IProps {
  children: any;
}
const AppProvider = ({ children }: IProps) => {
  const loaded = useRef(false);

  const [_currentNavigation, setCurrentNavigation] = useState("balance");

  

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      (window as any).MDS.init((msg: any) => {
        if (msg.event === "inited") {
          // do something Minim-y
        }
      });
    }
  }, [loaded]);



  return (
    <appContext.Provider
      value={
        {
          _currentNavigation,
          setCurrentNavigation
        }
      }
    >
      {children}
    </appContext.Provider>
  );
};

export default AppProvider;
