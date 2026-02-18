import { useState, useEffect, useCallback, useRef } from "react";
import { Newspaper, Rocket } from "lucide-react";
import { X_FEED_POSTS } from "@/data/x-feed-posts";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  publishedAtIso?: string;
  url: string;
}

interface NewsFeedProps {
  onLaunchIdea: (idea: string) => void;
}

type Tab = "news" | "x";

const MAX_NEWS_ITEMS = 120;

const OLD_NEWS_HOURS = 24;

function isOldNews(item: NewsItem): boolean {
  const iso = item.publishedAtIso;
  if (!iso) return false;
  const published = new Date(iso).getTime();
  const cutoff = Date.now() - OLD_NEWS_HOURS * 60 * 60 * 1000;
  return published < cutoff;
}

const NewsFeed = ({ onLaunchIdea }: NewsFeedProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("news");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const initialLoadDone = useRef(false);

  const fetchNews = useCallback(async () => {
    if (!initialLoadDone.current) setNewsLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/crypto-news?_t=${Date.now()}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      const fresh = (data?.news ?? []).filter((n: NewsItem) => n.url && n.url.startsWith("http"));
      setLastFetchedAt(Date.now());
      setNews((prev) => {
        const byUrl = new Map(prev.map((n) => [n.url, n]));
        fresh.forEach((n: NewsItem) => byUrl.set(n.url, n));
        const merged = Array.from(byUrl.values()).sort((a, b) => {
          const tA = a.publishedAtIso ? new Date(a.publishedAtIso).getTime() : new Date(a.publishedAt).getTime();
          const tB = b.publishedAtIso ? new Date(b.publishedAtIso).getTime() : new Date(b.publishedAt).getTime();
          return tB - tA;
        });
        return merged.slice(0, MAX_NEWS_ITEMS);
      });
    } catch (e) {
      console.error("Failed to fetch news:", e);
    }
    setNewsLoading(false);
    initialLoadDone.current = true;
  }, []);

  useEffect(() => {
    fetchNews();
    const t = setInterval(fetchNews, 5000);
    return () => clearInterval(t);
  }, [fetchNews]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (activeTab !== "news" || lastFetchedAt == null) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [activeTab, lastFetchedAt]);

  return (
    <div className="win95-window h-full flex flex-col">
      <div className="win95-titlebar">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Newspaper className="w-4 h-4 shrink-0" />
          <div className="flex border border-[#808080] bg-[#c0c0c0] p-0.5 gap-0 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setActiveTab("news")}
              className={`flex-1 min-w-0 px-2 py-0.5 text-[10px] font-mono border shrink-0 ${
                activeTab === "news"
                  ? "border-t-[#dfdfdf] border-l-[#dfdfdf] border-b-[#808080] border-r-[#808080] bg-[#c0c0c0]"
                  : "win95-button"
              }`}
            >
              Live News
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("x")}
              className={`flex-1 min-w-0 px-2 py-0.5 text-[10px] font-mono border shrink-0 ${
                activeTab === "x"
                  ? "border-t-[#dfdfdf] border-l-[#dfdfdf] border-b-[#808080] border-r-[#808080] bg-[#c0c0c0]"
                  : "win95-button"
              }`}
            >
              X Feed
            </button>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button type="button" className="win95-control-btn text-[8px]">_</button>
          <button type="button" className="win95-control-btn text-[8px]">×</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white min-h-0">
        {activeTab === "news" ? (
          newsLoading ? (
            <div className="p-2 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse p-2 bg-gray-50">
                  <div className="h-3 bg-[#e0d48f] w-3/4 mb-2" />
                  <div className="h-2 bg-[#e0d48f] w-1/2" />
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="p-4 font-mono text-xs text-[#808080] text-center">
              No news right now. Try again later.
            </div>
          ) : (
            <div className="p-1 space-y-1">
              {news.map((item) => (
                <div
                  key={item.url}
                  className="p-2 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <p className="font-mono text-xs text-[#039B4E] leading-snug mb-1 line-clamp-2">
                      {item.title}
                      {isOldNews(item) && (
                        <span className="ml-1 text-[#808080]">(old)</span>
                      )}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#808080]">{item.source}</span>
                      <span className="font-mono text-[10px] text-[#808080]">{item.publishedAt}</span>
                    </div>
                  </a>
                  <button
                    type="button"
                    className="win95-button-primary w-full mt-2 text-[10px] py-1 flex items-center justify-center gap-1"
                    onClick={() => onLaunchIdea(item.title)}
                  >
                    <Rocket className="w-3 h-3" />
                    Mojo Idea
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="p-1 space-y-1">
            {X_FEED_POSTS.map((post) => (
              <div
                key={post.id}
                className="p-2 bg-[#fffef4] border border-[#e0d48f] hover:bg-[#f7f0c0] transition-colors"
              >
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <p className="font-mono text-xs text-[#00ff00] leading-snug mb-1 line-clamp-2">
                    {post.text}
                  </p>
                  <span className="font-mono text-[10px] text-[#808080]">{post.author}</span>
                </a>
                <button
                  type="button"
                  className="win95-button-primary w-full mt-2 text-[10px] py-1 flex items-center justify-center gap-1"
                  onClick={() => onLaunchIdea(`${post.text} ${post.url}`)}
                >
                  <Rocket className="w-3 h-3" />
                  Mojo Idea
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="win95-statusbar text-[10px]">
        <div className="win95-statusbar-inset flex-1">
          {activeTab === "news"
            ? `${news.length} items • Newest first${lastFetchedAt != null ? ` • Updated ${Math.round((now - lastFetchedAt) / 1000)}s ago` : ""}`
            : `${X_FEED_POSTS.length} posts • Curated X Feed`}
        </div>
      </div>
    </div>
  );
};

export default NewsFeed;
