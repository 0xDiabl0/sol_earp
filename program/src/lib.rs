use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo}, 
    entrypoint, 
    entrypoint::ProgramResult, 
    msg, 
    program_error::ProgramError,
    pubkey::Pubkey,
};
use std::str;
// use std::vec::Vec;

/// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug
)]

pub struct GreetingAccount {
    /// number of greetings
    pub counter: u32,
    pub buyers_addr: String::with_capacity(500), //Stores early adopter addresses
}

// impl<T, const N: usize> BorshDeserialize for [T; N]
// where
//     T: Copy,
// {
//     #[inline]
//     fn deserialize(buf: &mut &[u8]) -> Result<Self, u32> {
//         let mut result = [T::default(); N];
//         if N > 0 && !T::copy_from_bytes(buf, &mut result)? {
//             for i in 0..N {
//                 result[i] = T::deserialize(buf)?;
//             }
//         }
//         Ok(result)
//     }
// }

solana_program::declare_id!("BpfProgram1111111111111111111111111111111111");

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

pub fn process_instruction(

    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!(
        "process_instruction: {}: {} accounts, data={:?}",
        program_id,
        accounts.len(),
        instruction_data
    );

    msg!("EAR Rust program entrypoint");

    // Iterating accounts is safer then indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account to say hello to
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    //msg!("acc data:{:#?}",&account.data);

    msg!("trying slice");
    let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;
    msg!("trying from utf8");

    let buyer_addr = str::from_utf8(instruction_data).map_err(|err| {
        msg!("Invalid UTF-8, from byte {}", err.valid_up_to());
        ProgramError::InvalidInstructionData
    })?;

    msg!(buyer_addr);
    msg!("trying to string");
    let add_str = buyer_addr.to_string();
    msg!("&str: {}" ,&add_str);

    if (greeting_account.counter < 4) {

        msg!("inside threshold");

        let mut new_str:String = add_str.to_owned();;
        //let mut new_str:String = "";
        
        if (greeting_account.counter > 0) {

            msg!("trying pool");
            
            greeting_account.buyers_addr = greeting_account.buyers_addr + &"_".to_owned();
        }

        msg!("adding strings");
        greeting_account.buyers_addr = greeting_account.buyers_addr + &new_str;

        msg!("Pooling the rewards :{}", greeting_account.buyers_addr);
    } 
    else {

        msg!("Hit the limit {}. Reward disbursal next", greeting_account.counter);
    }

    //handling counter
    greeting_account.counter += 1;
    msg!("count:{}", greeting_account.counter);

    greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;

    msg!("Bought {} time(s)!", greeting_account.counter);

    Ok(())
}
