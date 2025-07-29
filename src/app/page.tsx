"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import {
  UploadCloud,
  FileScan,
  Loader2,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { validateUserEdits } from "./actions";
import { cn } from "@/lib/utils";
import type { CorrectUserEditsOutput } from "@/ai/flows/correct-user-edits";

const MOCK_OCR_TEXT = `This is a sammple of extracted text from the document.
It might contain some OCR errors like mispeled words or incorrect punctuation, which the user can fix.
The AI will then validate the corrections to ensure accuracy.`;

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [editedText, setEditedText] = useState("");
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
  const [validationResult, setValidationResult] =
    useState<CorrectUserEditsOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      setIsProcessing(true);
      setValidationResult(null);

      const newImageUrl = URL.createObjectURL(file);
      setImageUrl(newImageUrl);

      // Simulate OCR processing delay
      setTimeout(() => {
        setOriginalText(MOCK_OCR_TEXT);
        setEditedText(MOCK_OCR_TEXT);
        if (isClient) {
          setOcrConfidence(Math.floor(Math.random() * (99 - 85 + 1) + 85));
        }
        setIsProcessing(false);
      }, 1500);
    }
  };

  const handleValidate = async () => {
    setIsProcessing(true);
    setValidationResult(null);
    try {
      const result = await validateUserEdits(originalText, editedText);
      setValidationResult(result);
    } catch (error) {
      console.error(error);
      setValidationResult({
        isValid: false,
        validationReason: "An error occurred during validation.",
      });
    }
    setIsProcessing(false);
  };

  const handleDownload = () => {
    const blob = new Blob([editedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qsnap-export.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isTextEdited = originalText !== editedText;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-10 px-4 text-center">
        <div className="inline-flex items-center gap-3">
          <FileScan className="h-10 w-10 text-primary" />
          <h1 className="font-headline text-5xl font-bold tracking-tight">
            QSnap
          </h1>
        </div>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Instantly digitize your documents. Upload an image to extract, edit,
          and validate text with the power of AI.
        </p>
      </header>

      <main className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="font-headline tracking-tight text-2xl">
                Upload Document
              </CardTitle>
              <CardDescription>
                Select a handwritten or printed text image (.png, .jpg, .webp)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="relative flex flex-col items-center justify-center w-full h-96 rounded-lg border-2 border-dashed border-border bg-muted/50 hover:border-primary transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  disabled={isProcessing}
                />
                {imageUrl && !isProcessing ? (
                  <Image
                    src={imageUrl}
                    alt="Uploaded Document"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-lg p-2"
                  />
                ) : (
                  <div className="text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-sm font-semibold text-primary">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Max file size: 10MB
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="font-headline tracking-tight text-2xl">
                Extracted Text
              </CardTitle>
              <CardDescription>
                Edit the extracted text below and validate your changes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!imageUrl && !isProcessing && (
                <div className="flex flex-col items-center justify-center text-center h-96 bg-muted/50 rounded-lg">
                  <FileScan className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 font-medium">
                    Your extracted text will appear here.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upload a document to get started.
                  </p>
                </div>
              )}
              {isProcessing && !ocrConfidence && (
                 <div className="flex flex-col items-center justify-center text-center h-96 bg-muted/50 rounded-lg">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <p className="mt-4 font-medium">Extracting Text...</p>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we analyze your document.
                  </p>
                </div>
              )}

              {ocrConfidence && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      OCR Confidence
                    </label>
                    <div className="flex items-center gap-3 mt-1">
                      <Progress value={ocrConfidence} className="w-full" />
                      <span className="font-mono text-sm font-semibold text-primary">
                        {ocrConfidence}%
                      </span>
                    </div>
                  </div>
                  <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    placeholder="Extracted text will appear here..."
                    className="h-64 text-base resize-none bg-background"
                    disabled={isProcessing}
                  />
                  {validationResult && (
                    <Alert
                      variant={
                        validationResult.isValid ? "default" : "destructive"
                      }
                      className={cn(
                        validationResult.isValid &&
                          "border-success/50 bg-success/10 text-success-foreground"
                      )}
                    >
                      {validationResult.isValid ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      <AlertTitle className="font-semibold">
                        {validationResult.isValid
                          ? "Validation Successful"
                          : "Validation Suggestion"}
                      </AlertTitle>
                      <AlertDescription>
                        {validationResult.validationReason}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
            {ocrConfidence && (
              <CardFooter className="flex justify-end gap-3">
                <Button
                  onClick={handleValidate}
                  disabled={isProcessing || !isTextEdited}
                  variant="outline"
                >
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Validate Changes
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={!editedText || isProcessing}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Text
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
