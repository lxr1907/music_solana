import * as anchor from "@project-serum/anchor";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";

// 配置 Anchor 提供者
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// 合约地址
const programId = new PublicKey("83eMBGtHrS4oR6VjptrJdwVjidDjoAdokVxCi6dZQeZP");

// 加载 IDL 文件（假设你已经生成了 IDL 文件并导入）
const idl = require("./idl/music_contract.json"); // 替换为你的 IDL 文件路径
const program = new anchor.Program(idl, programId, provider);

// 定义音乐信息
const musicId = new anchor.BN(1); // 音乐的唯一 ID
const musicName = "My Song"; // 音乐的名称
const musicPrice = new anchor.BN(100); // 音乐的价格

// 定义账户
const musicAccount = Keypair.generate(); // 音乐账户的 Keypair
const buyerAccount = Keypair.generate(); // 用户账户的 Keypair

async function main() {
  try {
    // 1. 上传音乐
    const uploadTx = await program.methods
      .uploadMusic(musicId, musicName, musicPrice)
      .accounts({
        music: musicAccount.publicKey,
        signer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([musicAccount])
      .rpc();
    console.log("Music uploaded:", uploadTx);

    // 2. 初始化用户账户
    const initializeTx = await program.methods
      .initializeBuyer()
      .accounts({
        buyer: buyerAccount.publicKey,
        signer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyerAccount])
      .rpc();
    console.log("Buyer initialized:", initializeTx);

    // 3. 购买音乐
    const buyTx = await program.methods
      .buyMusic(musicId)
      .accounts({
        music: musicAccount.publicKey,
        buyer: buyerAccount.publicKey,
        signer: provider.wallet.publicKey,
      })
      .rpc();
    console.log("Music purchased:", buyTx);

    // 4. 查询购买记录
    const hasPurchased = await program.methods
      .hasPurchased(musicId)
      .accounts({
        buyer: buyerAccount.publicKey,
      })
      .view();
    console.log("Has purchased:", hasPurchased);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();