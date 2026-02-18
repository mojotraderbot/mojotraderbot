import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export interface DeployTokenParams {
  metadata: TokenMetadata;
  devBuyAmountSol: number;
  imageFile?: File;
}

export interface DeployTokenResult {
  success: boolean;
  mintAddress?: string;
  pumpUrl?: string;
  signature?: string;
  error?: string;
}

/**
 * Create a new token on pump.fun via PumpPortal API
 * 
 * @param connection - Solana connection
 * @param wallet - Wallet adapter state
 * @param params - Token deployment parameters
 * @returns Deployment result with mint address and pump.fun URL
 */
export async function createPumpFunToken(
  connection: Connection,
  wallet: WalletContextState,
  params: DeployTokenParams
): Promise<DeployTokenResult> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return { success: false, error: 'Wallet not connected' };
    }

    const { metadata, devBuyAmountSol } = params;

    // Generate a new keypair for the mint
    const mintKeypair = Keypair.generate();
    const mintAddress = mintKeypair.publicKey.toString();

    console.log('🚀 Creating token with mint:', mintAddress);

    // Step 1: Upload metadata to IPFS if we have a base64 image
    let metadataUri = metadata.imageUrl;
    
    if (metadata.imageUrl && metadata.imageUrl.startsWith('data:')) {
      console.log('📤 Uploading image to IPFS...');
      
      const uploadResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-metadata`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            name: metadata.name,
            symbol: metadata.symbol,
            description: metadata.description,
            imageBase64: metadata.imageUrl,
            ...(metadata.twitter && { twitter: metadata.twitter }),
            ...(metadata.telegram && { telegram: metadata.telegram }),
            ...(metadata.website && { website: metadata.website }),
          }),
        }
      );

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        console.error('❌ IPFS upload failed:', error);
        return { 
          success: false, 
          error: error.error || 'Failed to upload image to IPFS' 
        };
      }

      const uploadData = await uploadResponse.json();
      metadataUri = uploadData.metadataUri;
      console.log('✅ Metadata uploaded:', metadataUri);
    }

    // Step 2: Get transaction from PumpPortal API via Edge Function proxy
    console.log('📝 Requesting transaction from PumpPortal via proxy...');
    
    const devBuyAmount = Number(devBuyAmountSol) || 0;
    console.log('💰 Dev buy amount:', devBuyAmount, 'SOL');

    // Use Edge Function proxy to avoid CORS issues
    const proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pumpfun-proxy`;
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        publicKey: wallet.publicKey.toString(),
        action: 'create',
        tokenMetadata: {
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadataUri,
        },
        mint: mintAddress,
        denominatedInSol: 'true',
        amount: devBuyAmount,
        slippage: 10,
        priorityFee: 0.0005,
        pool: 'pump',
        isMayhemMode: 'false',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ PumpPortal API error:', errorData);
      const errorMessage =
        typeof errorData?.error === 'string'
          ? errorData.error
          : errorData?.details?.error ?? `HTTP ${response.status}: ${response.statusText}`;
      return {
        success: false,
        mintAddress,
        pumpUrl: `https://pump.fun/${mintAddress}`,
        error: errorMessage,
      };
    }

    const tradeData = await response.json();

    if (!tradeData?.transaction) {
      console.error('❌ No transaction returned. Response keys:', Object.keys(tradeData || {}), tradeData);
      const hasRaw = tradeData && typeof tradeData === 'object' && 'raw' in tradeData;
      const hint = hasRaw
        ? ' Deploy the updated pumpfun-proxy Edge Function in Supabase (Dashboard → Edge Functions).'
        : '';
      return {
        success: false,
        mintAddress,
        pumpUrl: `https://pump.fun/${mintAddress}`,
        error: (tradeData?.error || 'No transaction returned from PumpPortal') + hint,
      };
    }

    // Step 3: Decode and sign the transaction
    console.log('✍️ Signing transaction...');
    
    const transactionBytes = Uint8Array.from(atob(tradeData.transaction), c => c.charCodeAt(0));
    const transaction = VersionedTransaction.deserialize(transactionBytes);

    // Sign with the mint keypair first
    transaction.sign([mintKeypair]);

    // Then sign with the user's wallet
    const signedTransaction = await wallet.signTransaction(transaction);

    // Step 4: Send the transaction
    console.log('📡 Sending transaction to Solana...');
    
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    console.log('📨 Transaction sent:', signature);

    // Wait for confirmation
    console.log('⏳ Waiting for confirmation...');
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      console.error('❌ Transaction failed:', confirmation.value.err);
      return { 
        success: false, 
        mintAddress,
        pumpUrl: `https://pump.fun/${mintAddress}`,
        signature,
        error: 'Transaction failed to confirm' 
      };
    }

    console.log('🎉 Token created successfully on pump.fun!');
    
    return {
      success: true,
      mintAddress,
      pumpUrl: `https://pump.fun/${mintAddress}`,
      signature,
    };

  } catch (error) {
    console.error('❌ Error creating pump.fun token:', error);
    
    // Generate a mint address even on failure
    const fallbackMint = Keypair.generate().publicKey.toString();
    
    return {
      success: false,
      mintAddress: fallbackMint,
      pumpUrl: `https://pump.fun/${fallbackMint}`,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
