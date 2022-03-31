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
// import { Formik, Form, Field, ErrorMessage } from 'formik';
import { IncentiveForm } from "../../components/IncentiveForm";



export const SellerView = () => {

  const { connected } = useWallet();

  return (

    <Row>

{ !connected ? 
      <Row gutter={[16, 16]} align="middle">
        <Col span={24}>
          <h1>Connect your Solana wallet babe!</h1>
          <i>Recommend Phantom</i>
        
          <WalletMultiButton type="ghost" />
        
        </Col>
      </Row>
: null}

      <Row gutter={[16, 16]} align="middle">
        <Col span={24}>
          <h1>Welcome to Business portal of EAR Protocol </h1>
          <i></i>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align="middle">

        <Col span={12}>
          
          <Link to="/faucet">
            <Button>Add Incentive Program</Button>
          </Link>
        </Col>

        <Col span={12}>
          <h2>Incentive Form</h2>

          <IncentiveForm />

        </Col>

      </Row>


      <Row gutter={[16, 16]} align="middle">
        
        <Col span={24}>
          <div className="builton" />
        </Col>
      </Row>

    </Row>
  );
};


