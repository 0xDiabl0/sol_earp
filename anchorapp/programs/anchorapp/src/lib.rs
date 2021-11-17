use anchor_lang::prelude::*;

declare_id!("2dAyw3yM8u3r28VrTzUndQdv4AzbZcAUmuRjLZt9frzj");

#[program]
pub mod anchorapp {
    use super::*;

    const PDA_SEED: &[u8] = b"registry";

    pub fn initialize(ctx: Context<Initialize>, base_account_bump: u8) -> ProgramResult {
        ctx.accounts.base_account.bump = base_account_bump;

        let (vault_authority, _vault_authority_bump) =
            Pubkey::find_program_address(&[PDA_SEED], ctx.program_id);

        Ok(())
    }

    pub fn update(ctx: Context<Update>, data: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let copy = data.clone();
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