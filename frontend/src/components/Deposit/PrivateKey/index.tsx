import { useContext, useState } from "react";

import * as utils from "../../../utils";
import { appContext } from "../../../AppContext";

const PrivateKey = ({ fullAddress = false }) => {
  const { _generatedKey } = useContext(appContext);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    utils.copyToClipboard(_generatedKey);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const handleDoubleClick = () => {
    handleCopy();
  };

  // Event handler for key down
  const handleKeyDown = (event) => {
    // Check if Ctrl key and C key are pressed simultaneously
    if ((event.ctrlKey || event.metaKey) && event.key === "c") {
      handleCopy();
    }
  };

  return (
    <div
      style={{
        appearance: "none",
        padding: 0,
        border: 0,
        outline: 0,
        cursor: "pointer",
      }}
      className="mx-auto text-center relative dark:text-black"
    >
      {fullAddress && (
        <textarea
          rows={3}
          readOnly
          onClick={handleCopy}
          onKeyDown={handleKeyDown}
          onDoubleClick={handleDoubleClick}
          className="p-2 text-left font-bold rounded-lg focus:bg-teal-200 pr-10 break-all focus:outline-teal-600 dark:focus:text-black px-3 text-sm w-full bg-violet-300"
          value={_generatedKey ? _generatedKey : "N/A"}
        />
      )}
      <svg
        onInput={() => {}}
        className="absolute right-2 top-2"
        style={{
          color: "#0809ab",
          position: "absolute",
          top: 25,
          right: 10,
          strokeDasharray: 50,
          strokeDashoffset: copied ? -50 : 0,
          transition: "all 300ms ease-in-out",
          opacity: copied ? 0 : 1,
        }}
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        strokeWidth="3.5"
        stroke="#2c3e50"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
        <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
      </svg>
      <svg
        onClick={handleCopy}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          color: "black",
          position: "absolute",
          top: 25,
          right: 8,
          strokeDasharray: 50,
          strokeDashoffset: copied ? 0 : -50,
          transition: "all 300ms ease-in-out",
        }}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="3"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M5 12l5 5l10 -10" />
      </svg>
    </div>
  );
};

export default PrivateKey;
