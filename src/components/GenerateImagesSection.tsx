import { useState } from "react";
import { Image, FileImage, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TokenData } from "./TokenPreview";

interface GenerateImagesSectionProps {
  tokenData: TokenData;
  onLogoGenerated: (url: string) => void;
  onBannerGenerated: (url: string) => void;
}

const GenerateImagesSection = ({ 
  tokenData, 
  onLogoGenerated, 
  onBannerGenerated 
}: GenerateImagesSectionProps) => {
  const [generatingLogo, setGeneratingLogo] = useState(false);
  const [generatingBanner, setGeneratingBanner] = useState(false);

  const generateImage = async (type: "logo" | "banner") => {
    const setGenerating = type === "logo" ? setGeneratingLogo : setGeneratingBanner;
    const onGenerated = type === "logo" ? onLogoGenerated : onBannerGenerated;
    
    if (!tokenData.name && !tokenData.ticker) {
      toast.error("Please set token name or ticker first");
      return;
    }

    setGenerating(true);
    
    try {
      const prompt = tokenData.name 
        ? `${tokenData.name} ${tokenData.ticker ? `($${tokenData.ticker})` : ''} - ${tokenData.description || 'cryptocurrency token'}`
        : `$${tokenData.ticker} token - ${tokenData.description || 'cryptocurrency'}`;

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, type }
      });

      if (error) {
        console.error('Generate image error:', error);
        toast.error(error.message || "Failed to generate image");
        return;
      }

      if (data?.imageUrl) {
        onGenerated(data.imageUrl);
        toast.success(`${type === "logo" ? "Logo" : "Banner"} generated!`);
      } else {
        toast.error("No image returned");
      }
    } catch (err) {
      console.error('Generate image error:', err);
      toast.error("Failed to generate image");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-2">
      <div className="win95-groupbox p-2">
        <span className="win95-groupbox-title">AI Generate</span>
        <div className="space-y-2 mt-2">
          <button
            className="win95-button w-full flex items-center gap-2 py-1"
            onClick={() => generateImage("logo")}
            disabled={generatingLogo}
          >
            {generatingLogo ? (
              <Loader2 className="w-4 h-4 text-black animate-spin" />
            ) : (
              <Image className="w-4 h-4 text-black" />
            )}
            <span className="font-mono text-xs text-black">
              {generatingLogo ? "Generating..." : "Generate Logo"}
            </span>
          </button>
          <button
            className="win95-button w-full flex items-center gap-2 py-1"
            onClick={() => generateImage("banner")}
            disabled={generatingBanner}
          >
            {generatingBanner ? (
              <Loader2 className="w-4 h-4 text-black animate-spin" />
            ) : (
              <FileImage className="w-4 h-4 text-black" />
            )}
            <span className="font-mono text-xs text-black">
              {generatingBanner ? "Generating..." : "Generate Banner"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateImagesSection;
