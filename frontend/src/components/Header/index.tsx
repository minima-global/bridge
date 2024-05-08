import { useContext } from "react";
import { appContext } from "../../AppContext";
import MainActivity from "../MainActivity";

const Header = () => {
  const { promptSettings } = useContext(appContext);
  return (
    <>
      <header className="grid grid-cols-2 px-2">
        <div>
          <span></span>
          <h6>Bridge/MiniSwap</h6>
        </div>
        <div className="flex justify-end">
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center"
          >
            <MainActivity />
            
            <svg
              onClick={promptSettings}
              className="hover:cursor-pointer hover:animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#000000"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                className="fill-white dark:fill-black dark:opacity-80"
                d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z"
                strokeWidth="0"
                fill="currentColor"
              />
            </svg>

            
          </div>
        </div>
      </header>      
    </>
  );
};

export default Header;
