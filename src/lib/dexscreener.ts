/**
 * DexScreener API: real price, market cap, pair age for Solana tokens.
 * GET /tokens/v1/solana/{addresses} — up to 30 comma-separated addresses.
 */

const DEXSCREENER_BASE = "https://api.dexscreener.com";
const CHAIN = "solana";
const BATCH_SIZE = 30;

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceNative?: string;
  priceUsd?: string;
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  volume?: { h24?: number };
}

export interface TokenMarketData {
  priceUsd: string;
  marketCap: number | null;
  pairCreatedAt: number | null;
  liquidityUsd: number | null;
}

function pickBestPair(pairs: DexScreenerPair[], mintAddress: string): DexScreenerPair | null {
  const normalized = mintAddress.trim().toLowerCase();
  const relevant = pairs.filter((p) => {
    const base = p.baseToken?.address?.toLowerCase();
    const quote = p.quoteToken?.address?.toLowerCase();
    return base === normalized || quote === normalized;
  });
  if (relevant.length === 0) return null;
  relevant.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0));
  return relevant[0];
}

function formatMarketCap(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

export function formatMarketCapShort(n: number): string {
  return formatMarketCap(n);
}

export function formatPrice(priceUsd: string | undefined): string {
  if (priceUsd == null || priceUsd === "") return "—";
  const num = parseFloat(priceUsd);
  if (Number.isNaN(num)) return "—";
  if (num >= 1) return `$${num.toFixed(2)}`;
  if (num >= 0.01) return `$${num.toFixed(4)}`;
  if (num >= 0.0001) return `$${num.toFixed(6)}`;
  return `$${num.toExponential(2)}`;
}

export function ageFromTimestamp(ts: number | null | undefined): string {
  if (ts == null) return "—";
  const date = new Date(ts);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Fetch market data for Solana token mint addresses (batches of 30).
 * Returns a Map<mintAddress, TokenMarketData>.
 */
export async function fetchDexScreenerTokenData(
  mintAddresses: string[]
): Promise<Map<string, TokenMarketData>> {
  const result = new Map<string, TokenMarketData>();
  const unique = [...new Set(mintAddresses.filter(Boolean))];
  if (unique.length === 0) return result;

  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE);
    const query = batch.join(",");
    try {
      const res = await fetch(
        `${DEXSCREENER_BASE}/tokens/v1/${CHAIN}/${query}`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) continue;
      const pairs: DexScreenerPair[] = await res.json();
      if (!Array.isArray(pairs)) continue;
      for (const mint of batch) {
        const pair = pickBestPair(pairs, mint);
        if (pair) {
          const mc = pair.marketCap ?? pair.fdv ?? null;
          result.set(mint, {
            priceUsd: pair.priceUsd ?? "",
            marketCap: mc ?? null,
            pairCreatedAt: pair.pairCreatedAt ?? null,
            liquidityUsd: pair.liquidity?.usd ?? null,
          });
        }
      }
    } catch (e) {
      console.warn("DexScreener batch failed:", e);
    }
  }
  return result;
}
