"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateInviteAction } from "../actions";
import { Copy, Check, Loader2, Link as LinkIcon } from "lucide-react";

export function InviteCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    
    const res = await generateInviteAction();
    setIsLoading(false);
    
    if (res?.error) {
      setErrorMsg(res.error);
      return;
    }

    if (res?.token) {
      setInviteLink(`${window.location.origin}/invite/${res.token}`);
    }
  };

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-primary" />
          Convidar Parceiro(a)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Gere um link para compartilhar seu progresso e unificar os desafios de vocês.
        </p>

        {errorMsg && (
          <p className="text-sm text-red-500 font-medium bg-red-500/10 p-2 rounded-lg">
            {errorMsg}
          </p>
        )}
        
        {!inviteLink ? (
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerar link de convite"}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 truncate rounded-md border bg-muted/50 px-3 py-2 text-sm text-foreground">
              {inviteLink}
            </div>
            <Button variant="secondary" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}