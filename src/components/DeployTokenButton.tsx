import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Rocket, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { toast, toastSuccess, toastError } from '@/components/ui/sonner';
import { createPumpFunToken, TokenMetadata, DeployTokenResult } from '@/lib/pumpfun';
import { checkMinimumBalance, getWalletBalance } from '@/lib/solana';
import { saveDeployedToken } from '@/hooks/useDeployedTokens';
import { getSelectedAgentId } from '@/hooks/useAgents';

interface DeployTokenButtonProps {
  tokenData: {
    name?: string;
    ticker?: string;
    description?: string;
    logo?: string | null;
    twitter?: string | null;
  };
  devBuyAmountSol?: number;
  onDeployStart?: () => void;
  onDeployComplete?: (result: DeployTokenResult) => void;
}

const DeployTokenButton = ({ 
  tokenData, 
  devBuyAmountSol = 0.1,
  onDeployStart,
  onDeployComplete 
}: DeployTokenButtonProps) => {
  const { publicKey, connected } = useWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isDeploying, setIsDeploying] = useState(false);
  const [lastResult, setLastResult] = useState<DeployTokenResult | null>(null);

  const isReady = tokenData.name && tokenData.ticker && connected;

  const handleDeploy = async () => {
    if (!isReady || !publicKey) {
      toastError('Token deployment is disabled in Mojo Trader mode');
      return;
    }

    // Check balance
    const balance = await getWalletBalance(connection, publicKey);
    const requiredBalance = devBuyAmountSol + 0.02; // Extra for fees
    
    if (!checkMinimumBalance(balance) || balance < requiredBalance) {
      toastError(`Insufficient balance. Need at least ${requiredBalance.toFixed(3)} SOL`);
      return;
    }

    setIsDeploying(true);
    onDeployStart?.();

    try {
      toast.info('🚀 Deploying token on pump.fun...');

      const metadata: TokenMetadata = {
        name: tokenData.name || 'Unnamed Token',
        symbol: tokenData.ticker || 'TOKEN',
        description: tokenData.description || 'Token launched via Mojo Trader on Pump.fun',
        imageUrl: tokenData.logo || 'https://pump.fun/img/pump-logo.png',
        ...(tokenData.twitter && { twitter: tokenData.twitter.startsWith('http') ? tokenData.twitter : `https://x.com/${tokenData.twitter.replace(/^@/, '')}` }),
      };

      const result = await createPumpFunToken(connection, wallet, {
        metadata,
        devBuyAmountSol,
      });

      setLastResult(result);
      onDeployComplete?.(result);

      if (result.success) {
        // Save to database with agent_id
        try {
          const agentId = getSelectedAgentId();
          await saveDeployedToken({
            name: metadata.name,
            ticker: metadata.symbol,
            description: metadata.description,
            logoUrl: metadata.imageUrl,
            mintAddress: result.mintAddress!,
            pumpUrl: result.pumpUrl!,
            creatorWallet: publicKey.toBase58(),
            devBuyAmountSol,
            transactionSignature: result.signature,
            agentId,
          });
        } catch (saveError) {
          console.error('Failed to save token to DB:', saveError);
        }

        toastSuccess(
          <span className="whitespace-nowrap">🚀 Token deployed successfully!</span>,
          { mint: result.mintAddress ?? undefined }
        );
      } else {
        toastError(`Deployment failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Deploy error:', error);
      toastError(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleDeploy}
        disabled={!isReady || isDeploying}
        className={`w-full flex items-center gap-2 justify-center py-3 font-mono text-sm ${
          isReady && !isDeploying
            ? 'win95-button-primary hover-elevate'
            : 'win95-button opacity-60 cursor-not-allowed'
        }`}
      >
        {isDeploying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Deploying...</span>
          </>
        ) : (
          <>
            <Rocket className="w-4 h-4" />
            <span>DEPLOY TOKEN</span>
          </>
        )}
      </button>

      {!tokenData.name && (
        <div className="flex items-center gap-1 justify-center text-[10px] text-[#808080]">
          <AlertCircle className="w-3 h-3" />
          <span>Enter token name in chat to enable</span>
        </div>
      )}

      {lastResult?.success && lastResult.pumpUrl && (
        <a
          href={lastResult.pumpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="win95-button w-full flex items-center gap-2 justify-center py-1 text-xs"
        >
          <ExternalLink className="w-3 h-3 text-black" />
          <span className="text-black">View on Pump.fun</span>
        </a>
      )}
    </div>
  );
};

export default DeployTokenButton;
