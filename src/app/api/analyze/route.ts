import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import OpenAI from 'openai'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// PostHog configuration
const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

// CRO Audit Questions
const CRO_QUESTIONS = [
  {
    category: "Offers & Messaging",
    questions: [
      "Is there a clear, compelling value proposition above the fold?",
      "Are there multiple clear calls-to-action (CTAs) on the page?",
      "Is there social proof (testimonials, reviews, case studies) visible?",
      "Are there urgency or scarcity elements (limited time, limited quantity)?"
    ]
  },
  {
    category: "Social Proof & Trust",
    questions: [
      "Are there customer testimonials or reviews prominently displayed?",
      "Are there trust signals (security badges, certifications, guarantees)?"
    ]
  },
  {
    category: "Analytics & Tracking",
    questions: [
      "Is there proper conversion tracking set up?",
      "Are there A/B testing tools or experiments running?"
    ]
  },
  {
    category: "Lead Capture & Forms",
    questions: [
      "Are forms optimized for conversion (minimal fields, clear labels)?",
      "Is there a lead magnet or free offer to capture emails?"
    ]
  },
  {
    category: "Urgency & Scarcity",
    questions: [
      "Are there time-sensitive offers or limited availability indicators?"
    ]
  },
  {
    category: "Pricing & Friction",
    questions: [
      "Is pricing transparent and easy to understand?",
      "Are there multiple pricing tiers or options available?"
    ]
  },
  {
    category: "Speed & Experimentation",
    questions: [
      "Does the page load quickly (under 3 seconds)?",
      "Are there ongoing optimization efforts or experiments?"
    ]
  }
]

// UX Audit Questions
const UX_QUESTIONS = [
  {
    category: "Performance & Stability",
    questions: [
      "Does the page load quickly and reliably?",
      "Are there any broken links or 404 errors?"
    ]
  },
  {
    category: "Mobile-First Usability",
    questions: [
      "Is the site fully responsive and mobile-friendly?",
      "Are touch targets appropriately sized for mobile?",
      "Is the navigation intuitive on mobile devices?"
    ]
  },
  {
    category: "Navigation & Information Architecture",
    questions: [
      "Is the navigation clear and easy to understand?",
      "Is there a logical information hierarchy?"
    ]
  },
  {
    category: "Accessibility (WCAG 2.1 AA)",
    questions: [
      "Are there proper alt texts for images?",
      "Is there sufficient color contrast?",
      "Is the site keyboard navigable?"
    ]
  },
  {
    category: "Content & Microcopy",
    questions: [
      "Is the content clear, concise, and scannable?",
      "Are error messages helpful and actionable?"
    ]
  },
  {
    category: "Error States & Feedback",
    questions: [
      "Are form validation errors clear and helpful?",
      "Is there appropriate feedback for user actions?"
    ]
  },
  {
    category: "Visual Design & Consistency",
    questions: [
      "Is the design consistent throughout the site?",
      "Are visual elements properly aligned and spaced?"
    ]
  },
  {
    category: "Delight & Engagement",
    questions: [
      "Are there interactive elements that engage users?",
      "Is the overall experience enjoyable and memorable?"
    ]
  }
]

