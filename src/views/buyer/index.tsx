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


export const BuyerView = () => {

  const { marketEmitter, midPriceInUSD } = useMarkets();
  const { tokenMap } = useConnectionConfig();
  const SRM_ADDRESS = "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt";
  const SRM = useUserBalance(SRM_ADDRESS);
  const SOL = useUserBalance(WRAPPED_SOL_MINT);
  const { balanceInUSD: totalBalanceInUSD } = useUserTotalBalance();
  const { connected } = useWallet();
    
  useEffect(() => {
    const refreshTotal = () => {};

    const dispose = marketEmitter.onMarket(() => {
      refreshTotal();
    });

    refreshTotal();

    return () => {
      dispose();
    };
  }, [marketEmitter, midPriceInUSD, tokenMap]);

  return (

    <Row>

      <Row gutter={[16, 16]} align="middle">
        <Col span={24}>
          <h1>Welcome to 'Beta (β) shoppe' : Flagship dApp of EAR Protocol </h1>
          <i>Browse through the listings below and Buy from our carefully chosen collection to reap rewards for life-time.</i>
        </Col>
      </Row>

      <Row gutter={[16, 16]} align="middle">

        <Listings price={0.5} destAddress="2AqMfGTTixHKnzzTSeiGcftpguak5rZBL4YRrtUdgvSY" />

        <Listings price={1.5} destAddress="JBhN4h6yT72AbeFVMt4BadGZTPvYQEaAuHC2k4XT2wfY" />

        <Listings price={1.5} destAddress="JBhN4h6yT72AbeFVMt4BadGZTPvYQEaAuHC2k4XT2wfY" />

      </Row>


      <Row gutter={[16, 16]} align="middle">
        <Col span={24}>
          {/* <h2>Your Balances ({formatUSD.format(totalBalanceInUSD)}):</h2> */}
          <h2>
            SOL: {SOL.balance} ({formatUSD.format(SOL.balanceInUSD)})
          </h2>
          {/* </h2> */}
        </Col>

        <Col span={12}>
          <WalletMultiButton type="ghost" />
        </Col>
        <Col span={12}>
          <Link to="/faucet">
            <Button>Faucet</Button>
          </Link>
        </Col>
        <Col span={24}>
          <div className="builton" />
        </Col>
      </Row>

    </Row>
  );
};

// var h = React.create
function CollectPayments(arg0: number, arg1: string): void {

  const connection = useConnection();
  const { publicKey } = useWallet();
  console.log("arg 0:"+arg0+":arg 1:"+arg1);
  if (!arg1 || isNaN(arg0))
    throw new Error("Params for buying not correct.");

  try {
    if (!publicKey) {
      return;
    }
    // await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL);
    // notify({
    //   message: LABELS.ACCOUNT_FUNDED,
    //   type: "success",
    // });
  } catch (error) {
    // notify({
    //   message: LABELS.AIRDROP_FAIL,
    //   type: "error",
    // });
    console.error(error);
  }

};

