import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorMovieReviewProgram } from "../target/types/anchor_movie_review_program";
import { expect } from "chai";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token"
describe("anchor-movie-review-program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorMovieReviewProgram as Program<AnchorMovieReviewProgram>;

  const movie = {
    title: "Just a test movie",
    description: "Wow what a good movie it was real great",
    rating: 5,
  };
  const movie2 = {
    title: "movie22222",
    description: "Wow what a good movie it was real great2222",
    rating: 2,
  };

  const [moviePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(movie.title), provider.wallet.publicKey.toBuffer()],
    program.programId,
  );

  const [moviePda2] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(movie2.title), provider.wallet.publicKey.toBuffer()],
    program.programId,
  );
  const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    program.programId
  )
  it("Initializes the reward token", async () => {
    const tx = await program.methods.initializeTokenMint().rpc();
  });
  it("Movie review is added`", async () => {

    const tokenAccount = await getAssociatedTokenAddress(
      mint,
      provider.wallet.publicKey,
    );
    // Add your test here.
    const tx = await program.methods
      .addMovieReview(movie.title, movie.description, movie.rating)
      .accounts({})
      .rpc();
    console.log(moviePda)

    const account = await program.account.movieAccountState.fetch(moviePda);
    expect(movie.title === account.title);
    expect(movie.rating === account.rating);
    expect(movie.description === account.description);
    expect(account.reviewer === provider.wallet.publicKey);

    const userAta = await getAccount(provider.connection, tokenAccount);
    expect(Number(userAta.amount)).to.equal((10 * 10) ^ 6);
  });

  it("Movie2 review is added`", async () => {
    // Add your test here.
    const tx = await program.methods
      .addMovieReview(movie2.title, movie2.description, movie2.rating)
      .rpc();
    console.log(moviePda2)
    const account = await program.account.movieAccountState.fetch(moviePda2);
    expect(movie2.title === account.title);
    expect(movie2.rating === account.rating);
    expect(movie2.description === account.description);
    expect(account.reviewer === provider.wallet.publicKey);
  });

  it("Get Movie review `", async () => {
    // Add your test here.
    const account = await program.account.movieAccountState.all();
    console.log(account)
  });

  it("Movie review is updated`", async () => {
    const newDescription = "Wow this is new";
    const newRating = 4;

    const tx = await program.methods
      .updateMovieReview(movie.title, newDescription, newRating)
      .rpc();

    const account = await program.account.movieAccountState.fetch(moviePda);
    expect(movie.title === account.title);
    expect(newRating === account.rating);
    expect(newDescription === account.description);
    expect(account.reviewer === provider.wallet.publicKey);
  });
  it("Get Movie After Update review `", async () => {
    // Add your test here.
    const account = await program.account.movieAccountState.fetch(moviePda);
    console.log(account)
  });
  it("Deletes a movie review", async () => {
    const tx = await program.methods.deleteMovieReview(movie.title).rpc();
  });
});
