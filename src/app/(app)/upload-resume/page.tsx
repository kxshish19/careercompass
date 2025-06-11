
// src/app/(app)/upload-resume/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { resumeGrader, type ResumeGraderOutput } from '@/ai/flows/resume-grader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, Send, Loader2, CheckCircle, AlertCircle, FileUp, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

// Setting worker path for pdfjs-dist
if (typeof window !== 'undefined') {
  const PDFJS_WORKER_VERSION = '4.3.136'; 
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_WORKER_VERSION}/pdf.worker.min.js`;
}

const MINIMAL_TEXT_LENGTH_THRESHOLD = 100; // Characters

export default function UploadResumePage() {
  const { setResumeText: setContextResumeText, setResumeAnalysis: setContextResumeAnalysis } = useAppContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeGraderOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Clear results if file is removed
    if (!selectedFile) {
      setExtractedText(null);
      setAnalysisResult(null);
      setContextResumeText(null);
      setContextResumeAnalysis(null);
    }
  }, [selectedFile, setContextResumeText, setContextResumeAnalysis]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractedText(null); 
      setAnalysisResult(null); 
      setIsProcessingFile(true);
      toast({ title: 'Processing File...', description: 'Extracting text from your resume. This may take a moment.' });
      try {
        let text = '';
        if (file.type === 'application/pdf') {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let directTextExtraction = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            directTextExtraction += content.items.map((item: any) => item.str).join(' ') + '\n';
          }

          if (directTextExtraction.trim().length < MINIMAL_TEXT_LENGTH_THRESHOLD) {
            toast({ title: 'Minimal Text Extracted', description: 'Initial PDF text extraction yielded little content. Attempting OCR on PDF pages. This might take longer.' });
            let ocrTextFromPdf = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 1.5 }); // Scale can be adjusted for OCR quality
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              
              if (context) {
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                const imageDataUrl = canvas.toDataURL('image/png');
                toast({ title: `Processing PDF Page ${i}/${pdf.numPages} with OCR...`});
                const { data: { text: pageOcrText } } = await Tesseract.recognize(imageDataUrl, 'eng', {
                  // logger: m => console.log(m) 
                });
                ocrTextFromPdf += pageOcrText + '\n';
              } else {
                 console.error('Could not get canvas context for PDF page OCR');
                 toast({ variant: 'destructive', title: `OCR Error on Page ${i}`, description: 'Could not prepare page for OCR.' });
              }
            }
            text = ocrTextFromPdf;
            toast({ title: 'PDF OCR Complete', description: 'Text extracted from PDF pages using OCR.' });
          } else {
            text = directTextExtraction;
          }

        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // .docx
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          text = result.value;
        } else if (file.type.startsWith('image/')) {
           toast({ title: 'Processing Image with OCR...', description: 'This can take a moment, please wait.' });
          const { data: { text: ocrText } } = await Tesseract.recognize(file, 'eng', {
            // logger: m => console.log(m) 
          });
          text = ocrText;
        } else {
          toast({ variant: 'destructive', title: 'Unsupported File Type', description: 'Please upload a PDF, DOCX, JPG, or PNG file.' });
          setSelectedFile(null);
          setIsProcessingFile(false);
          return;
        }
        setExtractedText(text);
        setContextResumeText(text); 
        toast({ title: 'File Processed', description: 'Resume text extracted successfully. Ready for analysis.' });
      } catch (error) {
        console.error('Error processing file:', error);
        toast({ variant: 'destructive', title: 'File Processing Error', description: 'Could not read text from the file. Check console for details.' });
        setSelectedFile(null);
        setExtractedText(null);
      } finally {
        setIsProcessingFile(false);
      }
    }
  };

  const handleAnalyzeResume = async () => {
    if (!extractedText) {
      toast({
        variant: 'destructive',
        title: 'No Resume Text',
        description: 'Please upload and process a resume file first, or ensure the file was read correctly.',
      });
      return;
    }

    setIsLoadingAnalysis(true);
    setAnalysisResult(null);
    try {
      const result = await resumeGrader({ resumeText: extractedText });
      setAnalysisResult(result);
      setContextResumeAnalysis(result);
      toast({
        title: 'Resume Analyzed!',
        description: 'Check out your score and feedback below.',
        action: <CheckCircle className="text-green-500" />,
      });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not analyze the resume. Please try again.',
        action: <AlertCircle className="text-red-500" />,
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Resume Analyzer</CardTitle>
          </div>
          <CardDescription className="text-base">
            Upload your resume (PDF, DOCX, JPG, PNG) to get an AI-powered analysis, score, and actionable feedback.
            If a PDF contains mostly images, OCR will be attempted on each page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.docx,image/jpeg,image/png"
            disabled={isProcessingFile || isLoadingAnalysis}
          />
          
          {!selectedFile ? (
            <Button 
              onClick={triggerFileInput} 
              variant="outline" 
              className="w-full border-dashed border-2 py-10 flex-col h-auto"
              disabled={isProcessingFile || isLoadingAnalysis}
            >
              <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
              <span className="font-semibold text-primary">Click to upload your resume</span>
              <span className="text-sm text-muted-foreground">PDF, DOCX, JPG, or PNG</span>
            </Button>
          ) : (
            <div className="p-4 border rounded-md bg-muted/50 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <Button variant="ghost" size="icon" onClick={removeSelectedFile} disabled={isProcessingFile || isLoadingAnalysis} aria-label="Remove file">
                  <XCircle className="h-5 w-5 text-destructive hover:text-destructive/80" />
                </Button>
              </div>
              {isProcessingFile && (
                 <div className="flex items-center text-sm text-primary">
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Processing file... This may take some time depending on the file.
                 </div>
              )}
               {extractedText && !isProcessingFile && (
                <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    File processed. Ready to analyze.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Button 
            onClick={handleAnalyzeResume} 
            disabled={isProcessingFile || isLoadingAnalysis || !extractedText} 
            className="w-full sm:w-auto"
            size="lg"
          >
            {isLoadingAnalysis ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Analyze Resume
              </>
            )}
          </Button>

          {extractedText && !isProcessingFile && (
            <Card className="bg-background/50">
              <CardHeader>
                <CardTitle className="text-lg">Extracted Text Preview (first 500 chars):</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap break-all p-2 border rounded-md max-h-40 overflow-y-auto">
                  {extractedText.substring(0, 500)}...
                </p>
              </CardContent>
            </Card>
          )}

        </CardContent>
      </Card>

      {(isLoadingAnalysis || (isProcessingFile && !selectedFile)) && ( 
        <Card>
          <CardContent className="pt-6 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">
              {isProcessingFile && !selectedFile ? "Waiting for file selection..." : isLoadingAnalysis ? "Analyzing your resume, please wait..." : "Processing file..."}
            </p>
          </CardContent>
        </Card>
      )}

      {analysisResult && !isLoadingAnalysis && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-lg font-semibold">Overall Score: {analysisResult.score}/100</Label>
              <Progress value={analysisResult.score} className="mt-2 h-4 rounded-full" />
               <p className="text-xs text-muted-foreground mt-1">
                {analysisResult.score < 50 ? "Needs significant improvement." : analysisResult.score < 75 ? "Good start, but room to grow." : "Strong resume!"}
              </p>
            </div>
            <Alert variant={analysisResult.score < 50 ? "destructive" : analysisResult.score < 75 ? "default": "default"} className={analysisResult.score >= 75 ? "border-green-500" : ""}>
              {analysisResult.score >= 75 && <CheckCircle className="h-5 w-5 text-green-500" />}
              <AlertTitle className="text-lg font-semibold">Feedback & Suggestions</AlertTitle>
              <AlertDescription className="whitespace-pre-line text-sm leading-relaxed">
                {analysisResult.feedback}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Minimal Label component if not already globally available or for simplicity
const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <label className={`block text-sm font-medium text-foreground ${className}`}>
    {children}
  </label>
);
