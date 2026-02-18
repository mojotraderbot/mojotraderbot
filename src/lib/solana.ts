import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Minimum balance required for token deployment (0.01 SOL)
export const MINIMUM_BALANCE_SOL = 0.01;

/**
 * Get wallet balance in SOL
 */
export async function getWalletBalance(
  connection: Connection,
  publicKey: PublicKey
): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
}

/**
 * Check if wallet has minimum required balance
 */
export function checkMinimumBalance(balanceInSol: number): boolean {
  return balanceInSol >= MINIMUM_BALANCE_SOL;
}

/**
 * Shorten wallet address for display (e.g., "7xKX...3Fpm")
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format SOL balance with proper decimals
 */
export function formatSolBalance(balance: number): string {
  if (balance >= 1) {
    return balance.toFixed(2);
  }
  return balance.toFixed(4);
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}
