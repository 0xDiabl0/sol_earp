import { WalletMultiButton } from "@solana/wallet-adapter-ant-design";
import { Button, Col, Row } from "antd";
import React, { useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { TokenIcon } from "../../components/TokenIcon";
import { useConnectionConfig } from "../../contexts/connection";
import { useMarkets } from "../../contexts/market";
import { useUserBalance, useUserTotalBalance } from "../../hooks";
import { WRAPPED_SOL_MINT } from "../../utils/ids";
import { formatUSD } from "../../utils/utils";
import { useConnection } from "../../contexts/connection";
import { useWallet } from "@solana/wallet-adapter-react";
import { Listings } from "../../components/Listings";


export const HomeView = () => {

  // const { marketEmitter, midPriceInUSD } = useMarkets();
  // const { tokenMap } = useConnectionConfig();
  // const SRM_ADDRESS = "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt";
  // const SRM = useUserBalance(SRM_ADDRESS);
  // const SOL = useUserBalance(WRAPPED_SOL_MINT);
  // const { balanceInUSD: totalBalanceInUSD } = useUserTotalBalance();
  const { connected } = useWallet();
    
  // useEffect(() => {
  //   const refreshTotal = () => {};

  //   const dispose = marketEmitter.onMarket(() => {
  //     refreshTotal();
  //   });

  //   refreshTotal();

  //   return () => {
  //     dispose();
  //   };
  // }, [marketEmitter, midPriceInUSD, tokenMap]);

  return (

  <Row>

{ !connected ? 
    <Row gutter={[16, 16]} align="middle">
      <Col span={12}>
        <h1>Connect your Solana wallet to proceed!</h1>
      </Col>
      <Col span={12}>
        <WalletMultiButton type="primary" />
        <br/><br/>
        <i>Recommended to install Phantom</i>
      </Col>
    </Row>
: 

    <Row gutter={[16, 16]} align="middle">
      <Col span={24}>
        <h1>Welcome to 'Beta (β) shoppe' : Flagship dApp of EAR Protocol </h1>
        <i>We will make Use-To-Earn mainstream.</i>
      </Col>
    </Row>

}

    <Row gutter={[16, 16]} align="middle">
      <Col span={24}>
        <div className="builton" />
      </Col>
    </Row>

  </Row>

  );
};

