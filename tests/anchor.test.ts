// No imports needed: web3, anchor, pg and more are globally available

describe("Music Store", () => {
  // 定义音乐信息
  const musicId = new anchor.BN(1); // 音乐的唯一 ID
  const musicName = "My Song"; // 音乐的名称
  const musicPrice = new anchor.BN(1); // 音乐的价格

  // 定义账户
  let musicAccountKp; // 音乐账户的 Keypair
  let buyerAccountKp; // 用户账户的 Keypair

  before(async () => {
    // 生成音乐账户的 Keypair
    musicAccountKp = new web3.Keypair();

    // 生成用户账户的 Keypair
    buyerAccountKp = new web3.Keypair();
  });

  it("Upload Music", async () => {
    // 调用 upload_music 指令
    const txHash = await pg.program.methods
      .uploadMusic(musicId, musicName, musicPrice)
      .accounts({
        music: musicAccountKp.publicKey,
        signer: pg.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([musicAccountKp])
      .rpc();
    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

    // 确认交易
    await pg.connection.confirmTransaction(txHash);

    // 获取音乐账户的数据
    const musicAccount = await pg.program.account.music.fetch(
      musicAccountKp.publicKey
    );

    // 检查音乐数据是否正确
    assert(musicAccount.id.eq(musicId), "Music ID mismatch");
    assert(musicAccount.name === musicName, "Music name mismatch");
    assert(musicAccount.price.eq(musicPrice), "Music price mismatch");
    assert(
      musicAccount.owner.equals(pg.wallet.publicKey),
      "Music owner mismatch"
    );

    console.log("Music uploaded successfully:", musicAccount);
  });

  it("Buy Music", async () => {
    // 初始化用户账户
    const buyerTxHash = await pg.program.methods
      .initializeBuyer()
      .accounts({
        buyer: buyerAccountKp.publicKey,
        signer: pg.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([buyerAccountKp])
      .rpc();
    await pg.connection.confirmTransaction(buyerTxHash);

    // 调用 buy_music 指令
    const txHash = await pg.program.methods
      .buyMusic(musicId)
      .accounts({
        music: musicAccountKp.publicKey,
        buyer: buyerAccountKp.publicKey,
        signer: pg.wallet.publicKey,
      })
      .rpc();
    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

    // 确认交易
    await pg.connection.confirmTransaction(txHash);

    // 获取用户账户的数据
    const buyerAccount = await pg.program.account.buyer.fetch(
      buyerAccountKp.publicKey
    );


    console.log("Music purchased successfully:", buyerAccount);
  });

  it("Check Purchase Status", async () => {
    // 调用 has_purchased 指令
    const hasPurchased = await pg.program.methods
      .hasPurchased(musicId)
      .accounts({
        buyer: buyerAccountKp.publicKey,
      })
      .view();

    // 检查用户是否购买了该音乐
    assert(hasPurchased, "User should have purchased the music");

    console.log("Purchase status checked successfully:", hasPurchased);
  });
});