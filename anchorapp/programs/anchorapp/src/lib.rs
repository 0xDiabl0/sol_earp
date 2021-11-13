use anchor_lang::prelude::*;

declare_id!("2dAyw3yM8u3r28VrTzUndQdv4AzbZcAUmuRjLZt9frzj");

#[program]
pub mod anchorapp {
    use super::*;

    const EAR_PDA_SEED: &[u8] = b"registry";

    // pub fn initialize(ctx: Context<Initialize>, data: String) -> ProgramResult {
    //     let base_account = &mut ctx.accounts.base_account;
    //     let copy = data.clone();
    //     base_account.data = data;
    //     base_account.data_list.push(copy);
    //     Ok(())
    // }

    pub fn initialize(ctx: Context<Initialize>, base_account_bump: u8) -> ProgramResult {
        ctx.accounts.base_account.bump = base_account_bump;

        let (vault_authority, _vault_authority_bump) =
            Pubkey::find_program_address(&[EAR_PDA_SEED], ctx.program_id);
        token::set_authority(
            ctx.accounts.into_set_authority_context(),
            AuthorityType::AccountOwner,
            Some(vault_authority),
        )?;

        Ok(())
    }

    pub fn update(ctx: Context<Update>, data: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let copy = data.clone();
        // base_account.data = data;
        base_account.data_list.push(copy);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(base_account_bump: u8)]
pub struct Initialize<'info> {

    #[account(init, seeds = [b"registry".as_ref()], bump = base_account_bump, payer = user, space = 2048)]
    base_account: Account<'info, BaseAccount>,
    user: Signer<'info>,
    system_program: Program<'info, System>,

    // #[account(init, payer = user, space = 2048)]
    // pub base_account: Account<'info, BaseAccount>,
    // #[account(mut)]
    // pub user: Signer<'info>,
    // pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

#[account]
#[derive(Default)]
pub struct BaseAccount {
    pub data_list: Vec<String>,
    pub bump : u8
}