async function fetchWebsiteContent(url: string) {
  try {
    console.log('Fetching website:', url)
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    })
    
    console.log('Website fetched successfully, status:', response.status)
    const html = response.data
    
    // Extract key information using regex
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''
    
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    const description = descMatch ? descMatch[1] : ''
    
    const headings: string[] = []
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || []
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || []
    const h3Matches = html.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || []
    
    headings.push(...h1Matches.map((h: string) => h.replace(/<[^>]*>/g, '').trim()))
    headings.push(...h2Matches.map((h: string) => h.replace(/<[^>]*>/g, '').trim()))
    headings.push(...h3Matches.map((h: string) => h.replace(/<[^>]*>/g, '').trim()))
    
    const linkMatches = html.match(/<a[^>]*href=["']([^"']+)["'][^>]*>/gi) || []
    const links = linkMatches.map((link: string) => {
      const hrefMatch = link.match(/href=["']([^"']+)["']/i)
      return hrefMatch ? hrefMatch[1] : ''
    }).filter((link: string) => link)
    
    const imgMatches = html.match(/<img[^>]*alt=["']([^"']+)["'][^>]*>/gi) || []
    const images = imgMatches.map((img: string) => {
      const altMatch = img.match(/alt=["']([^"']+)["']/i)
      return altMatch ? altMatch[1] : ''
    }).filter((alt: string) => alt)
    
    const forms = (html.match(/<form[^>]*>/gi) || []).length
    const buttons = (html.match(/<(button|input[^>]*type=["']submit["'])[^>]*>/gi) || []).length
    
    console.log('Extracted content:', {
      title: title.substring(0, 100),
      description: description.substring(0, 100),
      headingsCount: headings.length,
      linksCount: links.length,
      imagesCount: images.length,
      forms,
      buttons
    })
    
    return {
      title,
      description,
      headings,
      links,
      images,
      forms,
      buttons,
      html: response.data,
      status: response.status
    }
  } catch (error: any) {
    console.error('Error fetching website:', error.message)
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Connection refused. The website may be blocking requests or is not accessible.')
    } else if (error.code === 'ENOTFOUND') {
      throw new Error('Website not found. Please check the URL and try again.')
    } else if (error.response?.status === 403) {
      throw new Error('Access forbidden. The website is blocking automated requests.')
    } else if (error.response?.status === 404) {
      throw new Error('Page not found. Please check the URL and try again.')
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Request timed out. The website may be slow or unresponsive.')
    } else {
      throw new Error(`Failed to fetch website content: ${error.message}`)
    }
  }
}

async function analyzeWithAI(content: any, questions: any[], category: string) {
  const prompt = `
Analyze the following website content for ${category}:

Website Title: ${content.title}
Description: ${content.description}
Headings: ${content.headings.join(', ')}
Number of Forms: ${content.forms}
Number of Buttons: ${content.buttons}
Images with Alt Text: ${content.images.filter((img: string) => img).length}/${content.images.length}

Please analyze each question and provide:
1. Answer: "yes", "no", or "needs_work"
2. Evidence: Brief explanation based on the content
3. Recommendation: Specific actionable advice
4. Priority: "high", "medium", or "low"

Questions to analyze:
${questions.map((q: any, i: number) => `${i + 1}. ${q}`).join('\n')}

Respond in JSON format:
{
  "questions": [
    {
      "question": "question text",
      "answer": "yes/no/needs_work",
      "evidence": "explanation",
      "recommendation": "actionable advice",
      "priority": "high/medium/low"
    }
  ]
}
`

  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key not configured, using fallback analysis')
      return performFallbackAnalysis(content, questions, category)
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a CRO and UX expert. Analyze websites objectively and provide actionable recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from AI')

    // Try to parse JSON response
    try {
      return JSON.parse(response)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('Invalid AI response format')
    }
  } catch (error: any) {
    console.error('AI analysis error:', error.message)
    
    // Provide more specific error messages
    let errorMessage = 'Unable to analyze due to technical issues'
    let recommendation = 'Please review manually'
    
    if (error.message?.includes('rate limit')) {
      errorMessage = 'OpenAI rate limit exceeded. Please try again in a few minutes.'
      recommendation = 'Wait a few minutes and try again, or upgrade your OpenAI plan.'
    } else if (error.message?.includes('quota')) {
      errorMessage = 'OpenAI quota exceeded. Please check your API usage.'
      recommendation = 'Check your OpenAI account usage and billing status.'
    } else if (error.message?.includes('invalid api key')) {
      errorMessage = 'Invalid OpenAI API key. Please check your configuration.'
      recommendation = 'Verify your OpenAI API key in the environment variables.'
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'AI analysis timed out. The request took too long to process.'
      recommendation = 'Try analyzing a smaller website or try again later.'
    } else if (error.message?.includes('Invalid AI response format')) {
      errorMessage = 'AI response format error. The analysis could not be parsed.'
      recommendation = 'Try again, or contact support if the issue persists.'
    }
    
    // Return fallback analysis with specific error message
    return {
      questions: questions.map((q: any) => ({
        question: q,
        answer: 'needs_work',
        evidence: errorMessage,
        recommendation: recommendation,
        priority: 'medium'
      }))
    }
  }
}

