'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Search, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Zap, 
  Shield, 
  Globe, 
  FileText,
  ArrowRight,
  Play,
  Settings,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Bug,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import posthog from 'posthog-js'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'

interface AnalysisResult {
  url: string
  croScore: number
  uxScore: number
  overallGrade: string
  croAnalysis: CROAnalysis[]
  uxAnalysis: UXAnalysis[]
  recommendations: Recommendation[]
  timestamp: string
}

interface CROAnalysis {
  category: string
  questions: Question[]
  score: number
}

interface UXAnalysis {
  category: string
  questions: Question[]
  score: number
}

interface Question {
  question: string
  answer: 'yes' | 'no' | 'needs_work'
  evidence: string
  recommendation: string
  priority: 'high' | 'medium' | 'low'
}

interface Recommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  impact: string
  effort: string
  category: 'cro' | 'ux'
}

export default function AnalyzePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  
  // Debug state
  const [debugMode, setDebugMode] = useState(false)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [rawApiResponse, setRawApiResponse] = useState<any>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const addDebugLog = (message: string) => {
    if (debugMode) {
      setDebugLogs((prev: string[]) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    }
  }

  useEffect(() => {
    const urlParam = searchParams.get('url')
    if (urlParam) {
      setUrl(decodeURIComponent(urlParam))
      handleAnalyze(decodeURIComponent(urlParam))
    }
  }, [searchParams])

  const handleAnalyze = async (targetUrl?: string) => {
    const urlToAnalyze = targetUrl || url
    if (!urlToAnalyze) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    setAnalysisResult(null)
    setDebugLogs([])
    setRawApiResponse(null)
    setApiError(null)

    addDebugLog(`Starting analysis for: ${urlToAnalyze}`)

    // Track the analysis event
    posthog.capture('analysis_started', {
      url: urlToAnalyze,
      analysis_type: 'full_audit'
    })

    try {
      // Simulate progress updates
      const progressSteps = [
        { progress: 10, step: 'Initializing analysis...' },
        { progress: 25, step: 'Crawling website...' },
        { progress: 40, step: 'Analyzing CRO elements...' },
        { progress: 60, step: 'Evaluating UX factors...' },
        { progress: 80, step: 'Generating recommendations...' },
        { progress: 100, step: 'Finalizing report...' }
      ]

      for (const step of progressSteps) {
        setProgress(step.progress)
        setCurrentStep(step.step)
        addDebugLog(`Progress: ${step.progress}% - ${step.step}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      addDebugLog('Making API request to /api/analyze')
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToAnalyze }),
      })

      addDebugLog(`API Response Status: ${response.status}`)
      addDebugLog(`API Response Headers: ${JSON.stringify(Array.from(response.headers.entries()).reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}))}`)

      const responseText = await response.text()
      addDebugLog(`Raw API Response: ${responseText}`)

      if (!response.ok) {
        let errorMessage = 'Analysis failed'
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.error || 'Analysis failed'
          setApiError(errorMessage)
        } catch (e) {
          setApiError(responseText)
        }
        throw new Error(errorMessage)
      }

      let result
      try {
        result = JSON.parse(responseText)
        setRawApiResponse(result)
        addDebugLog('Successfully parsed API response')
      } catch (parseError) {
        addDebugLog(`JSON Parse Error: ${parseError}`)
        throw new Error('Invalid JSON response from API')
      }

      setAnalysisResult(result)
      addDebugLog(`Analysis completed. CRO Score: ${result.croScore}, UX Score: ${result.uxScore}`)

      // Track successful analysis
      posthog.capture('analysis_completed', {
        url: urlToAnalyze,
        cro_score: result.croScore,
        ux_score: result.uxScore,
        overall_grade: result.overallGrade
      })

      toast({
        title: "Analysis Complete!",
        description: `Your website scored ${result.overallGrade} with ${result.croScore}/15 CRO and ${result.uxScore}/18 UX points.`,
      })

    } catch (error) {
      console.error('Analysis error:', error)
      addDebugLog(`Analysis Error: ${error}`)
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your website. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
      setProgress(0)
      setCurrentStep('')
    }
  }

  const generatePDF = async () => {
    if (!analysisResult) return

    setIsGeneratingPDF(true)
    
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      let yPosition = 20

      // Title
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('CRO & UX Analysis Report', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20

      // Website URL
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Website: ${analysisResult.url}`, margin, yPosition)
      yPosition += 10
      doc.text(`Analysis Date: ${new Date(analysisResult.timestamp).toLocaleDateString()}`, margin, yPosition)
      yPosition += 20

      // Summary Scores
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Summary Scores', margin, yPosition)
      yPosition += 15

      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Overall Grade: ${analysisResult.overallGrade}`, margin, yPosition)
      yPosition += 8
      doc.text(`CRO Score: ${analysisResult.croScore}/15 (${((analysisResult.croScore / 15) * 100).toFixed(1)}%)`, margin, yPosition)
      yPosition += 8
      doc.text(`UX Score: ${analysisResult.uxScore}/18 (${((analysisResult.uxScore / 18) * 100).toFixed(1)}%)`, margin, yPosition)
      yPosition += 20

      // Recommendations
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Priority Recommendations', margin, yPosition)
      yPosition += 15

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      analysisResult.recommendations
        .sort((a: Recommendation, b: Recommendation) => {
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        })
        .slice(0, 10) // Limit to top 10 recommendations
        .forEach((rec: Recommendation, index: number) => {
          if (yPosition > 250) {
            doc.addPage()
            yPosition = 20
          }

          doc.setFont('helvetica', 'bold')
          doc.text(`${index + 1}. ${rec.title}`, margin, yPosition)
          yPosition += 6

          doc.setFont('helvetica', 'normal')
          const descriptionLines = doc.splitTextToSize(rec.description, contentWidth)
          doc.text(descriptionLines, margin, yPosition)
          yPosition += (descriptionLines.length * 5) + 5

          doc.setFontSize(8)
          doc.text(`Priority: ${rec.priority.toUpperCase()} | Impact: ${rec.impact} | Effort: ${rec.effort} | Category: ${rec.category.toUpperCase()}`, margin, yPosition)
          yPosition += 10
          doc.setFontSize(10)
        })

      // Add CRO Analysis
      if (yPosition > 200) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('CRO Analysis', margin, yPosition)
      yPosition += 15

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      analysisResult.croAnalysis.forEach((category: CROAnalysis, catIndex: number) => {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFont('helvetica', 'bold')
        doc.text(`${catIndex + 1}. ${category.category} (${category.score}%)`, margin, yPosition)
        yPosition += 8

        doc.setFont('helvetica', 'normal')
        category.questions.forEach((question: Question, qIndex: number) => {
          const questionText = `• ${question.question}`
          const questionLines = doc.splitTextToSize(questionText, contentWidth)
          doc.text(questionLines, margin + 5, yPosition)
          yPosition += (questionLines.length * 5) + 3

          doc.setFontSize(8)
          doc.text(`Answer: ${question.answer.toUpperCase()} | Priority: ${question.priority}`, margin + 10, yPosition)
          yPosition += 5
          doc.setFontSize(10)
        })
        yPosition += 5
      })

      // Add UX Analysis
      if (yPosition > 200) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('UX Analysis', margin, yPosition)
      yPosition += 15

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      analysisResult.uxAnalysis.forEach((category, catIndex) => {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFont('helvetica', 'bold')
        doc.text(`${catIndex + 1}. ${category.category} (${category.score}%)`, margin, yPosition)
        yPosition += 8

        doc.setFont('helvetica', 'normal')
        category.questions.forEach((question, qIndex) => {
          const questionText = `• ${question.question}`
          const questionLines = doc.splitTextToSize(questionText, contentWidth)
          doc.text(questionLines, margin + 5, yPosition)
          yPosition += (questionLines.length * 5) + 3

          doc.setFontSize(8)
          doc.text(`Answer: ${question.answer.toUpperCase()} | Priority: ${question.priority}`, margin + 10, yPosition)
          yPosition += 5
          doc.setFontSize(10)
        })
        yPosition += 5
      })

      // Footer
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, 290, { align: 'center' })
        doc.text('Generated by CRO-UX Analysis Tool', pageWidth / 2, 295, { align: 'center' })
      }

      // Download the PDF
      const filename = `cro_ux_analysis_${new URL(analysisResult.url).hostname.replace(/\./g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)

      toast({
        title: "PDF Generated!",
        description: `Report saved as ${filename}`,
      })

      // Track PDF generation
      posthog.capture('pdf_generated', {
        url: analysisResult.url,
        filename: filename
      })

    } catch (error) {
      console.error('PDF generation error:', error)
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getAnswerIcon = (answer: string) => {
    switch (answer) {
      case 'yes': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'no': return <XCircle className="h-5 w-5 text-red-500" />
      case 'needs_work': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CRO-UX Analysis</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setDebugMode(!debugMode)}
              className="flex items-center space-x-2"
            >
              {debugMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{debugMode ? 'Hide' : 'Show'} Debug</span>
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => router.push('/reports')}>
              Reports
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Debug Panel */}
        {debugMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto mb-8"
          >
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bug className="h-5 w-5 text-orange-600" />
                  <span>Debug Mode</span>
                </CardTitle>
                <CardDescription>
                  Real-time analysis of what's happening in the background
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="logs" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="logs">Debug Logs</TabsTrigger>
                    <TabsTrigger value="api">API Response</TabsTrigger>
                    <TabsTrigger value="errors">Errors</TabsTrigger>
                    <TabsTrigger value="test">API Test</TabsTrigger>
                  </TabsList>

                  <TabsContent value="logs" className="space-y-4">
                    <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                      {debugLogs.length === 0 ? (
                        <div className="text-gray-500">No debug logs yet. Start an analysis to see logs.</div>
                      ) : (
                        debugLogs.map((log, index) => (
                          <div key={index} className="mb-1">{log}</div>
                        ))
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setDebugLogs([])}
                      size="sm"
                    >
                      Clear Logs
                    </Button>
                  </TabsContent>

                  <TabsContent value="api" className="space-y-4">
                    {rawApiResponse ? (
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Raw API Response:</h4>
                        <pre className="text-sm overflow-x-auto bg-white p-4 rounded border">
                          {JSON.stringify(rawApiResponse, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-8">
                        No API response yet. Complete an analysis to see the response.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="errors" className="space-y-4">
                    {apiError ? (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">API Error:</h4>
                        <pre className="text-sm text-red-700 bg-red-100 p-3 rounded border overflow-x-auto">
                          {apiError}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-8">
                        No errors detected.
                      </div>
                                         )}

                   <TabsContent value="test" className="space-y-4">
                     <div className="space-y-4">
                       <div>
                         <h4 className="font-semibold mb-2">API Connection Test</h4>
                         <p className="text-sm text-gray-600 mb-4">
                           Test if the API endpoints are working correctly
                         </p>
                       </div>
                       
                       <div className="flex space-x-4">
                         <Button 
                           variant="outline"
                           onClick={async () => {
                             addDebugLog('Testing GET /api/test endpoint...')
                             try {
                               const response = await fetch('/api/test')
                               const data = await response.json()
                               addDebugLog(`Test GET response: ${JSON.stringify(data)}`)
                               setRawApiResponse(data)
                             } catch (error) {
                               addDebugLog(`Test GET error: ${error}`)
                               setApiError(error instanceof Error ? error.message : String(error))
                             }
                           }}
                         >
                           Test GET /api/test
                         </Button>
                         
                         <Button 
                           variant="outline"
                           onClick={async () => {
                             addDebugLog('Testing POST /api/test endpoint...')
                             try {
                               const response = await fetch('/api/test', {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ test: 'data', url: url || 'example.com' })
                               })
                               const data = await response.json()
                               addDebugLog(`Test POST response: ${JSON.stringify(data)}`)
                               setRawApiResponse(data)
                             } catch (error) {
                               addDebugLog(`Test POST error: ${error}`)
                               setApiError(error instanceof Error ? error.message : String(error))
                             }
                           }}
                         >
                           Test POST /api/test
                         </Button>
                       </div>
                       
                       <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                         <h5 className="font-semibold text-blue-800 mb-2">What to check:</h5>
                         <ul className="text-sm text-blue-700 space-y-1">
                           <li>• API endpoints are responding (status 200)</li>
                           <li>• Environment variables are loaded correctly</li>
                           <li>• OpenAI API key is configured (if using AI analysis)</li>
                           <li>• No CORS or network errors</li>
                         </ul>
                       </div>
                     </div>
                   </TabsContent>
                 </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* URL Input Section */}
        {!analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Website Analysis</CardTitle>
                <CardDescription>
                  Enter your website URL to get a comprehensive CRO and UX analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="Enter your website URL (e.g., https://example.com)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="text-lg py-3"
                    onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                    disabled={isAnalyzing}
                  />
                  <Button 
                    onClick={() => handleAnalyze()}
                    disabled={!url || isAnalyzing}
                    className="px-8 py-3"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Analyzing...
                      </div>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Progress Section */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Analyzing Your Website</CardTitle>
                <CardDescription>{currentStep}</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="w-full mb-4" />
                <div className="text-sm text-gray-600">
                  Progress: {progress}% complete
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results Section */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Overall Grade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{analysisResult.overallGrade}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">CRO Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{analysisResult.croScore}/15</div>
                  <div className="text-sm text-gray-500">{((analysisResult.croScore / 15) * 100).toFixed(1)}%</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">UX Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{analysisResult.uxScore}/18</div>
                  <div className="text-sm text-gray-500">{((analysisResult.uxScore / 18) * 100).toFixed(1)}%</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Website</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                    <a 
                      href={analysisResult.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate"
                    >
                      {new URL(analysisResult.url).hostname}
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis Tabs */}
            <Tabs defaultValue="recommendations" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="cro">CRO Analysis</TabsTrigger>
                <TabsTrigger value="ux">UX Analysis</TabsTrigger>
                <TabsTrigger value="details">Detailed Results</TabsTrigger>
              </TabsList>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Priority Recommendations</CardTitle>
                    <CardDescription>
                      Actionable insights to improve your website's performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.recommendations
                        .sort((a, b) => {
                          const priorityOrder = { high: 3, medium: 2, low: 1 }
                          return priorityOrder[b.priority] - priorityOrder[a.priority]
                        })
                        .map((rec, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-lg">{rec.title}</h4>
                              <Badge className={getPriorityColor(rec.priority)}>
                                {rec.priority.toUpperCase()} PRIORITY
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{rec.description}</p>
                            <div className="flex space-x-4 text-sm">
                              <span className="text-blue-600">Impact: {rec.impact}</span>
                              <span className="text-green-600">Effort: {rec.effort}</span>
                              <Badge variant="outline">{rec.category.toUpperCase()}</Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cro" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>CRO Analysis</CardTitle>
                    <CardDescription>
                      Conversion Rate Optimization evaluation results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {analysisResult.croAnalysis.map((category, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-lg">{category.category}</h4>
                            <Badge variant="secondary">{category.score}%</Badge>
                          </div>
                          <div className="space-y-3">
                            {category.questions.map((question, qIndex) => (
                              <div key={qIndex} className="border-l-4 border-gray-200 pl-4">
                                <div className="flex items-start space-x-3">
                                  {getAnswerIcon(question.answer)}
                                  <div className="flex-1">
                                    <p className="font-medium">{question.question}</p>
                                    <p className="text-sm text-gray-600 mt-1">{question.evidence}</p>
                                    <p className="text-sm text-blue-600 mt-1">{question.recommendation}</p>
                                  </div>
                                  <Badge className={getPriorityColor(question.priority)}>
                                    {question.priority}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ux" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>UX Analysis</CardTitle>
                    <CardDescription>
                      User Experience evaluation results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {analysisResult.uxAnalysis.map((category, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-lg">{category.category}</h4>
                            <Badge variant="secondary">{category.score}%</Badge>
                          </div>
                          <div className="space-y-3">
                            {category.questions.map((question, qIndex) => (
                              <div key={qIndex} className="border-l-4 border-gray-200 pl-4">
                                <div className="flex items-start space-x-3">
                                  {getAnswerIcon(question.answer)}
                                  <div className="flex-1">
                                    <p className="font-medium">{question.question}</p>
                                    <p className="text-sm text-gray-600 mt-1">{question.evidence}</p>
                                    <p className="text-sm text-blue-600 mt-1">{question.recommendation}</p>
                                  </div>
                                  <Badge className={getPriorityColor(question.priority)}>
                                    {question.priority}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Details</CardTitle>
                    <CardDescription>
                      Complete analysis information and metadata
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Analysis Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">URL:</span> {analysisResult.url}
                          </div>
                          <div>
                            <span className="font-medium">Analysis Date:</span> {analysisResult.timestamp}
                          </div>
                          <div>
                            <span className="font-medium">Total CRO Questions:</span> 15
                          </div>
                          <div>
                            <span className="font-medium">Total UX Questions:</span> 18
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <Button 
                          onClick={generatePDF}
                          disabled={isGeneratingPDF}
                        >
                          {isGeneratingPDF ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating PDF...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/dashboard')}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Dashboard
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  )
}
