use anchor_lang::prelude::*;
use anchor_spl::{
    token::{self, CloseAccount, Mint, SetAuthority, TokenAccount, Transfer, Token},
    associated_token::AssociatedToken,
};
// use anchor_spl::associated_token::;
use spl_token::instruction::AuthorityType;

declare_id!("ATsznkhxzb6yaGpLGNYeVtkhCaWtJysbDv4NwzAkRnsf");


#[program]
pub mod disbursereward {
    use super::*;

    const ESCROW_PDA_SEED: &[u8] = b"escrow";

    //create escrew to hold tokens from business for incentive program
    pub fn initialize(ctx : Context<Initialize>, _vault_account_bump:u8) -> ProgramResult {

        ctx.accounts.escrow_account.initializer_key = *ctx.accounts.initializer.key;

        ctx.accounts.escrow_account.initializer_token_account = 
            *ctx.accounts.initializer_token_account.to_account_info().key;


        // let (vault_authority, _vault_authority_bump) = 
        //     Pubkey::find_program_address(&[ESCROW_PDA_SEED], ctx.program_id);

        // token::set_authority(
        //     ctx.accounts.into_set_authority_context(),
        //     AuthorityType::AccountOwner,
        //     Some(vault_authority),
        // )?;

        token::transfer(
            ctx.accounts.into_transfer_to_pda_context(),
            ctx.accounts.initializer_token_account.amount,
        )?;

        
        Ok(())
    }


    //Close all accounts but more importantly, return all Tokens to Initializer (business)
    pub fn cancel(ctx:Context<Cancel>) -> ProgramResult {

        let (_vault_authority, vault_authority_bump) =
            Pubkey::find_program_address(&[ESCROW_PDA_SEED], ctx.program_id);
        let authority_seeds = &[&ESCROW_PDA_SEED[..], &[vault_authority_bump]];

        token::transfer(
            ctx.accounts
                .out_transfer_from_pda_context()
                .with_signer(&[&authority_seeds[..]]),
            ctx.accounts.vault_account.amount,
        )?;

        //@TODO : We will solve for closing account later 

        Ok(())
    }


    //Now function for sending tokens to User
    //useful reference -> https://discord.com/channels/889577356681945098/889577399308656662/919557535852281906
    //
    pub fn send_tokens(ctx:Context<SendTokens>, token_amt : u64) -> ProgramResult {

        // let (_vault_authority, vault_authority_bump) =
        //     Pubkey::find_program_address(&[ESCROW_PDA_SEED], ctx.program_id);

        // let authority_seeds = &[&ESCROW_PDA_SEED[..], &[vault_authority_bump]];

        token::transfer(
            ctx.accounts
                .out_transfer_to_user_context(),
                // .with_signer(&[&authority_seeds[..]]),
            token_amt
        )?;

        Ok(())
    }


}


#[derive(Accounts)]
#[instruction(vault_account_bump: u8)]
pub struct Initialize<'info> {
    #[account(mut, signer)]
    pub initializer: AccountInfo<'info>,
    pub mint: Account<'info, Mint>,
    #[account(init, seeds = [b"token-seed".as_ref()], bump = vault_account_bump, 
        payer = initializer, token::mint = mint, token::authority = initializer)]
    pub vault_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub initializer_token_account: Account<'info, TokenAccount>,

    #[account(zero)]
    pub escrow_account: Box<Account<'info, EscrowAccount>>,
    
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: AccountInfo<'info>,
}


#[account]
pub struct EscrowAccount {
    pub initializer_key: Pubkey,
    pub mint : Pubkey,
    pub initializer_token_account: Pubkey,
    // pub fund_amount: u64,
}


#[derive(Accounts)]
pub struct Cancel<'info> {

    #[account(mut, signer)]
    pub initializer: AccountInfo<'info>,

    #[account(mut)]
    pub vault_account: Account<'info, TokenAccount>,

    pub vault_authority: AccountInfo<'info>,

    #[account(mut)]
    pub initializer_token_account: Account<'info, TokenAccount>,

    #[account(mut,constraint = escrow_account.initializer_key == *initializer.key,
        constraint = escrow_account.initializer_token_account == *initializer_token_account.to_account_info().key,
        // close = initializer
    )]
    pub escrow_account: Box<Account<'info, EscrowAccount>>,

    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: AccountInfo<'info>,
}


#[derive(Accounts)]
#[instruction(user_token_amt: u64)]
pub struct SendTokens<'info> {

    #[account(mut, signer)]
    pub user: AccountInfo<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        init, 
        payer = user,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub user_account: Account<'info, TokenAccount>,


    #[account(mut, constraint = vault_account.amount >= user_token_amt)]
    pub vault_account: Account<'info, TokenAccount>,

    pub vault_authority: AccountInfo<'info>,

    #[account(zero)]
    pub escrow_account: Box<Account<'info, EscrowAccount>>,

    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: AccountInfo<'info>,
    pub associated_token_program: AccountInfo<'info>,
}














impl<'info> Initialize<'info> {

    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.vault_account.to_account_info().clone(),
            current_authority: self.initializer.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }


    fn into_transfer_to_pda_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.initializer_token_account.to_account_info().clone(),
            to: self.vault_account.to_account_info().clone(),
            authority: self.initializer.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }

}


impl<'info> Cancel<'info> {

    fn out_transfer_from_pda_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault_account.to_account_info().clone(),
            to: self.initializer_token_account.to_account_info().clone(),
            authority: self.vault_authority.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }

}


impl<'info> SendTokens<'info> {

    fn out_transfer_to_user_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault_account.to_account_info().clone(),
            to: self.user_account.to_account_info().clone(),
            authority: self.vault_authority.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}