// Add fallback analysis function
function performFallbackAnalysis(content: any, questions: any[], category: string) {
  console.log('Performing fallback analysis for category:', category)
  
  const analysis = questions.map((question: string) => {
    let answer = 'needs_work'
    let evidence = 'Basic analysis based on available content'
    let recommendation = 'Review this aspect manually for detailed insights'
    let priority = 'medium'

    // Basic heuristic analysis based on content
    const lowerQuestion = question.toLowerCase()
    const lowerTitle = content.title.toLowerCase()
    const lowerDescription = content.description.toLowerCase()
    const headings = content.headings.map((h: string) => h.toLowerCase())
    const hasForms = content.forms > 0
    const hasButtons = content.buttons > 0
    const hasImages = content.images.length > 0

    if (lowerQuestion.includes('value proposition') || lowerQuestion.includes('clear')) {
      if (content.title && content.description) {
        answer = 'yes'
        evidence = 'Website has a title and description'
        recommendation = 'Ensure your value proposition is prominently displayed above the fold'
      }
    } else if (lowerQuestion.includes('call-to-action') || lowerQuestion.includes('cta')) {
      if (hasButtons) {
        answer = 'yes'
        evidence = `Found ${content.buttons} buttons/CTAs on the page`
        recommendation = 'Ensure CTAs are clear, prominent, and action-oriented'
      } else {
        answer = 'no'
        evidence = 'No buttons or CTAs detected'
        recommendation = 'Add clear call-to-action buttons to guide user behavior'
        priority = 'high'
      }
    } else if (lowerQuestion.includes('testimonial') || lowerQuestion.includes('review')) {
      const hasSocialProof = headings.some((h: string) => 
        h.includes('testimonial') || h.includes('review') || h.includes('customer')
      )
      if (hasSocialProof) {
        answer = 'yes'
        evidence = 'Found potential social proof content in headings'
        recommendation = 'Ensure testimonials are prominently displayed and credible'
      } else {
        answer = 'no'
        evidence = 'No testimonials or reviews detected'
        recommendation = 'Add customer testimonials and reviews to build trust'
        priority = 'medium'
      }
    } else if (lowerQuestion.includes('form') || lowerQuestion.includes('lead capture')) {
      if (hasForms) {
        answer = 'yes'
        evidence = `Found ${content.forms} forms on the page`
        recommendation = 'Optimize forms for conversion with minimal fields and clear labels'
      } else {
        answer = 'no'
        evidence = 'No forms detected'
        recommendation = 'Add lead capture forms to collect visitor information'
        priority = 'high'
      }
    } else if (lowerQuestion.includes('mobile') || lowerQuestion.includes('responsive')) {
      answer = 'needs_work'
      evidence = 'Mobile responsiveness requires manual testing'
      recommendation = 'Test website on various mobile devices and screen sizes'
    } else if (lowerQuestion.includes('speed') || lowerQuestion.includes('load')) {
      answer = 'needs_work'
      evidence = 'Page speed requires performance testing tools'
      recommendation = 'Use tools like Google PageSpeed Insights to measure and optimize loading speed'
    } else if (lowerQuestion.includes('accessibility') || lowerQuestion.includes('alt text')) {
      const imagesWithAlt = content.images.filter((img: string) => img).length
      const totalImages = content.images.length
      if (totalImages > 0) {
        if (imagesWithAlt === totalImages) {
          answer = 'yes'
          evidence = `All ${totalImages} images have alt text`
          recommendation = 'Maintain accessibility standards for all new images'
        } else {
          answer = 'needs_work'
          evidence = `${imagesWithAlt}/${totalImages} images have alt text`
          recommendation = 'Add alt text to all images for better accessibility'
          priority = 'medium'
        }
      } else {
        answer = 'needs_work'
        evidence = 'No images detected to analyze'
        recommendation = 'Ensure all images have descriptive alt text when added'
      }
    } else if (lowerQuestion.includes('navigation') || lowerQuestion.includes('hierarchy')) {
      if (headings.length > 0) {
        answer = 'yes'
        evidence = `Found ${headings.length} headings indicating content structure`
        recommendation = 'Ensure navigation follows logical information hierarchy'
      } else {
        answer = 'needs_work'
        evidence = 'Limited heading structure detected'
        recommendation = 'Improve content structure with proper heading hierarchy'
      }
    } else if (lowerQuestion.includes('tracking') || lowerQuestion.includes('analytics')) {
      answer = 'needs_work'
      evidence = 'Analytics setup requires manual verification'
      recommendation = 'Verify Google Analytics or other tracking tools are properly configured'
    } else if (lowerQuestion.includes('a/b testing') || lowerQuestion.includes('experiment')) {
      answer = 'needs_work'
      evidence = 'A/B testing setup requires manual verification'
      recommendation = 'Consider implementing A/B testing tools like Optimizely or Google Optimize'
    } else if (lowerQuestion.includes('urgency') || lowerQuestion.includes('scarcity')) {
      const hasUrgency = headings.some((h: string) => 
        h.includes('limited') || h.includes('offer') || h.includes('sale') || h.includes('time')
      )
      if (hasUrgency) {
        answer = 'yes'
        evidence = 'Found potential urgency/scarcity elements in content'
        recommendation = 'Ensure urgency elements are genuine and not misleading'
      } else {
        answer = 'no'
        evidence = 'No urgency or scarcity elements detected'
        recommendation = 'Consider adding limited-time offers or scarcity indicators'
      }
    } else if (lowerQuestion.includes('pricing') || lowerQuestion.includes('cost')) {
      const hasPricing = headings.some((h: string) => 
        h.includes('price') || h.includes('cost') || h.includes('fee') || h.includes('$')
      )
      if (hasPricing) {
        answer = 'yes'
        evidence = 'Found potential pricing information in content'
        recommendation = 'Ensure pricing is clear, transparent, and easy to understand'
      } else {
        answer = 'needs_work'
        evidence = 'Pricing information not clearly detected'
        recommendation = 'Make pricing information clear and accessible to visitors'
      }
    }

    return {
      question,
      answer,
      evidence,
      recommendation,
      priority
    }
  })

  return { questions: analysis }
}

