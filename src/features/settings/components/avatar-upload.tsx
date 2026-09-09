"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { revalidateProfileAction } from "@/features/settings/actions";
import { withAlpha } from "@/lib/user-color";

interface AvatarUploadProps {
  userId: string;
  currentUrl?: string | null;
  ringColor?: string;
}

export function AvatarUpload({ userId, currentUrl, ringColor }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-${Math.random()}.${fileExt}`;

    try {
      // 1. Sobe a foto pro bucket
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      // 2. Pega o link público
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // 3. Salva no perfil do usuário
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
      if (updateError) throw updateError;

      toast.success("Foto de perfil atualizada!");
      await revalidateProfileAction();
      router.refresh();
    } catch (error) {
      toast.error("Erro ao enviar a foto.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="relative h-16 w-16 rounded-full flex items-center justify-center border-2 overflow-hidden group"
      style={{
        borderColor: ringColor || "hsl(var(--primary))",
        backgroundColor: ringColor ? withAlpha(ringColor, "1A") : "hsl(var(--primary) / 0.1)",
      }}
    >
      {currentUrl ? (
        <Image src={currentUrl} alt="Avatar" fill className="object-cover" />
      ) : (
        <UserPlaceholder color={ringColor} />
      )}
      
      {/* Botão invisível de upload por cima da foto */}
      <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
        {isUploading ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
      </label>
    </div>
  );
}

const UserPlaceholder = ({ color }: { color?: string }) => (
  <svg
    className="h-8 w-8"
    style={{ color: color || "hsl(var(--primary))" }}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);