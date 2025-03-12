use anchor_lang::prelude::*;

// 程序 ID
declare_id!("83eMBGtHrS4oR6VjptrJdwVjidDjoAdokVxCi6dZQeZP");

#[program]
mod music_store {
    use super::*;

    // 上传音乐
    pub fn upload_music(
        ctx: Context<UploadMusic>,
        music_id: u64,
        name: String,
        price: u64,
    ) -> Result<()> {
        let music = &mut ctx.accounts.music;
        music.id = music_id;
        music.name = name;
        music.price = price;
        music.owner = *ctx.accounts.signer.key;
        msg!("Music uploaded: ID={}, Name={}, Price={}", music_id, music.name, music.price);
        Ok(())
    }

    // 购买音乐
    pub fn buy_music(ctx: Context<BuyMusic>, music_id: u64) -> Result<()> {
        let music = &ctx.accounts.music;
        let buyer = &mut ctx.accounts.buyer;

        // 检查音乐是否存在
        require!(music.id == music_id, ErrorCode::MusicNotFound);

        // 检查用户是否已经购买过该音乐
        require!(!buyer.purchased_music_ids.contains(&music_id), ErrorCode::AlreadyPurchased);

        // 模拟支付逻辑（这里假设直接扣除合约币）
        // 实际场景中需要实现转账逻辑
        msg!("User {} bought music {} for {} tokens", buyer.key(), music_id, music.price);

        // 将音乐 ID 添加到用户的购买记录中
        buyer.purchased_music_ids.push(music_id);
        Ok(())
    }

    // 查询用户是否购买了某个音乐
    pub fn has_purchased(ctx: Context<HasPurchased>, music_id: u64) -> Result<bool> {
        let buyer = &ctx.accounts.buyer;
        Ok(buyer.purchased_music_ids.contains(&music_id))
    }

    // 初始化用户账户
    pub fn initialize_buyer(ctx: Context<InitializeBuyer>) -> Result<()> {
        let buyer = &mut ctx.accounts.buyer;
        buyer.purchased_music_ids = Vec::new(); // 初始化空的购买记录
        Ok(())
    }
}

// 上传音乐的上下文
#[derive(Accounts)]
pub struct UploadMusic<'info> {
    #[account(init, payer = signer, space = 8 + 8 + 64 + 8 + 32)]
    pub music: Account<'info, Music>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// 购买音乐的上下文
#[derive(Accounts)]
pub struct BuyMusic<'info> {
    #[account(mut)]
    pub music: Account<'info, Music>,
    #[account(mut)]
    pub buyer: Account<'info, Buyer>,
    pub signer: Signer<'info>,
}

// 查询购买记录的上下文
#[derive(Accounts)]
pub struct HasPurchased<'info> {
    pub buyer: Account<'info, Buyer>,
}

// 初始化用户账户的上下文
#[derive(Accounts)]
pub struct InitializeBuyer<'info> {
    #[account(init, payer = signer, space = 8 + 1024)] // 预留足够的空间
    pub buyer: Account<'info, Buyer>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// 音乐账户
#[account]
pub struct Music {
    pub id: u64,       // 音乐的唯一 ID
    pub name: String,  // 音乐的名称
    pub price: u64,    // 音乐的价格
    pub owner: Pubkey, // 音乐的上传者
}

// 用户账户
#[account]
pub struct Buyer {
    pub purchased_music_ids: Vec<u64>, // 用户购买的音乐 ID 列表
}

// 错误码
#[error_code]
pub enum ErrorCode {
    #[msg("Music not found.")]
    MusicNotFound,
    #[msg("User has already purchased this music.")]
    AlreadyPurchased,
}