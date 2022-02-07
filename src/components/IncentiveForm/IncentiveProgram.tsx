import { Button, Col, Row } from "antd";
import { ReactElement } from "react";


export const IncentiveProgram = (props: { 
    title : string, 
    budget_usd : number, 
    ea_ratio : number, 
    valid_from : string, 
    valid_to : string, 
    reward_disbursal_freq : string, 
    reward_lock_days: number
}) => {

    const { title, budget_usd, ea_ratio, valid_from, valid_to, reward_disbursal_freq, reward_lock_days } = props;

    return(

        <Row className='box'>
            <Col span='24'>
                <h3>Review Incentive Program</h3>
            </Col>
            <Col span="3"></Col>
            <Col span="10">
                <Row>Title : {title}</Row>
                <Row>Budget(USD) : {budget_usd}</Row>
                <Row>Early adopter allocation(%) : {ea_ratio}</Row>
                <Row>Program starts on : {valid_from}</Row>
                <Row>Program ends on : {valid_to}</Row>
                <Row>Reward Disbursal frequency : {reward_disbursal_freq}</Row>
                <Row>Reward locking period (days) : {reward_lock_days}</Row>
                <Row><br/></Row>
            </Col>
            
        </Row>

    );
}
