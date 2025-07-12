
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { menuItems } from "@/data/menuItems";
import { supabase } from "@/integrations/supabase/client";

// Utility: DataURL to File
function dataURLtoFile(dataurl: string, filename: string) {
  let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)![1],
  bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--) { u8arr[n] = bstr.charCodeAt(n); }
  return new File([u8arr], filename, {type:mime});
}

const GenerateMenuImages = () => {
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrors([]);
    for (let i = 0; i < menuItems.length; i++) {
      const item = menuItems[i];
      setProgress(`Generating (${i + 1}/${menuItems.length}): ${item.name}`);

      // Compose a prompt for realism (you can further improve/modify)
      const prompt = `A unique, high quality professional food photograph of "${item.name}". Show the dish attractively as served in a canteen or casual Indian restaurant.`;

      // Call the edge function
      let imageB64: string | null = null;
      try {
        const response = await fetch(
          "https://rfcusngoutymilmpilez.supabase.co/functions/v1/generate-menu-image",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          }
        );
        const data = await response.json();
        if (data.image) {
          imageB64 = data.image;
        } else if (data.error) {
          setErrors(errs => [...errs, `Error for ${item.name}: ${data.error}`]);
          continue;
        }
      } catch (e: any) {
        setErrors(errs => [...errs, `Error for ${item.name}: ${e.message}`]);
        continue;
      }

      // Upload the image to Supabase Storage
      try {
        const imgFile = dataURLtoFile(`data:image/png;base64,${imageB64}`, `${item.name.replace(/\s+/g, '-').toLowerCase()}.png`);
        const { data, error } = await supabase
          .storage
          .from("lovable-uploads")
          .upload(imgFile.name, imgFile, { cacheControl: "3600", upsert: true });
        if (error) {
          setErrors(errs => [...errs, `Upload error for ${item.name}: ${error.message}`]);
        }
      } catch (e: any) {
        setErrors(errs => [...errs, `Upload error for ${item.name}: ${e.message}`]);
      }
    }
    setProgress("All images attempted. Check errors below for any issues.");
    setIsGenerating(false);
  };

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded shadow mt-8">
      <h2 className="text-2xl mb-4 font-bold">Generate New AI Images for Menu</h2>
      <Button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? "Generating..." : "Generate All Images (OpenAI)"}
      </Button>
      <div className="mt-6">
        <div className="mb-2 text-sm text-gray-700">{progress}</div>
        {errors.length > 0 && (
          <div className="text-red-700 text-sm mt-4">
            <strong>Errors:</strong>
            <ul>{errors.map((err, i) => <li key={i}>{err}</li>)}</ul>
          </div>
        )}
      </div>
      <p className="mt-4 text-xs text-gray-500">
        After images are generated, update the image paths in your menu item DB and/or <code>menuItems.ts</code> to use the new files in <code>/lovable-uploads</code>.
      </p>
    </div>
  );
};

export default GenerateMenuImages;
