import { HashRouter, Route, Switch } from "react-router-dom";
import React, { useMemo } from "react";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { ConnectionProvider } from "./contexts/connection";
import { AccountsProvider } from "./contexts/accounts";
import { MarketProvider } from "./contexts/market";
import { AppLayout } from "./components/Layout";

import { FaucetView, HomeView } from "./views";
import {
  getLedgerWallet,
  getMathWallet,
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
  getTorusWallet,
} from "@solana/wallet-adapter-wallets";
import { BuyerView } from "./views/buyer";
import { SellerView } from "./views/seller";

export function Routes() {
  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolflareWallet(),
      getTorusWallet({
        options: {
          // TODO: Get your own tor.us wallet client Id
          clientId:
            "BOM5Cl7PXgE9Ylq1Z1tqzhpydY0RVr8k90QQ85N7AKI5QGSrr9iDC-3rvmy0K_hF0JfpLMiXoDhta68JwcxS1LQ",
        },
      }),
      getLedgerWallet(),
      getSolongWallet(),
      getMathWallet(),
      getSolletWallet(),
    ],
    []
  );

  return (
    <HashRouter basename={"/"}>
      <ConnectionProvider>
        <WalletProvider wallets={wallets} autoConnect>
          {/* <AccountsProvider> */}
            {/* <MarketProvider> */}
              <AppLayout>
                <Switch>
                  <Route exact path="/" component={() => <HomeView />} />
                  <Route exact path="/buyer" component={() => <BuyerView />} />
                  <Route exact path="/seller" component={() => <SellerView />} />
                  <Route exact path="/faucet" children={<FaucetView />} />
                  {/* <Route exact path="/anchortest" children={<AnchortestView />} /> */}
                </Switch>
              </AppLayout>
              
            {/* </MarketProvider> */}
          {/* </AccountsProvider> */}
        </WalletProvider>
      </ConnectionProvider>
    </HashRouter>
  );
}