function calculateScore(questions: any[]) {
  const scores: number[] = questions.map((q: any) => {
    switch (q.answer) {
      case 'yes': return 1
      case 'needs_work': return 0.5
      case 'no': return 0
      default: return 0
    }
  })
  return scores.reduce((sum: number, score: number) => sum + score, 0)
}

function calculateOverallGrade(croScore: number, uxScore: number) {
  const totalScore = (croScore / 15) * 0.5 + (uxScore / 18) * 0.5
  if (totalScore >= 0.9) return 'A'
  if (totalScore >= 0.8) return 'B'
  if (totalScore >= 0.7) return 'C'
  if (totalScore >= 0.6) return 'D'
  return 'F'
}

function generateRecommendations(croAnalysis: any[], uxAnalysis: any[]) {
  const recommendations: any[] = []
  
  // High priority recommendations
  const highPriority = [...croAnalysis, ...uxAnalysis]
    .flatMap((cat: any) => cat.questions)
    .filter((q: any) => q.priority === 'high' && q.answer !== 'yes')
    .slice(0, 5)
  
  highPriority.forEach((q: any) => {
    recommendations.push({
      title: `Fix: ${q.question}`,
      description: q.recommendation,
      priority: 'high' as const,
      impact: 'High',
      effort: 'Medium',
      category: croAnalysis.some((cat: any) => cat.questions.includes(q)) ? 'cro' as const : 'ux' as const
    })
  })
  
  // Medium priority recommendations
  const mediumPriority = [...croAnalysis, ...uxAnalysis]
    .flatMap((cat: any) => cat.questions)
    .filter((q: any) => q.priority === 'medium' && q.answer !== 'yes')
    .slice(0, 3)
  
  mediumPriority.forEach((q: any) => {
    recommendations.push({
      title: `Improve: ${q.question}`,
      description: q.recommendation,
      priority: 'medium' as const,
      impact: 'Medium',
      effort: 'Low',
      category: croAnalysis.some((cat: any) => cat.questions.includes(q)) ? 'cro' as const : 'ux' as const
    })
  })
  
  return recommendations
}

