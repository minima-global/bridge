import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import AppProvider from "./AppContext.tsx";
import { WalletContextProvider } from "./providers/WalletProvider/WalletProvider.tsx";
import { TokenStoreContextProvider } from "./providers/TokenStoreProvider/index.tsx";
import SetUpJsonRPC from "./components/SetUpJsonRPC/index.tsx";

import { RouterProvider, createHashRouter } from "react-router-dom";
import Secret from "./components/Secret/index.tsx";
import { ToastContainer } from "react-toastify";
import Favorites from "./components/Favorites/index.tsx";
import NotFound from "./components/NotFound/index.tsx";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: "fav",
        element: <Favorites />,
        errorElement: <NotFound />,
      },
    ],
  },
  {
    path: "/secret",
    element: <Secret />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <WalletContextProvider>
        <TokenStoreContextProvider>
          <ToastContainer />
          <SetUpJsonRPC />
          <RouterProvider router={router} />
        </TokenStoreContextProvider>
      </WalletContextProvider>
    </AppProvider>
  </React.StrictMode>,
);
