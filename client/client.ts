import * as anchor from "@project-serum/anchor";
// 配置 Anchor 提供者
const provider = anchor.getProvider();

const program = pg.program;

// 定义音乐信息
const musicId = new anchor.BN(1); // 音乐的唯一 ID
const musicName = "My Song"; // 音乐的名称
const musicPrice = new anchor.BN(100); // 音乐的价格

// 定义账户
const musicAccount = web3.Keypair.generate(); // 音乐账户的 Keypair
const buyerAccount = web3.Keypair.generate(); // 用户账户的 Keypair

async function main() {
  // 1. 上传音乐
  const uploadTx = await program.methods
    .uploadMusic(musicId, musicName, musicPrice)
    .accounts({
      music: musicAccount.publicKey,
      signer: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
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
      systemProgram: anchor.web3.SystemProgram.programId,
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
}

main().catch(console.error);