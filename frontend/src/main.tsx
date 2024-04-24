import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import AppProvider from "./AppContext.tsx";
import { WalletContextProvider } from "./providers/WalletProvider/WalletProvider.tsx";
import { TokenStoreContextProvider } from "./providers/TokenStoreProvider/index.tsx";
import SetUpJsonRPC from "./components/SetUpJsonRPC/index.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <WalletContextProvider>
        <TokenStoreContextProvider>
          <SetUpJsonRPC />
          <App />
        </TokenStoreContextProvider>
      </WalletContextProvider>
    </AppProvider>
  </React.StrictMode>
);
