import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export interface XPost {
  id: string;
  text: string;
  author: string;
  url: string;
  publishedAt: string;
}

const NITTER_INSTANCES = [
  "https://nitter.poast.org",
  "https://nitter.privacydev.net",
];

async function fetchXFeed(): Promise<XPost[]> {
  const posts: XPost[] = [];
  const queries = ["solana", "pump.fun", "memecoin", "solana meme"];

  for (const base of NITTER_INSTANCES) {
    if (posts.length >= 20) break;
    for (const q of queries) {
      if (posts.length >= 20) break;
      try {
        const url = `${base}/search/rss?f=tweets&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, {
          headers: { "User-Agent": "MojoTraderBot/1.0" },
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) continue;
        const xml = await res.text();
        const items = parseNitterRSS(xml, base);
        for (const item of items) {
          if (posts.length >= 20) break;
          if (!posts.some((p) => p.id === item.id)) posts.push(item);
        }
      } catch (_) {
        continue;
      }
    }
  }

  posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return posts.slice(0, 20);
}

function parseNitterRSS(xml: string, baseUrl: string): XPost[] {
  const posts: XPost[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/;
  const linkRegex = /<link>(.*?)<\/link>|<link><!\[CDATA\[(.*?)\]\]>/;
  const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
  const dcCreatorRegex = /<dc:creator><!\[CDATA\[(.*?)\]\]>|<dc:creator>(.*?)<\/dc:creator>/;

  let match;
  let index = 0;
  while ((match = itemRegex.exec(xml)) !== null && index < 15) {
    const block = match[1];
    const titleMatch = titleRegex.exec(block);
    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || "").trim() : "";
    const linkMatch = linkRegex.exec(block);
    let link = linkMatch ? (linkMatch[1] || linkMatch[2] || "").trim() : "";
    const creatorMatch = dcCreatorRegex.exec(block);
    const author = creatorMatch ? (creatorMatch[1] || creatorMatch[2] || "X").trim() : "X";
    const pubMatch = pubDateRegex.exec(block);
    const pubStr = pubMatch ? pubMatch[1] : new Date().toISOString();

    if (!title || !link) continue;
    if (!link.startsWith("http")) link = `${baseUrl}${link.startsWith("/") ? "" : "/"}${link}`;

    const text = title
      .replace(/^@\S+\s*:\s*/i, "")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]+>/g, "")
      .slice(0, 280);

    posts.push({
      id: `x-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      text,
      author: author.startsWith("@") ? author : `@${author}`,
      url: link,
      publishedAt: formatDate(pubStr),
    });
    index++;
  }
  return posts;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const tweets = await fetchXFeed();
    return new Response(JSON.stringify({ tweets }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("x-feed error:", e);
    return new Response(
      JSON.stringify({ tweets: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
