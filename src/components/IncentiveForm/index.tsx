import React, { useState } from 'react';
// import { render } from "react-dom";
// import { useFormik } from 'formik';
import { Button, Col, Row } from "antd";
// import { blob } from 'stream/consumers';
import { useWallet } from "@solana/wallet-adapter-react";
import { IncentiveProgram } from './IncentiveProgram';



// const validate = (values: { 
//     // firstName: string | any[]; 
//     incentiveConfigFile: string }) => {
    
//     const errors = {incentiveConfigFile:''};

//     // if (!values.firstName) {
//     //   errors.firstName = 'Required';
//     // } else if (values.firstName.length > 15) {
//     //   errors.firstName = 'Must be 15 characters or less';
//     // }
  
//     if (!values.incentiveConfigFile) {
//       errors.incentiveConfigFile = 'Required';
//     } 
  
//     return errors;
// };   

export const IncentiveForm = () => {

    const wallet = useWallet();

    // const uploadstate = false;
    const [uploadstate, setUploadstate] = useState(false);
    const [fileSelected, setFileSelected] = React.useState<File>() ;
    const [parsedIncentive, setParsedIncentive] = useState<object[]>([]); 
    const [finalIncentive, setFinalIncentive] = useState<any>({}); 
    var fIncen:any = {};

    const handleIncentiveChange = function (e: React.ChangeEvent<HTMLInputElement>) {
        const fileList = e.target.files;

        if (!fileList) return;
        setFileSelected(fileList[0]);
    };


    const moveIncentiveFile = (formData : FormData) => fetch("http://localhost:3001/upload-incentive", {
                                            body: formData,
                                            // mode: 'no-cors',
                                            method: "POST"
                                        })
                                        .then(res => (res.ok ? res : Promise.reject(res)))
                                        .then(res => res.json());

    const uploadFile = async function (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {

        const formData = new FormData();

        if (!wallet) 
            throw new Error("wallet null");

        if (wallet.publicKey)
            formData.append("pubkey", wallet.publicKey.toBase58());    

        if (fileSelected)
            formData.append("incentive", fileSelected, fileSelected.name);

        // console.log(formData);

        try {
            // console.log("about to move file");
            var r1 = await moveIncentiveFile(formData);
            console.log(r1);
            
            if (r1) {
                setUploadstate(true);
                // setParsedIncentive(r1);
                setFinalIncentive(r1);
                
            }            
        }
        catch (err) {
            setUploadstate(false);
            console.log("err");console.log(err);
        }
        
    };


    const publishIncentive = async function (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
        
    };

    return (

    <Row>

        <Row gutter={[16, 16]} align="middle" className="pad5 box">

            <Col span="10">
                    
                <label htmlFor="incentiveConfigFile">Incentive Config File</label>
                <br/>
                <a href='/EAR_incentive_template.xlsx' download>Click to download tempate file</a>

            </Col>  

            <Col span="14">
                 
                {/* <form> */}
                {/* <label htmlFor="incentive">Incentive file</label> */}
                    <br/><br/>
                    <input
                    accept=".xls,.xlsx"
                    id="incentive"
                    name="incentive"
                    type="file"
                    multiple={false}
                    onChange={handleIncentiveChange}
                    />
                <br/><br/>
                
                
                {/* </form> */}
            </Col>

            <Col span="24">
                <Button className="ant-btn" onClick={uploadFile} >
                    Upload
                </Button>

                <br/><br/>
            </Col>

        </Row>

        <Row gutter={[16, 16]} align="middle" className="pad5">
            
        </Row>

        <Row gutter={[16, 16]} align="middle" className={uploadstate?'show':'hide'}>
            
            <div className="font13">
                File got uploaded successfully. 
            </div>

            <Row gutter={[16, 16]} align="middle">
                {((Object.entries(finalIncentive)).length) ? 
                <IncentiveProgram 
                    title={finalIncentive.title}  
                    budget_usd={finalIncentive.budget_usd}  
                    ea_ratio={finalIncentive.ea_ratio}  
                    valid_from={finalIncentive.valid_from}  
                    valid_to={finalIncentive.valid_to}  
                    reward_disbursal_freq={finalIncentive.reward_disbursal_freq}  
                    reward_lock_days={finalIncentive.reward_lock_days}  
                />

                :
                ""
                }

            </Row>

            <Row gutter={[16, 16]} align="middle">
                <Col span='24'>
                    <Button className='ant-btn' onClick={publishIncentive}>
                        Publish on-Chain
                    </Button>
                    <br/><br/>
                </Col>
            </Row>
             
        </Row>

    </Row>

    );





    // Pass the useFormik() hook initial form values and a submit function that will
    // be called when the form is submitted
    // const formik = useFormik({

    //   initialValues: {
    //     // incentiveConfigFile: null
    //   },

    //   onSubmit: values => {

    //     console.log(values);

    //     var data = new FormData();
    //     // data.append('formdata',formik.values);
    //     // if (values)
    //     fetch("http://localhost:3001/upload-incentive", {
    //         body: data,
    //         mode: 'no-cors',
    //         method: "POST"
    //     });
    //     //TODO : Pass to BE and smart contract
    //   },

    // });

    // return (
    //   <form onSubmit={formik.handleSubmit} encType="multipart/form-data" >

    //     {/* <Row gutter={[16, 16]} align="middle" className="pad5">
    //         <Col span="8">
    //             <label htmlFor="firstName">First Name</label>
    //         </Col>  

    //         <Col span="8">
    //             <input
    //             id="firstName"
    //             name="firstName"
    //             type="text"
    //             onChange={formik.handleChange}
    //             value={formik.values.firstName}
    //             className="blacktext"
    //             />
                
    //             {formik.errors.firstName ? <div>{formik.errors.firstName}</div> : null}

    //         </Col>
    //     </Row> */}


    //     <Row gutter={[16, 16]} align="middle" className="pad5"> 
    //         <Col span="8">
                
    //             <label htmlFor="incentiveConfigFile">Incentive Config File</label>

    //             <br/><br/>
    //             <a href='/EAR_incentive_template.xlsx' download>Click to download tempate file</a>

    //         </Col>  

    //         <Col span="8">
    //             <input
    //             id="incentiveConfigFile"
    //             name="incentiveConfigFile"
    //             type="file"
    //             onChange=
    //             //{formik.handleChange}
                
    //             {(event) => {
    //                 if (event.currentTarget.files) 
    //                     formik.setFieldValue("incentiveConfigFile", event.currentTarget.files[0]);
    //               }} 
                
    //             />

    //             {/* {formik.errors.incentiveConfigFile ? <div>{formik.errors.incentiveConfigFile}</div> : null} */}

    //         </Col>
    //     </Row>
        
    //     <Row gutter={[16, 16]} className="pad5">
    //         <Col span="8"></Col>
    //         <Col span="8">
    //             <button type="submit" className="ant-btn">Submit</button>
    //         </Col>
    //     </Row>

    //   </form>
    // );
  };
