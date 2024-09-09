import { useContext } from "react";
import { appContext } from "../../AppContext";

import "@theme-toggles/react/css/Around.css";
import { Around } from "@theme-toggles/react";

const AppThemeSwitch = () => {
  const { isDarkMode, setIsDarkMode } = useContext(appContext);

  // Handler for the switch change event
  const handleSwitchChange = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div
      onClick={handleSwitchChange}
      className="bg-neutral-100 hover:cursor-pointer hover:bg-neutral-50 dark:bg-[#1B1B1B] dark:hover:bg-[#2C2C2C] rounded-full flex items-center p-2 pr-3 shadow-lg"
    >
      <Around
        toggled={isDarkMode}
        onToggle={handleSwitchChange}
        className="focus:outline-none p-0"
        duration={750}
      />
      <p className="text-xs ml-2">{isDarkMode ? "Dark" : "Light"}</p>
    </div>
  );
};

export default AppThemeSwitch;
