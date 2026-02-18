import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  publishedAtIso?: string;
  url: string;
}

// ~100 RSS sources: US mainstream (NYT, CNN, etc.), world news, crypto, tech. Max 1–3 per feed for variety.
async function fetchCryptoNews(): Promise<NewsItem[]> {
  const news: NewsItem[] = [];
  const feeds: { url: string; source: string; max: number }[] = [
    // ——— US mainstream ———
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', source: 'NYT', max: 3 },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYT World', max: 2 },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/US.xml', source: 'NYT US', max: 2 },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'NYT Business', max: 2 },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', source: 'NYT Tech', max: 2 },
    { url: 'http://rss.cnn.com/rss/cnn_topstories.rss', source: 'CNN', max: 3 },
    { url: 'http://rss.cnn.com/rss/cnn_us.rss', source: 'CNN US', max: 2 },
    { url: 'http://rss.cnn.com/rss/cnn_world.rss', source: 'CNN World', max: 2 },
    { url: 'http://rss.cnn.com/rss/money_news_international.rss', source: 'CNN Money', max: 2 },
    { url: 'https://feeds.npr.org/1001/rss.xml', source: 'NPR', max: 3 },
    { url: 'https://feeds.npr.org/1006/rss.xml', source: 'NPR Business', max: 2 },
    { url: 'https://feeds.npr.org/1019/rss.xml', source: 'NPR Tech', max: 2 },
    { url: 'https://moxie.foxnews.com/google-publisher/latest.xml', source: 'Fox News', max: 3 },
    { url: 'https://www.cbsnews.com/latest/rss/main', source: 'CBS News', max: 3 },
    { url: 'https://abcnews.go.com/abcnews/topstories', source: 'ABC News', max: 2 },
    { url: 'https://rssfeeds.usatoday.com/UsatodaycomWorld-TopStories', source: 'USA Today', max: 3 },
    { url: 'https://rssfeeds.usatoday.com/UsatodaycomMoney-TopStories', source: 'USA Today Money', max: 2 },
    { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg', max: 3 },
    { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC', max: 3 },
    { url: 'https://www.cnbc.com/id/19854910/device/rss/rss.html', source: 'CNBC Tech', max: 2 },
    { url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best', source: 'Reuters', max: 3 },
    { url: 'https://apnews.com/apf-topnews', source: 'AP News', max: 3 },
    { url: 'https://www.politico.com/rss/politics08.xml', source: 'Politico', max: 2 },
    { url: 'https://thehill.com/feed/', source: 'The Hill', max: 2 },
    { url: 'https://api.axios.com/feed/', source: 'Axios', max: 2 },
    { url: 'https://www.huffpost.com/section/front-page/feed', source: 'HuffPost', max: 2 },
    { url: 'https://www.vox.com/rss/index.xml', source: 'Vox', max: 2 },
    { url: 'https://www.latimes.com/california/rss2.0.xml', source: 'LA Times', max: 2 },
    { url: 'https://www.chicagotribune.com/arcio/rss/', source: 'Chicago Tribune', max: 2 },
    { url: 'https://www.miamiherald.com/news/rss/', source: 'Miami Herald', max: 2 },
    { url: 'https://www.bostonglobe.com/rss', source: 'Boston Globe', max: 2 },
    { url: 'https://www.dallasnews.com/arcio/rss/', source: 'Dallas News', max: 2 },
    { url: 'https://www.denverpost.com/feed/', source: 'Denver Post', max: 2 },
    { url: 'https://www.seattletimes.com/feed/', source: 'Seattle Times', max: 2 },
    { url: 'https://www.sfchronicle.com/rss/', source: 'SF Chronicle', max: 2 },
    { url: 'https://www.washingtonpost.com/rss/world', source: 'Washington Post', max: 2 },
    { url: 'https://www.washingtonpost.com/rss/business', source: 'WaPo Business', max: 2 },
    // ——— World / intl ———
    { url: 'https://feeds.bbci.co.uk/news/rss.xml', source: 'BBC News', max: 3 },
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World', max: 2 },
    { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business', max: 2 },
    { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech', max: 2 },
    { url: 'https://www.theguardian.com/world/rss', source: 'Guardian World', max: 2 },
    { url: 'https://www.theguardian.com/us/rss', source: 'Guardian US', max: 2 },
    { url: 'https://www.theguardian.com/uk/business/rss', source: 'Guardian Business', max: 2 },
    { url: 'https://www.theguardian.com/uk/technology/rss', source: 'Guardian Tech', max: 2 },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', max: 3 },
    { url: 'https://www.france24.com/en/rss', source: 'France 24', max: 2 },
    { url: 'https://www.dw.com/en/rss', source: 'DW', max: 2 },
    { url: 'https://www.euronews.com/rss', source: 'Euronews', max: 2 },
    { url: 'https://www.rt.com/rss/', source: 'RT', max: 2 },
    { url: 'https://www.scmp.com/rss/91/feed', source: 'SCMP', max: 2 },
    { url: 'https://www.japantimes.co.jp/feed/', source: 'Japan Times', max: 2 },
    { url: 'https://www.thestar.com.my/rss/World', source: 'The Star', max: 2 },
    { url: 'https://www.smh.com.au/rss/world.xml', source: 'Sydney Morning Herald', max: 2 },
    { url: 'https://www.theglobeandmail.com/rss/world/', source: 'Globe and Mail', max: 2 },
    // ——— Tech ———
    { url: 'https://techcrunch.com/feed/', source: 'TechCrunch', max: 3 },
    { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge', max: 3 },
    { url: 'https://www.wired.com/feed/rss', source: 'Wired', max: 2 },
    { url: 'https://arstechnica.com/feed/', source: 'Ars Technica', max: 2 },
    { url: 'https://www.engadget.com/rss.xml', source: 'Engadget', max: 2 },
    { url: 'https://mashable.com/feed/', source: 'Mashable', max: 2 },
    { url: 'https://www.zdnet.com/news/rss.xml', source: 'ZDNet', max: 2 },
    { url: 'https://www.cnet.com/rss/news/', source: 'CNET', max: 2 },
    { url: 'https://venturebeat.com/feed/', source: 'VentureBeat', max: 2 },
    { url: 'https://siliconangle.com/feed/', source: 'SiliconANGLE', max: 2 },
    { url: 'https://thenextweb.com/feed/', source: 'TNW', max: 2 },
    { url: 'https://www.techradar.com/rss', source: 'TechRadar', max: 2 },
    { url: 'https://www.theinformation.com/feed', source: 'The Information', max: 2 },
    // ——— Crypto / finance ———
    { url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph', max: 3 },
    { url: 'https://decrypt.co/feed', source: 'Decrypt', max: 3 },
    { url: 'https://bitcoinmagazine.com/.rss/full/', source: 'Bitcoin Magazine', max: 2 },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', max: 3 },
    { url: 'https://cryptonews.com/news/feed/', source: 'CryptoNews', max: 2 },
    { url: 'https://www.theblock.co/rss.xml', source: 'The Block', max: 2 },
    { url: 'https://bitcoinist.com/feed/', source: 'Bitcoinist', max: 2 },
    { url: 'https://news.bitcoin.com/feed/', source: 'Bitcoin.com', max: 2 },
    { url: 'https://cryptoslate.com/feed/', source: 'CryptoSlate', max: 2 },
    { url: 'https://beincrypto.com/feed/', source: 'BeInCrypto', max: 2 },
    { url: 'https://u.today/rss', source: 'U.Today', max: 2 },
    { url: 'https://ambcrypto.com/feed/', source: 'AMBCrypto', max: 2 },
    { url: 'https://coincodex.com/feed/', source: 'CoinCodex', max: 2 },
    { url: 'https://cryptopotato.com/feed/', source: 'CryptoPotato', max: 2 },
    { url: 'https://www.coinbureau.com/feed/', source: 'Coin Bureau', max: 2 },
    { url: 'https://blockworks.co/feed', source: 'Blockworks', max: 2 },
    { url: 'https://crypto.news/feed/', source: 'Crypto.news', max: 2 },
    { url: 'https://watcher.guru/feed/', source: 'Watcher Guru', max: 2 },
    { url: 'https://bitcoinworld.co.in/feed/', source: 'Bitcoin World', max: 2 },
    { url: 'https://www.investing.com/rss/news.rss', source: 'Investing.com', max: 2 },
    { url: 'https://www.marketwatch.com/rss/topstories', source: 'MarketWatch', max: 2 },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'Dow Jones', max: 2 },
    { url: 'https://www.businesswire.com/feeds/rss/home.rss', source: 'Business Wire', max: 2 },
    { url: 'https://www.prnewswire.com/rss/news-releases.rss', source: 'PR Newswire', max: 2 },
    { url: 'https://www.yahoo.com/news/rss', source: 'Yahoo News', max: 2 },
    { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', source: 'Google News', max: 3 },
    { url: 'https://feeds.feedburner.com/ndtvnews-world-news', source: 'NDTV World', max: 2 },
    { url: 'https://www.independent.co.uk/news/rss', source: 'Independent', max: 2 },
    { url: 'https://www.telegraph.co.uk/news/rss.xml', source: 'Telegraph', max: 2 },
    { url: 'https://www.economist.com/finance-and-economics/rss.xml', source: 'Economist', max: 2 },
    { url: 'https://www.ft.com/?format=rss', source: 'Financial Times', max: 2 },
    { url: 'https://www.reutersagency.com/feed/?best-topics=markets', source: 'Reuters Markets', max: 2 },
    { url: 'https://www.barrons.com/feed', source: "Barron's", max: 2 },
    { url: 'https://www.forbes.com/real-time/feed2/', source: 'Forbes', max: 2 },
    { url: 'https://fortune.com/feed/', source: 'Fortune', max: 2 },
    { url: 'https://www.investopedia.com/feedbuilder/feed/getfeed?feedName=rss_headline', source: 'Investopedia', max: 2 },
    { url: 'https://www.morningstar.com/rss/news.xml', source: 'Morningstar', max: 2 },
  ];

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'MojoTraderBot/1.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const xml = await res.text();
        const items = parseRSS(xml, feed.source, feed.max);
        news.push(...items);
      }
    } catch (e) {
      console.error(`${feed.source} fetch failed:`, e);
    }
  }

  news.sort((a, b) => (b.publishedAtIso || b.publishedAt).localeCompare(a.publishedAtIso || a.publishedAt));
  return news.slice(0, 120);
}

function parsePubDateToIso(dateStr: string): string {
  try {
    return new Date(dateStr).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function parseRSS(xml: string, source: string, maxItems: number): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/;
  const linkRegex = /<link>(.*?)<\/link>|<link><!\[CDATA\[(.*?)\]\]>|<link\s+href="([^"]+)"/;
  const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;

  let match;
  let index = 0;
  while ((match = itemRegex.exec(xml)) !== null && index < maxItems) {
    const itemContent = match[1];
    const titleMatch = titleRegex.exec(itemContent);
    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';
    const linkMatch = linkRegex.exec(itemContent);
    let link = linkMatch ? (linkMatch[1] || linkMatch[2] || linkMatch[3] || '').trim() : '';
    if (link && !link.startsWith('http')) link = '';
    const pubDateMatch = pubDateRegex.exec(itemContent);
    const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString();

    if (title && link && link.startsWith('http')) {
      const iso = parsePubDateToIso(pubDate);
      items.push({
        id: `${source}-${index}-${Date.now()}`,
        title: title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<[^>]+>/g, ''),
        source,
        publishedAt: formatDate(pubDate),
        publishedAtIso: iso,
        url: link,
      });
      index++;
    }
  }
  return items;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const news = await fetchCryptoNews();

    return new Response(JSON.stringify({ news }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch news' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache',
      },
    });
  }
});
