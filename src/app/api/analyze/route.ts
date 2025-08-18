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
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
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
  } catch (error) {
    console.error('Error fetching website:', error)
    throw new Error('Failed to fetch website content')
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
Images with Alt Text: ${content.images.filter(img => img).length}/${content.images.length}

Please analyze each question and provide:
1. Answer: "yes", "no", or "needs_work"
2. Evidence: Brief explanation based on the content
3. Recommendation: Specific actionable advice
4. Priority: "high", "medium", or "low"

Questions to analyze:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

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
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('Invalid AI response format')
    }
  } catch (error) {
    console.error('AI analysis error:', error)
    // Return fallback analysis
    return {
      questions: questions.map(q => ({
        question: q,
        answer: 'needs_work',
        evidence: 'Unable to analyze due to technical issues',
        recommendation: 'Please review manually',
        priority: 'medium'
      }))
    }
  }
}

function calculateScore(questions: any[]) {
  const scores = questions.map(q => {
    switch (q.answer) {
      case 'yes': return 1
      case 'needs_work': return 0.5
      case 'no': return 0
      default: return 0
    }
  })
  return scores.reduce((sum, score) => sum + score, 0)
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
  const recommendations = []
  
  // High priority recommendations
  const highPriority = [...croAnalysis, ...uxAnalysis]
    .flatMap(cat => cat.questions)
    .filter(q => q.priority === 'high' && q.answer !== 'yes')
    .slice(0, 5)
  
  highPriority.forEach(q => {
    recommendations.push({
      title: `Fix: ${q.question}`,
      description: q.recommendation,
      priority: 'high' as const,
      impact: 'High',
      effort: 'Medium',
      category: croAnalysis.some(cat => cat.questions.includes(q)) ? 'cro' as const : 'ux' as const
    })
  })
  
  // Medium priority recommendations
  const mediumPriority = [...croAnalysis, ...uxAnalysis]
    .flatMap(cat => cat.questions)
    .filter(q => q.priority === 'medium' && q.answer !== 'yes')
    .slice(0, 3)
  
  mediumPriority.forEach(q => {
    recommendations.push({
      title: `Improve: ${q.question}`,
      description: q.recommendation,
      priority: 'medium' as const,
      impact: 'Medium',
      effort: 'Low',
      category: croAnalysis.some(cat => cat.questions.includes(q)) ? 'cro' as const : 'ux' as const
    })
  })
  
  return recommendations
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
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
      } catch (error) {
        console.error('PostHog tracking error:', error)
      }
    }

    // Fetch website content
    const content = await fetchWebsiteContent(url)
    
    // Analyze CRO
    const croResults = []
    for (const category of CRO_QUESTIONS) {
      const analysis = await analyzeWithAI(content, category.questions, category.category)
      croResults.push({
        category: category.category,
        questions: analysis.questions,
        score: Math.round((calculateScore(analysis.questions) / category.questions.length) * 100)
      })
    }
    
    // Analyze UX
    const uxResults = []
    for (const category of UX_QUESTIONS) {
      const analysis = await analyzeWithAI(content, category.questions, category.category)
      uxResults.push({
        category: category.category,
        questions: analysis.questions,
        score: Math.round((calculateScore(analysis.questions) / category.questions.length) * 100)
      })
    }
    
    // Calculate scores
    const croScore = Math.round(calculateScore(croResults.flatMap(cat => cat.questions)))
    const uxScore = Math.round(calculateScore(uxResults.flatMap(cat => cat.questions)))
    const overallGrade = calculateOverallGrade(croScore, uxScore)
    
    // Generate recommendations
    const recommendations = generateRecommendations(croResults, uxResults)
    
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
      } catch (error) {
        console.error('PostHog tracking error:', error)
      }
    }

    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Analysis error:', error)
    
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
      } catch (posthogError) {
        console.error('PostHog error tracking failed:', posthogError)
      }
    }
    
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
