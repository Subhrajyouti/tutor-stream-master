import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Send, X, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParsedExpense {
  amount?: number;
  currency?: string;
  date?: string;
  category?: string;
  vendor?: string;
  description?: string;
  ai_confidence?: number;
}

interface WebhookResponse {
  ok: boolean;
  expense_id?: string;
  ai_confidence?: number;
  parsed?: ParsedExpense;
}

export default function AddExpense() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<WebhookResponse | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const sendToWebhook = async (text?: string, audioData?: string) => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload: any = {
        user_id: user.id,
        source: "bolt",
        device: "web",
        meta: { timezone: "Asia/Kolkata" },
      };

      if (audioData) {
        payload.audio = audioData;
        payload.audio_format = "webm";
      } else if (text) {
        payload.text = text;
      }

      const response = await fetch("https://n8n.subhrajyoti.online/webhook/poisar-hisap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to process expense");
      }

      const data: WebhookResponse = await response.json();
      setParsedData(data);

      if (data.ai_confidence && data.ai_confidence < 0.7) {
        toast({
          title: "Low confidence",
          description: "Please review and confirm the parsed data before saving.",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process expense",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    await sendToWebhook(message);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(",")[1];
          if (base64Audio) {
            await sendToWebhook(undefined, base64Audio);
          }
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 10000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to access microphone",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSave = async () => {
    if (!parsedData?.parsed) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("expenses").insert({
        user_id: user.id,
        amount: parsedData.parsed.amount || 0,
        currency: parsedData.parsed.currency || "INR",
        date: parsedData.parsed.date || new Date().toISOString().split("T")[0],
        category: parsedData.parsed.category,
        vendor: parsedData.parsed.vendor,
        description: parsedData.parsed.description || message,
        ai_confidence: parsedData.ai_confidence,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense saved successfully",
      });

      setMessage("");
      setParsedData(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save expense",
      });
    }
  };

  const handleDiscard = () => {
    setParsedData(null);
    setMessage("");
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Add Expense</h1>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">Quick Entry</CardTitle>
          <CardDescription className="text-sm">
            Type or say "coffee 120" or "rent 12000 Oct 2025"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="flex gap-2">
            <Input
              placeholder='e.g., "coffee 120"'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isProcessing}
              className="h-11 md:h-10 text-base"
            />
            <Button
              size="icon"
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isProcessing}
              title="Click to record"
              className="h-11 w-11 md:h-10 md:w-10 flex-shrink-0"
            >
              <Mic className={isRecording ? "animate-pulse h-5 w-5" : "h-5 w-5"} />
            </Button>
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!message.trim() || isProcessing}
              className="h-11 w-11 md:h-10 md:w-10 flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          {isRecording && (
            <p className="text-sm text-muted-foreground">Recording... Click mic to stop</p>
          )}

          {isProcessing && (
            <p className="text-sm text-muted-foreground">Processing...</p>
          )}

          {parsedData?.parsed && (
            <Card className="border-primary">
              <CardHeader className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base md:text-lg">Review Expense</CardTitle>
                  {parsedData.ai_confidence !== undefined && (
                    <Badge variant={parsedData.ai_confidence < 0.7 ? "destructive" : "default"} className="text-xs flex-shrink-0">
                      {(parsedData.ai_confidence * 100).toFixed(0)}%
                    </Badge>
                  )}
                </div>
                {parsedData.ai_confidence !== undefined && parsedData.ai_confidence < 0.7 && (
                  <p className="text-xs md:text-sm text-destructive mt-2">
                    Low confidence — please confirm before saving.
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <span className="text-xs text-muted-foreground block mb-1">Amount</span>
                    <span className="font-semibold text-base">{parsedData.parsed.amount} {parsedData.parsed.currency || "INR"}</span>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <span className="text-xs text-muted-foreground block mb-1">Date</span>
                    <span className="font-semibold">{parsedData.parsed.date || "Today"}</span>
                  </div>
                  {parsedData.parsed.category && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <span className="text-xs text-muted-foreground block mb-1">Category</span>
                      <span className="font-semibold">{parsedData.parsed.category}</span>
                    </div>
                  )}
                  {parsedData.parsed.vendor && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <span className="text-xs text-muted-foreground block mb-1">Vendor</span>
                      <span className="font-semibold">{parsedData.parsed.vendor}</span>
                    </div>
                  )}
                  {parsedData.parsed.description && (
                    <div className="bg-muted/50 p-3 rounded-lg col-span-1 sm:col-span-2">
                      <span className="text-xs text-muted-foreground block mb-1">Description</span>
                      <span className="font-semibold">{parsedData.parsed.description}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button onClick={handleSave} className="flex-1 h-11 md:h-10">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    <span className="text-sm md:text-base">Save Expense</span>
                  </Button>
                  <Button variant="outline" onClick={handleDiscard} className="h-11 md:h-10 sm:w-auto">
                    <X className="mr-2 h-4 w-4" />
                    <span className="text-sm md:text-base">Discard</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
