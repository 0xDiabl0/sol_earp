use anchor_lang::prelude::*;

declare_id!("pvr1XUXRXAzddCecgyvMxb88NZsAXh69d4uRdsyc1Kf");

#[program]
pub mod publishincentive {
    use super::*;


    pub fn initialize(_ctx: Context<Initialize>, acc_bump : u8, 
                business_id : String, incentive_id : String, user_id : String) -> ProgramResult {

        _ctx.accounts.reward_account.bump = acc_bump;
        _ctx.accounts.reward_account.business_id = business_id;
        _ctx.accounts.reward_account.user_id = user_id;
        _ctx.accounts.reward_account.incentive_id = incentive_id;
        _ctx.accounts.reward_account.disbursal_done = false;

        Ok(())
    }


    pub fn pushincentives(ctx: Context<PushIncentives>, data : u32) -> ProgramResult {
    
        //copying Vector data to account
        let reward_account = &mut ctx.accounts.reward_account;
        let copy = data.clone();
        reward_account.user_reward = copy;

        Ok(())
    }



    pub fn disburse(ctx: Context<PushIncentives>, user_id : String) -> ProgramResult {
        
        //harcoded userReward PDA : 56CcmTNYpBBroJKu5ZooKDWvLo6CtVc3vheKd4uorF8o
        //user_id = "56CcmTNYpBBroJKu5ZooKDWvLo6CtVc3vheKd4uorF8o".to_string();
        
        
        let reward_account = &mut ctx.accounts.reward_account;
        if (reward_account.disbursal_done == false) {

            //disbursal not done
            //Calling the CPI to execute transfer and update records
            
            
        }else {
            
            msg!("Disbirsal done already");
        }


        Ok(())
    }

}

#[derive(Accounts)]
#[instruction(acc_bump: u8, business_id:String, incentive_id:String, user_id:String)]
pub struct Initialize<'info> {

    //verify PDA account for each User
    #[account(init, seeds = [b"usrReward".as_ref()], 
        bump = acc_bump, payer = user, space = 2048)]
    reward_account: Account<'info, BaseAccount>,
    user: Signer<'info>,
    system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct PushIncentives<'info> {

    //marking the account as mutable
    #[account(mut)]
    pub reward_account: Account<'info, BaseAccount>,
}

//This is the base data-structure used in PDA created
#[account]
#[derive(Default)]
pub struct BaseAccount {
    pub user_reward : u32,
    pub bump : u8,
    pub business_id : String,
    pub user_id : String,
    pub incentive_id : String,
    pub disbursal_done : bool,
}