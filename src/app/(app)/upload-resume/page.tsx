
// src/app/(app)/upload-resume/page.tsx
'use client';

import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { resumeGrader, type ResumeGraderOutput } from '@/ai/flows/resume-grader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
    FileText, Send, Loader2, CheckCircle, AlertCircle, FileUp, XCircle, 
    Sparkles, Lightbulb, TrendingUp, CheckSquare, BarChart3, Bot, ListChecks, ThumbsUp, ThumbsDown, ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link'; // Added Link

if (typeof window !== 'undefined') {
  const detectedPdfJsVersion = pdfjsLib.version;
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${detectedPdfJsVersion}/pdf.worker.mjs`;
}

const MINIMAL_TEXT_LENGTH_THRESHOLD = 100; // Characters

const getScoreColor = (score?: number): string => {
    if (score === undefined) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
};

const getProgressVariant = (score?: number): "default" | "success" | "warning" | "danger" => {
    if (score === undefined) return 'default';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
};

// Custom Progress component to handle color variants
const ColoredProgress = ({ value, variant }: { value: number; variant: "default" | "success" | "warning" | "danger" }) => {
  let colorClass = "bg-primary"; // Default
  if (variant === "success") colorClass = "bg-green-500";
  if (variant === "warning") colorClass = "bg-yellow-500";
  if (variant === "danger") colorClass = "bg-red-500";

  return (
    <ProgressPrimitive.Root
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary")}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 transition-all", colorClass)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
};
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"


interface AnalysisSectionProps {
  title: string;
  icon: React.ElementType;
  score?: number;
  feedback: string;
  suggestions?: string[];
  defaultOpen?: boolean;
}

const AnalysisSectionCard: React.FC<AnalysisSectionProps> = ({ title, icon: Icon, score, feedback, suggestions, defaultOpen }) => {
  const scoreColor = getScoreColor(score);
  return (
    <AccordionItem value={title.toLowerCase().replace(/\s+/g, '-')} className="border border-input rounded-lg bg-card hover:border-primary/50 transition-colors">
      <AccordionTrigger className="p-4 text-lg font-semibold hover:no-underline">
        <div className="flex items-center">
          <Icon className={`h-6 w-6 mr-3 ${score !== undefined ? scoreColor : 'text-primary'} flex-shrink-0`} />
          {title} 
          {score !== undefined && (
            <Badge variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'} className={`ml-3 ${scoreColor} border ${scoreColor.replace('text-', 'border-')}`}>
              Score: {score}/100
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0 space-y-3">
        <p className="whitespace-pre-line text-sm text-foreground/90 leading-relaxed">{feedback}</p>
        {suggestions && suggestions.length > 0 && (
          <div className="mt-2">
            <h4 className="font-semibold text-sm mb-1">Suggestions:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80 pl-4">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};


export default function UploadResumePage() {
  const { 
    setResumeText: setContextResumeText, 
    setResumeAnalysis: setContextResumeAnalysis,
    resumeText: initialResumeText,
    resumeAnalysis: initialResumeAnalysis,
    formattedQuizResults // To check if quiz has been taken
  } = useAppContext();
  
  const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(initialResumeText);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeGraderOutput | null>(initialResumeAnalysis);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (initialResumeText && !extractedText) setExtractedText(initialResumeText);
    if (initialResumeAnalysis && !analysisResult) setAnalysisResult(initialResumeAnalysis);
  }, [initialResumeText, initialResumeAnalysis, extractedText, analysisResult]);

  async function processSingleFile(file: File): Promise<string> {
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
        toast({ title: 'Minimal Text Extracted from PDF', description: 'Attempting OCR on PDF pages. This might take longer.' });
        let ocrTextFromPdf = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          if (context) {
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const imageDataUrl = canvas.toDataURL('image/png');
            toast({ title: `OCR on PDF Page ${i}/${pdf.numPages}...`});
            const { data: { text: pageOcrText } } = await Tesseract.recognize(imageDataUrl, 'eng');
            ocrTextFromPdf += pageOcrText + '\n\n'; 
          } else {
             console.error('Could not get canvas context for PDF page OCR');
             toast({ variant: 'destructive', title: `OCR Error on Page ${i}`, description: 'Could not prepare page for OCR.' });
          }
        }
        text = ocrTextFromPdf;
        if (text.trim().length > 0) {
            toast({ title: 'PDF OCR Complete', description: 'Text extracted from PDF pages using OCR.' });
        }
      } else {
        text = directTextExtraction;
      }
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // .docx
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value;
    } else if (file.type.startsWith('image/')) {
      toast({ title: 'Processing Image with OCR...', description: 'This can take a moment, please wait.' });
      const { data: { text: ocrText } } = await Tesseract.recognize(file, 'eng');
      text = ocrText;
    } else {
      toast({ variant: 'destructive', title: 'Unsupported File Type', description: 'Please upload a PDF, DOCX, JPG, or PNG file.' });
      return '';
    }
    return text;
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      setSelectedFiles(fileList);
      setExtractedText(null); 
      setContextResumeText(null);
      setAnalysisResult(null); 
      setContextResumeAnalysis(null);
      setIsProcessingFile(true);
      let combinedText = '';

      try {
        if (fileList.length === 1) {
          const file = fileList[0];
          toast({ title: 'Processing File...', description: `Extracting text from ${file.name}.` });
          combinedText = await processSingleFile(file);
        } else {
          const allImages = fileList.every(f => f.type.startsWith('image/'));
          if (!allImages) {
            toast({ variant: 'destructive', title: 'Unsupported Selection', description: 'If selecting multiple files, all must be images. Please upload PDF/DOCX as single files.' });
            setSelectedFiles(null);
          } else {
            toast({ title: 'Processing Multiple Images...', description: `Extracting text from ${fileList.length} images. This may take some time.` });
            for (let i = 0; i < fileList.length; i++) {
              const file = fileList[i];
              toast({ title: `Processing Image ${i + 1}/${fileList.length}...`, description: file.name });
              try {
                const { data: { text: ocrText } } = await Tesseract.recognize(file, 'eng');
                combinedText += ocrText + '\n\n'; 
              } catch (ocrError) {
                console.error(`Error OCRing image ${file.name}:`, ocrError);
                toast({ variant: 'destructive', title: `OCR Error on ${file.name}`, description: 'Could not extract text from this image.' });
              }
            }
            if (combinedText.trim().length > 0) {
              toast({ title: 'Multi-Image OCR Complete', description: 'Text extracted from all images.' });
            }
          }
        }

        if (combinedText.trim().length > 0) {
          setExtractedText(combinedText);
          setContextResumeText(combinedText); 
          toast({ title: 'File(s) Processed', description: 'Resume text extracted successfully. Ready for analysis.' });
        } else if (selectedFiles && selectedFiles.length > 0 && !(fileList.length > 1 && !fileList.every(f => f.type.startsWith('image/')))) { 
           toast({ variant: 'default', title: 'No Text Found', description: 'No text content could be extracted or content was minimal.'});
        }

      } catch (error) {
        console.error('Error processing file(s):', error);
        toast({ variant: 'destructive', title: 'File Processing Error', description: 'Could not read text from the file(s). Check console for details.' });
        setSelectedFiles(null); 
      } finally {
        setIsProcessingFile(false);
      }
    } else {
      setSelectedFiles(null); 
      setExtractedText(null); 
      setContextResumeText(null);
      setAnalysisResult(null); 
      setContextResumeAnalysis(null);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!extractedText) {
      toast({ variant: 'destructive', title: 'No Resume Text', description: 'Please upload and process a resume file first, or ensure the file was read correctly.' });
      return;
    }
    setIsLoadingAnalysis(true);
    setAnalysisResult(null); 
    setContextResumeAnalysis(null); 
    try {
      const result = await resumeGrader({ resumeText: extractedText });
      setAnalysisResult(result);
      setContextResumeAnalysis(result); 
      toast({ title: 'Resume Analyzed!', description: 'Check out your detailed report below.', action: <CheckCircle className="text-green-500" /> });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze the resume. Please try again.', action: <AlertCircle className="text-red-500" /> });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  
  const removeSelectedFiles = () => {
    setSelectedFiles(null);
    setExtractedText(null);
    setAnalysisResult(null);
    setContextResumeText(null);
    setContextResumeAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Resume Analyzer Pro</CardTitle>
          </div>
          <CardDescription className="text-base">
            Upload your resume (PDF, DOCX, JPG, PNG). Get a detailed, categorized analysis including ATS friendliness.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,image/jpeg,image/png" disabled={isProcessingFile || isLoadingAnalysis} multiple />
          
          {(!selectedFiles || selectedFiles.length === 0) && !extractedText ? (
            <Button onClick={triggerFileInput} variant="outline" className="w-full border-dashed border-2 py-10 flex-col h-auto" disabled={isProcessingFile || isLoadingAnalysis}>
              <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
              <span className="font-semibold text-primary">Click to upload your resume</span>
              <span className="text-sm text-muted-foreground">PDF, DOCX, JPG, PNG (single or multiple images)</span>
            </Button>
          ) : (
            <div className="p-4 border rounded-md bg-muted/50 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  {selectedFiles && selectedFiles.length === 1 ? (
                    <span className="text-sm font-medium truncate" title={selectedFiles[0].name}>
                      {selectedFiles[0].name} ({(selectedFiles[0].size / 1024).toFixed(1)} KB)
                    </span>
                  ) : selectedFiles && selectedFiles.length > 1 ? (
                    <span className="text-sm font-medium">
                      {selectedFiles.length} files selected ({ (selectedFiles.reduce((acc, file) => acc + file.size, 0) / 1024).toFixed(1) } KB total)
                    </span>
                  ) : extractedText && !selectedFiles ? (
                     <span className="text-sm font-medium">Using previously uploaded resume text.</span>
                  ) : ( <span className="text-sm font-medium">No file selected.</span> )}
                </div>
                {(selectedFiles || extractedText) && (
                  <Button variant="ghost" size="icon" onClick={removeSelectedFiles} disabled={isProcessingFile || isLoadingAnalysis} aria-label="Remove files/clear text">
                    <XCircle className="h-5 w-5 text-destructive hover:text-destructive/80" />
                  </Button>
                )}
              </div>
              {isProcessingFile && ( <div className="flex items-center text-sm text-primary"> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing file(s)... This may take some time. </div> )}
               {extractedText && !isProcessingFile && (
                <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    { selectedFiles ? "File(s) processed." : ""} Resume text available. Ready to analyze or re-upload.
                  </AlertDescription>
                </Alert>
              )}
              {extractedText && !selectedFiles && !isProcessingFile && (
                <Button onClick={triggerFileInput} variant="outline" size="sm" className="w-full sm:w-auto"> Upload Different File </Button>
              )}
            </div>
          )}

          <Button onClick={handleAnalyzeResume} disabled={isProcessingFile || isLoadingAnalysis || !extractedText} className="w-full sm:w-auto" size="lg">
            {isLoadingAnalysis ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing...</>) : (<><Send className="mr-2 h-5 w-5" />Analyze Resume</>)}
          </Button>

          {extractedText && !isProcessingFile && (
            <Card className="bg-background/50">
              <CardHeader><CardTitle className="text-lg">Extracted Text Preview (first 500 chars):</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground whitespace-pre-line break-all p-2 border rounded-md max-h-40 overflow-y-auto">
                  {extractedText.substring(0, 500)}{extractedText.length > 500 ? '...' : ''}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {isLoadingAnalysis && ( 
        <Card><CardContent className="pt-6 text-center"><Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" /><p className="mt-2 text-muted-foreground">Analyzing your resume, please wait...</p></CardContent></Card>
      )}

      {analysisResult && !isLoadingAnalysis && (
        <>
          <Card className="shadow-xl">
            <CardHeader className="border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                      <CardTitle className="text-3xl font-headline text-primary mb-1">Resume Analysis Report</CardTitle>
                      <CardDescription className="text-base">Detailed insights into your resume's effectiveness.</CardDescription>
                  </div>
                  <div className="text-right">
                      <p className="text-lg font-semibold">Overall Score:</p>
                      <p className={`text-5xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>{analysisResult.overallScore}<span className="text-2xl">/100</span></p>
                  </div>
              </div>
               <div className="mt-2">
                  <ColoredProgress value={analysisResult.overallScore} variant={getProgressVariant(analysisResult.overallScore)} />
               </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <Alert className={cn("border-l-4", 
                  analysisResult.overallScore >= 80 ? "border-green-500 bg-green-50 dark:bg-green-900/30" : 
                  analysisResult.overallScore >= 60 ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30" : 
                  "border-red-500 bg-red-50 dark:bg-red-900/30"
              )}>
                <Sparkles className={cn("h-5 w-5", 
                  analysisResult.overallScore >= 80 ? "text-green-600" : 
                  analysisResult.overallScore >= 60 ? "text-yellow-600" : 
                  "text-red-600"
                )} />
                <AlertTitle className="font-semibold text-lg">Summary</AlertTitle>
                <AlertDescription className="whitespace-pre-line text-sm leading-relaxed">{analysisResult.summary}</AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-6">
                  {analysisResult.positivePoints && analysisResult.positivePoints.length > 0 && (
                      <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700">
                          <CardHeader className="pb-3">
                              <CardTitle className="text-xl flex items-center text-green-700 dark:text-green-300">
                                  <ThumbsUp className="mr-2 h-5 w-5"/> Positive Points
                              </CardTitle>
                          </CardHeader>
                          <CardContent>
                              <ul className="list-disc list-inside space-y-1 text-sm text-green-800 dark:text-green-200">
                                  {analysisResult.positivePoints.map((point, index) => <li key={index}>{point}</li>)}
                              </ul>
                          </CardContent>
                      </Card>
                  )}
                  {analysisResult.areasForImprovement && analysisResult.areasForImprovement.length > 0 && (
                       <Card className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700">
                          <CardHeader className="pb-3">
                              <CardTitle className="text-xl flex items-center text-yellow-700 dark:text-yellow-300">
                                  <ThumbsDown className="mr-2 h-5 w-5"/> Areas for Improvement
                              </CardTitle>
                          </CardHeader>
                          <CardContent>
                              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                                  {analysisResult.areasForImprovement.map((area, index) => <li key={index}>{area}</li>)}
                              </ul>
                          </CardContent>
                      </Card>
                  )}
              </div>
              
              <Accordion type="multiple" defaultValue={['ats-friendliness']} className="w-full space-y-3">
                <AnalysisSectionCard 
                  title="Clarity & Conciseness"
                  icon={Lightbulb}
                  score={analysisResult.analysisCategories.clarityAndConciseness.score}
                  feedback={analysisResult.analysisCategories.clarityAndConciseness.feedback}
                  suggestions={analysisResult.analysisCategories.clarityAndConciseness.suggestions}
                />
                <AnalysisSectionCard 
                  title="Impact & Achievements"
                  icon={TrendingUp}
                  score={analysisResult.analysisCategories.impactAndAchievements.score}
                  feedback={analysisResult.analysisCategories.impactAndAchievements.feedback}
                  suggestions={analysisResult.analysisCategories.impactAndAchievements.suggestions}
                />
                <AnalysisSectionCard 
                  title="Format & Structure"
                  icon={CheckSquare}
                  score={analysisResult.analysisCategories.formatAndStructure.score}
                  feedback={analysisResult.analysisCategories.formatAndStructure.feedback}
                  suggestions={analysisResult.analysisCategories.formatAndStructure.suggestions}
                />
                <AnalysisSectionCard 
                  title="ATS Friendliness"
                  icon={Bot}
                  score={analysisResult.analysisCategories.atsFriendliness.score}
                  feedback={analysisResult.analysisCategories.atsFriendliness.feedback}
                  suggestions={analysisResult.analysisCategories.atsFriendliness.suggestions}
                  defaultOpen={true}
                />
              </Accordion>

              <Card className="mt-6">
                  <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                          <ListChecks className="mr-2 h-6 w-6 text-primary"/> Detailed Feedback
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="whitespace-pre-line text-sm text-foreground/90 leading-relaxed">{analysisResult.detailedFeedback}</p>
                  </CardContent>
              </Card>
            </CardContent>
          </Card>
          
          {!formattedQuizResults && (
            <Card className="shadow-lg mt-8 border-primary border-2">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Lightbulb className="h-7 w-7 text-primary animate-pulse" />
                  <CardTitle className="text-2xl font-headline">Next Step: Personality Quiz</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Now that your resume is analyzed, take our personality quiz to get even more tailored career suggestions and roadmaps!
                </p>
                <Button asChild size="lg">
                  <Link href="/quiz">
                    Take the Quiz Now <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
