import { useEffect, useState } from "react";
import LightIcon from "../UI/Icons/LightIcon";
import DarkIcon from "../UI/Icons/DarkIcon";

const AppThemeSwitch = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize state based on localStorage
    return localStorage.getItem("dark-mode") === "true";
  });

  useEffect(() => {
    // Apply or remove the 'dark' class on the document element
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dark-mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dark-mode", "false");
    }
  }, [isDarkMode]); // Re-run effect when isDarkMode changes

  // Handler for the switch change event
  const handleSwitchChange = (e) => {
    setIsDarkMode(e.target.checked);
  };

  return (
    <div className="">
      <input
        type="checkbox"
        id="light-switch"
        className="light-switch sr-only"
        checked={isDarkMode}
        onChange={handleSwitchChange}
      />
      <label className="relative cursor-pointer" htmlFor="light-switch">
        <span className="dark:hidden text-black">
          <LightIcon size={24} />
        </span>
        <span className="hidden dark:block text-violet-500 opacity-90"><DarkIcon size={24} /></span>
        <span className="sr-only">Switch to light / dark version</span>
      </label>
    </div>
  );
};

export default AppThemeSwitch;