export async function POST(request: NextRequest) {
  console.log('=== API Analysis Started ===')
  
  try {
    const { url } = await request.json()
    console.log('Received URL:', url)
    
    if (!url) {
      console.log('Error: No URL provided')
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
      console.log('URL validation passed')
    } catch {
      console.log('Error: Invalid URL format')
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    console.log('Checking OpenAI API key...')
    if (!process.env.OPENAI_API_KEY) {
      console.log('Warning: OpenAI API key is not configured, will use fallback analysis')
    } else {
      console.log('OpenAI API key is configured')
    }

    // Track analysis start in PostHog
    if (POSTHOG_API_KEY) {
      try {
        await axios.post(`${POSTHOG_HOST}/capture`, {
          api_key: POSTHOG_API_KEY,
          event: 'api_analysis_started',
          properties: {
            url: url,
            timestamp: new Date().toISOString()
          }
        })
        console.log('PostHog tracking: analysis started')
      } catch (error) {
        console.error('PostHog tracking error:', error)
      }
    }

    // Fetch website content
    console.log('Starting website content fetch...')
    const content = await fetchWebsiteContent(url)
    console.log('Website content fetched successfully')
    console.log('Content summary:', {
      title: content.title?.substring(0, 100),
      description: content.description?.substring(0, 100),
      headingsCount: content.headings.length,
      forms: content.forms,
      buttons: content.buttons,
      imagesCount: content.images.length
    })
    
    // Analyze CRO
    console.log('Starting CRO analysis...')
    const croResults: any[] = []
    for (const category of CRO_QUESTIONS) {
      console.log(`Analyzing CRO category: ${category.category}`)
      const analysis = await analyzeWithAI(content, category.questions, category.category)
      console.log(`CRO category ${category.category} analysis completed:`, {
        questionsCount: analysis.questions.length,
        answers: analysis.questions.map((q: any) => q.answer)
      })
      croResults.push({
        category: category.category,
        questions: analysis.questions,
        score: Math.round((calculateScore(analysis.questions) / category.questions.length) * 100)
      })
      console.log(`Completed CRO category: ${category.category}`)
    }
    
    // Analyze UX
    console.log('Starting UX analysis...')
    const uxResults: any[] = []
    for (const category of UX_QUESTIONS) {
      console.log(`Analyzing UX category: ${category.category}`)
      const analysis = await analyzeWithAI(content, category.questions, category.category)
      console.log(`UX category ${category.category} analysis completed:`, {
        questionsCount: analysis.questions.length,
        answers: analysis.questions.map((q: any) => q.answer)
      })
      uxResults.push({
        category: category.category,
        questions: analysis.questions,
        score: Math.round((calculateScore(analysis.questions) / category.questions.length) * 100)
      })
      console.log(`Completed UX category: ${category.category}`)
    }
    
    // Calculate scores
    const croScore = Math.round(calculateScore(croResults.flatMap((cat: any) => cat.questions)))
    const uxScore = Math.round(calculateScore(uxResults.flatMap((cat: any) => cat.questions)))
    const overallGrade = calculateOverallGrade(croScore, uxScore)
    
    console.log('Final scores calculated:', {
      croScore,
      uxScore,
      overallGrade
    })
    
    // Generate recommendations
    const recommendations = generateRecommendations(croResults, uxResults)
    console.log('Generated recommendations:', recommendations.length)
    
    const result = {
      url,
      croScore,
      uxScore,
      overallGrade,
      croAnalysis: croResults,
      uxAnalysis: uxResults,
      recommendations,
      timestamp: new Date().toISOString()
    }

    console.log('Analysis completed successfully')

    // Track successful analysis in PostHog
    if (POSTHOG_API_KEY) {
      try {
        await axios.post(`${POSTHOG_HOST}/capture`, {
          api_key: POSTHOG_API_KEY,
          event: 'api_analysis_completed',
          properties: {
            url: url,
            cro_score: croScore,
            ux_score: uxScore,
            overall_grade: overallGrade,
            timestamp: new Date().toISOString()
          }
        })
        console.log('PostHog tracking: analysis completed')
      } catch (error) {
        console.error('PostHog tracking error:', error)
      }
    }

    console.log('=== API Analysis Completed Successfully ===')
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('=== API Analysis Error ===')
    console.error('Error details:', error)
    
    // Track error in PostHog
    if (POSTHOG_API_KEY) {
      try {
        await axios.post(`${POSTHOG_HOST}/capture`, {
          api_key: POSTHOG_API_KEY,
          event: 'api_analysis_error',
          properties: {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          }
        })
        console.log('PostHog tracking: error logged')
      } catch (posthogError) {
        console.error('PostHog error tracking failed:', posthogError)
      }
    }
    
    console.log('=== API Analysis Failed ===')
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
