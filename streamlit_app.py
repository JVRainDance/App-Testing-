import os
import json
import time
from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import urlparse, urljoin
import requests
from bs4 import BeautifulSoup
import openai
from playwright.sync_api import sync_playwright
import logging
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CROAnalyzer:
    def __init__(self, api_key: str = None):
        """Initialize the CRO Analyzer with OpenAI API key."""
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass api_key parameter.")
        
        openai.api_key = self.api_key
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def get_cro_audit_questions(self) -> Dict[str, List[Dict]]:
        """Get the comprehensive CRO audit questions."""
        return {
            "offers_messaging": [
                {
                    "id": 1,
                    "question": "Does the above-the-fold headline clearly state what, for whom, and the benefit in 12 words or fewer?",
                    "category": "Offers & Messaging"
                },
                {
                    "id": 2,
                    "question": "Is the primary call-to-action (CTA) visible without scrolling on mobile and desktop?",
                    "category": "Offers & Messaging"
                },
                {
                    "id": 3,
                    "question": "Is that primary CTA visually dominant (unique colour, ≥ 44 px tall) with an action verb?",
                    "category": "Offers & Messaging"
                },
                {
                    "id": 4,
                    "question": "Are there zero competing CTAs or distracting links in the hero section?",
                    "category": "Offers & Messaging"
                }
            ],
            "social_proof_trust": [
                {
                    "id": 5,
                    "question": "Is at least one high-credibility testimonial, star rating, or client logo band visible in the first viewport?",
                    "category": "Social Proof & Trust"
                },
                {
                    "id": 6,
                    "question": "Are security badges, refund/guarantee copy, or trust seals placed next to forms or checkout areas?",
                    "category": "Social Proof & Trust"
                }
            ],
            "analytics_tracking": [
                {
                    "id": 7,
                    "question": "Are GA4 (or another analytics suite) and all key events—page view, 75% scroll, CTA click, form submit—firing correctly?",
                    "category": "Analytics & Tracking"
                },
                {
                    "id": 8,
                    "question": "Are critical funnel steps (Add to Cart, Begin Checkout, Add Payment Info, Purchase) tagged and reporting?",
                    "category": "Analytics & Tracking"
                }
            ],
            "lead_capture_forms": [
                {
                    "id": 9,
                    "question": "Does every lead-gen form require five or fewer mandatory fields?",
                    "category": "Lead Capture & Forms"
                },
                {
                    "id": 10,
                    "question": "Do fields validate inline and show friendly, specific error messages?",
                    "category": "Lead Capture & Forms"
                }
            ],
            "urgency_scarcity": [
                {
                    "id": 11,
                    "question": "Is there a legitimate urgency or scarcity cue (e.g., limited stock counter, countdown timer) that isn't fake or overbearing?",
                    "category": "Urgency & Scarcity"
                }
            ],
            "pricing_friction": [
                {
                    "id": 12,
                    "question": "Is the total cost—including shipping/taxes—displayed before the user reaches checkout step 2?",
                    "category": "Pricing & Friction"
                },
                {
                    "id": 13,
                    "question": "Can visitors check out as guests (no forced account creation)?",
                    "category": "Pricing & Friction"
                }
            ],
            "speed_experimentation": [
                {
                    "id": 14,
                    "question": "Is mobile Largest Contentful Paint ≤ 2.5 seconds?",
                    "category": "Speed & Experimentation"
                },
                {
                    "id": 15,
                    "question": "Is only one A/B test (or none) running on this page right now?",
                    "category": "Speed & Experimentation"
                }
            ]
        }

    def get_ux_audit_questions(self) -> Dict[str, List[Dict]]:
        """Get the comprehensive UX audit questions."""
        return {
            "performance_stability": [
                {
                    "id": 1,
                    "question": "Does the page meet Core Web Vitals: mobile LCP ≤ 2.5 s and CLS ≤ 0.1?",
                    "category": "Performance & Stability"
                },
                {
                    "id": 2,
                    "question": "Are there zero console errors, 404s, or mixed-content warnings in dev-tools?",
                    "category": "Performance & Stability"
                }
            ],
            "mobile_first_usability": [
                {
                    "id": 3,
                    "question": "Are all tap targets at least 48 × 48 px with 8 px spacing?",
                    "category": "Mobile-First Usability"
                },
                {
                    "id": 4,
                    "question": "Is body text legible on a 320 px-wide screen without pinch-zoom?",
                    "category": "Mobile-First Usability"
                },
                {
                    "id": 5,
                    "question": "Do sticky headers/CTAs avoid covering content while scrolling?",
                    "category": "Mobile-First Usability"
                }
            ],
            "navigation_architecture": [
                {
                    "id": 6,
                    "question": "Do menu labels match common user intent ('Pricing', 'Services', 'About') rather than jargon?",
                    "category": "Navigation & Information Architecture"
                },
                {
                    "id": 7,
                    "question": "Are breadcrumbs provided on pages more than two levels deep?",
                    "category": "Navigation & Information Architecture"
                }
            ],
            "accessibility": [
                {
                    "id": 8,
                    "question": "Does every foreground/background colour combo meet a 4.5 : 1 contrast ratio?",
                    "category": "Accessibility (WCAG 2.1 AA)"
                },
                {
                    "id": 9,
                    "question": "Do all functional or informative images have concise, descriptive alt text (not keyword stuffing)?",
                    "category": "Accessibility (WCAG 2.1 AA)"
                },
                {
                    "id": 10,
                    "question": "Can a keyboard-only user Tab to every interactive element and see a clear focus state?",
                    "category": "Accessibility (WCAG 2.1 AA)"
                }
            ],
            "content_microcopy": [
                {
                    "id": 11,
                    "question": "Can a new visitor grasp the page's purpose in five seconds or less?",
                    "category": "Content & Microcopy"
                },
                {
                    "id": 12,
                    "question": "Does the main copy score Grade 8 or easier on a readability test (Flesch ≥ 60)?",
                    "category": "Content & Microcopy"
                }
            ],
            "error_states_feedback": [
                {
                    "id": 13,
                    "question": "Do form errors explain what's wrong and how to fix it in plain language?",
                    "category": "Error States & Feedback"
                },
                {
                    "id": 14,
                    "question": "Do empty states (e.g., empty cart, no search results) offer helpful next steps?",
                    "category": "Error States & Feedback"
                }
            ],
            "visual_design_consistency": [
                {
                    "id": 15,
                    "question": "Are button styles, colours, and typography consistent across the site?",
                    "category": "Visual Design & Consistency"
                },
                {
                    "id": 16,
                    "question": "Is spacing based on a tidy rhythm (e.g., 8-pt grid) to aid scan-ability?",
                    "category": "Visual Design & Consistency"
                }
            ],
            "delight_engagement": [
                {
                    "id": 17,
                    "question": "Do hover/focus micro-interactions signal that elements are clickable without being distracting?",
                    "category": "Delight & Engagement"
                },
                {
                    "id": 18,
                    "question": "Is there any meaningful personalisation or localisation (geo-specific copy, remembered cart, etc.) where appropriate?",
                    "category": "Delight & Engagement"
                }
            ]
        }

    def create_structured_audit_prompt(self, analysis: Dict, url: str, audit_type: str = "both") -> str:
        """Create a structured audit prompt for CRO and/or UX analysis."""
        
        cro_questions = self.get_cro_audit_questions()
        ux_questions = self.get_ux_audit_questions()
        
        if audit_type == "cro":
            # CRO-only audit
            prompt = f"""
You are an expert CRO (Conversion Rate Optimization) analyst with 15+ years of experience conducting a comprehensive conversion rate audit that will be used by business owners and marketing teams to make immediate improvements.

URL: {url}

WEBPAGE ANALYSIS:
Title: {analysis['title']}
Meta Description: {analysis['meta_description']}
Key Headings: {', '.join(analysis['headings'][:5])}
Main Content (first 1000 chars): {analysis['text_content'][:1000]}
Forms Found: {len(analysis['forms'])} forms
Buttons/CTAs: {', '.join(analysis['buttons'][:5])}
Images: {len(analysis['images'])} images
Links: {len(analysis['links'])} links

CRITICAL INSTRUCTIONS:
You are analyzing a real website that needs actionable improvements. For each question:
1. Answer: Yes / No / Needs work (be honest and critical)
2. Evidence: Provide specific details about what you found or didn't find on the page
3. Quick-win suggestions: Give SPECIFIC, actionable steps that can be implemented immediately

IMPORTANT: Be specific and actionable. Instead of saying "improve the headline", say "Change the headline from 'Current Title' to 'New Specific Headline' to clearly communicate value and include a benefit."

Please structure your response exactly as follows:

## CRO AUDIT RESULTS

### Offers & Messaging
Q1. {cro_questions['offers_messaging'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q2. {cro_questions['offers_messaging'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q3. {cro_questions['offers_messaging'][2]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q4. {cro_questions['offers_messaging'][3]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Social Proof & Trust
Q5. {cro_questions['social_proof_trust'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q6. {cro_questions['social_proof_trust'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Analytics & Tracking
Q7. {cro_questions['analytics_tracking'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q8. {cro_questions['analytics_tracking'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Lead Capture & Forms
Q9. {cro_questions['lead_capture_forms'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q10. {cro_questions['lead_capture_forms'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Urgency & Scarcity
Q11. {cro_questions['urgency_scarcity'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Pricing & Friction
Q12. {cro_questions['pricing_friction'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q13. {cro_questions['pricing_friction'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Speed & Experimentation
Q14. {cro_questions['speed_experimentation'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q15. {cro_questions['speed_experimentation'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

## SUMMARY & PRIORITY RECOMMENDATIONS
- High Priority Fixes: [List 3-5 specific, critical issues with exact actions - e.g., "Change headline from X to Y", "Add CTA button with text Z"]
- Medium Priority: [List 3-5 important improvements with specific steps - e.g., "Add testimonial from John D. with photo", "Implement GA4 tracking for form submissions"]
- Quick Wins: [List 3-5 easy fixes that can be implemented in under 1 hour - e.g., "Change CTA color to #FF6B35", "Add SSL badge to footer"]

## OVERALL CRO SCORE
- CRO Score: [X/15] - [Percentage]
- Overall Grade: [A/B/C/D/F]

Remember: Be specific, actionable, and provide concrete steps that can be implemented immediately.
"""

        elif audit_type == "ux":
            # UX-only audit
            prompt = f"""
You are an expert UX (User Experience) analyst with 15+ years of experience conducting a comprehensive user experience audit that will be used by business owners and development teams to make immediate improvements.

URL: {url}

WEBPAGE ANALYSIS:
Title: {analysis['title']}
Meta Description: {analysis['meta_description']}
Key Headings: {', '.join(analysis['headings'][:5])}
Main Content (first 1000 chars): {analysis['text_content'][:1000]}
Forms Found: {len(analysis['forms'])} forms
Buttons/CTAs: {', '.join(analysis['buttons'][:5])}
Images: {len(analysis['images'])} images
Links: {len(analysis['links'])} links

CRITICAL INSTRUCTIONS:
You are analyzing a real website that needs actionable improvements. For each question:
1. Answer: Yes / No / Needs work (be honest and critical)
2. Evidence: Provide specific details about what you found or didn't find on the page
3. Quick-win suggestions: Give SPECIFIC, actionable steps that can be implemented immediately

IMPORTANT: Be specific and actionable. Instead of saying "improve performance", say "Optimize image sizes to reduce load time by 2 seconds" or "Fix the broken navigation link to '/contact'".

Please structure your response exactly as follows:

## UX AUDIT RESULTS

### Performance & Stability
Q1. {ux_questions['performance_stability'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q2. {ux_questions['performance_stability'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Mobile-First Usability
Q3. {ux_questions['mobile_first_usability'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q4. {ux_questions['mobile_first_usability'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q5. {ux_questions['mobile_first_usability'][2]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Navigation & Information Architecture
Q6. {ux_questions['navigation_architecture'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q7. {ux_questions['navigation_architecture'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Accessibility (WCAG 2.1 AA)
Q8. {ux_questions['accessibility'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q9. {ux_questions['accessibility'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q10. {ux_questions['accessibility'][2]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Content & Microcopy
Q11. {ux_questions['content_microcopy'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q12. {ux_questions['content_microcopy'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Error States & Feedback
Q13. {ux_questions['error_states_feedback'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q14. {ux_questions['error_states_feedback'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Visual Design & Consistency
Q15. {ux_questions['visual_design_consistency'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q16. {ux_questions['visual_design_consistency'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Delight & Engagement
Q17. {ux_questions['delight_engagement'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q18. {ux_questions['delight_engagement'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

## SUMMARY & PRIORITY RECOMMENDATIONS
- High Priority Fixes: [List 3-5 specific, critical issues with exact actions - e.g., "Fix broken navigation link to '/contact'", "Optimize images to reduce load time by 2 seconds"]
- Medium Priority: [List 3-5 important improvements with specific steps - e.g., "Add alt text to all images", "Increase button size to 48px minimum"]
- Quick Wins: [List 3-5 easy fixes that can be implemented in under 1 hour - e.g., "Fix typo in headline", "Add hover effects to buttons"]

## OVERALL UX SCORE
- UX Score: [X/18] - [Percentage]
- Overall Grade: [A/B/C/D/F]

Remember: Be specific, actionable, and provide concrete steps that can be implemented immediately.
"""

        else:
            # Both CRO and UX audit
            prompt = f"""
You are an expert CRO (Conversion Rate Optimization) and UX (User Experience) analyst with 15+ years of experience conducting a comprehensive website audit that will be used by business owners, marketing teams, and development teams to make immediate improvements.

URL: {url}

WEBPAGE ANALYSIS:
Title: {analysis['title']}
Meta Description: {analysis['meta_description']}
Key Headings: {', '.join(analysis['headings'][:5])}
Main Content (first 1000 chars): {analysis['text_content'][:1000]}
Forms Found: {len(analysis['forms'])} forms
Buttons/CTAs: {', '.join(analysis['buttons'][:5])}
Images: {len(analysis['images'])} images
Links: {len(analysis['links'])} links

CRITICAL INSTRUCTIONS:
You are analyzing a real website that needs actionable improvements. For each question:
1. Answer: Yes / No / Needs work (be honest and critical)
2. Evidence: Provide specific details about what you found or didn't find on the page
3. Quick-win suggestions: Give SPECIFIC, actionable steps that can be implemented immediately

IMPORTANT: Be specific and actionable. Instead of saying "improve the headline", say "Change the headline from 'Current Title' to 'New Specific Headline' to clearly communicate value and include a benefit." Instead of saying "improve performance", say "Optimize image sizes to reduce load time by 2 seconds."

Please structure your response exactly as follows:

## CRO AUDIT RESULTS

### Offers & Messaging
Q1. {cro_questions['offers_messaging'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q2. {cro_questions['offers_messaging'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q3. {cro_questions['offers_messaging'][2]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q4. {cro_questions['offers_messaging'][3]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Social Proof & Trust
Q5. {cro_questions['social_proof_trust'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q6. {cro_questions['social_proof_trust'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Analytics & Tracking
Q7. {cro_questions['analytics_tracking'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q8. {cro_questions['analytics_tracking'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Lead Capture & Forms
Q9. {cro_questions['lead_capture_forms'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q10. {cro_questions['lead_capture_forms'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Urgency & Scarcity
Q11. {cro_questions['urgency_scarcity'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Pricing & Friction
Q12. {cro_questions['pricing_friction'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q13. {cro_questions['pricing_friction'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Speed & Experimentation
Q14. {cro_questions['speed_experimentation'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q15. {cro_questions['speed_experimentation'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

## UX AUDIT RESULTS

### Performance & Stability
Q16. {ux_questions['performance_stability'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q17. {ux_questions['performance_stability'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Mobile-First Usability
Q18. {ux_questions['mobile_first_usability'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q19. {ux_questions['mobile_first_usability'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q20. {ux_questions['mobile_first_usability'][2]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Navigation & Information Architecture
Q21. {ux_questions['navigation_architecture'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q22. {ux_questions['navigation_architecture'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Accessibility (WCAG 2.1 AA)
Q23. {ux_questions['accessibility'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q24. {ux_questions['accessibility'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q25. {ux_questions['accessibility'][2]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Content & Microcopy
Q26. {ux_questions['content_microcopy'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q27. {ux_questions['content_microcopy'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Error States & Feedback
Q28. {ux_questions['error_states_feedback'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q29. {ux_questions['error_states_feedback'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Visual Design & Consistency
Q30. {ux_questions['visual_design_consistency'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q31. {ux_questions['visual_design_consistency'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

### Delight & Engagement
Q32. {ux_questions['delight_engagement'][0]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

Q33. {ux_questions['delight_engagement'][1]['question']}
- Answer: [Yes/No/Needs work]
- Evidence: [Brief explanation]
- Quick-win: [If No/Needs work, provide specific suggestion]

## SUMMARY & PRIORITY RECOMMENDATIONS
- High Priority Fixes: [List 3-5 specific, critical issues with exact actions - e.g., "Change headline from X to Y", "Fix broken navigation link to '/contact'"]
- Medium Priority: [List 3-5 important improvements with specific steps - e.g., "Add testimonial from John D. with photo", "Optimize images to reduce load time by 2 seconds"]
- Quick Wins: [List 3-5 easy fixes that can be implemented in under 1 hour - e.g., "Change CTA color to #FF6B35", "Add hover effects to buttons"]

## OVERALL SCORE
- CRO Score: [X/15] - [Percentage]
- UX Score: [X/18] - [Percentage]
- Overall Grade: [A/B/C/D/F]

Remember: Be specific, actionable, and provide concrete steps that can be implemented immediately.
"""
        
        return prompt

    def fetch_page(self, url: str) -> Optional[str]:
        """Fetch webpage content with error handling."""
        try:
            logger.info(f"Fetching page: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return response.text
        except requests.exceptions.ConnectTimeout:
            logger.error(f"Connection timeout for {url} - site may be down or blocking requests")
            return None
        except requests.exceptions.ReadTimeout:
            logger.error(f"Read timeout for {url} - site is responding slowly")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching {url}: {e}")
            return None

    def fetch_page_with_playwright(self, url: str) -> Optional[str]:
        """Fetch webpage content using Playwright for JavaScript-rendered content."""
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                # Set longer timeout and more flexible wait conditions
                page.goto(url, wait_until='domcontentloaded', timeout=60000)
                # Wait a bit more for dynamic content
                page.wait_for_timeout(3000)
                html = page.content()
                browser.close()
                return html
        except Exception as e:
            logger.error(f"Error fetching {url} with Playwright: {e}")
            return None

    def check_site_status(self, url: str) -> Dict:
        """Check if a site is reachable and provide status information."""
        try:
            logger.info(f"Checking site status: {url}")
            response = self.session.head(url, timeout=10, allow_redirects=True)
            return {
                'reachable': True,
                'status_code': response.status_code,
                'final_url': response.url,
                'server': response.headers.get('Server', 'Unknown'),
                'response_time': response.elapsed.total_seconds()
            }
        except requests.exceptions.ConnectTimeout:
            return {'reachable': False, 'error': 'Connection timeout - site may be down'}
        except requests.exceptions.ReadTimeout:
            return {'reachable': False, 'error': 'Read timeout - site is responding slowly'}
        except requests.exceptions.RequestException as e:
            return {'reachable': False, 'error': f'Request failed: {str(e)}'}

    def validate_api_key(self, api_key: str) -> bool:
        """Validate API key format."""
        if not api_key:
            return False
        if not api_key.startswith('sk-'):
            return False
        if len(api_key) < 20:  # Minimum reasonable length
            return False
        return True

    def analyze_html(self, html: str, url: str) -> Dict:
        """Analyze HTML content and extract key elements."""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Extract key elements
        analysis = {
            'title': soup.find('title').get_text().strip() if soup.find('title') else '',
            'meta_description': '',
            'headings': [],
            'links': [],
            'forms': [],
            'buttons': [],
            'images': [],
            'text_content': '',
            'structured_data': []
        }

        # Meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            analysis['meta_description'] = meta_desc.get('content', '')

        # Headings
        for i in range(1, 7):
            headings = soup.find_all(f'h{i}')
            analysis['headings'].extend([h.get_text().strip() for h in headings])

        # Links
        links = soup.find_all('a', href=True)
        analysis['links'] = [{'text': a.get_text().strip(), 'href': a['href']} for a in links[:20]]

        # Forms
        forms = soup.find_all('form')
        analysis['forms'] = [{'action': f.get('action', ''), 'method': f.get('method', 'GET')} for f in forms]

        # Buttons and CTAs
        buttons = soup.find_all(['button', 'input'], type=['submit', 'button'])
        analysis['buttons'] = [b.get_text().strip() or b.get('value', '') for b in buttons]

        # Images
        images = soup.find_all('img')
        analysis['images'] = [{'src': img.get('src', ''), 'alt': img.get('alt', '')} for img in images[:10]]

        # Main text content
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        analysis['text_content'] = text[:3000]  # Limit for token efficiency

        # Structured data
        structured_data = soup.find_all('script', type='application/ld+json')
        for script in structured_data:
            try:
                data = json.loads(script.string)
                analysis['structured_data'].append(data)
            except:
                continue

        return analysis

    def create_analysis_prompt(self, analysis: Dict, url: str) -> str:
        """Create a comprehensive analysis prompt."""
        prompt = f"""
You are an expert CRO (Conversion Rate Optimization) and UX (User Experience) analyst. 
Analyze the following webpage content and provide detailed recommendations for improving user experience and conversion rates.

URL: {url}

WEBPAGE ANALYSIS:
Title: {analysis['title']}
Meta Description: {analysis['meta_description']}

Key Headings: {', '.join(analysis['headings'][:5])}

Main Content (first 1000 chars): {analysis['text_content'][:1000]}

Forms Found: {len(analysis['forms'])} forms
Buttons/CTAs: {', '.join(analysis['buttons'][:5])}
Images: {len(analysis['images'])} images
Links: {len(analysis['links'])} links

Please provide a comprehensive analysis covering:

1. **Conversion Rate Optimization (CRO) Issues:**
   - Call-to-action effectiveness
   - Form optimization opportunities
   - Trust signals and credibility
   - Value proposition clarity

2. **User Experience (UX) Improvements:**
   - Navigation and information architecture
   - Content readability and structure
   - Mobile responsiveness indicators
   - Page load speed considerations

3. **Technical SEO & Performance:**
   - Meta descriptions and titles
   - Structured data implementation
   - Image optimization opportunities
   - Internal linking structure

4. **Specific Actionable Recommendations:**
   - Priority fixes (High/Medium/Low)
   - Quick wins vs. long-term improvements
   - A/B testing suggestions

5. **Competitive Advantages:**
   - Unique selling propositions
   - Market positioning opportunities

Please structure your response with clear sections and bullet points for easy implementation.
"""
        return prompt

    def ask_ai(self, prompt: str) -> str:
        """Send analysis request to OpenAI."""
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.api_key)
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=2000
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            return f"Error analyzing content: {str(e)}"

    def analyze_page(self, url: str, use_playwright: bool = False, audit_type: str = "both") -> Dict:
        """Analyze a single webpage with structured CRO/UX audit."""
        logger.info(f"Starting structured analysis of: {url}")
        
        # Fetch page content
        html = None
        if use_playwright:
            html = self.fetch_page_with_playwright(url)
            # If Playwright fails, try regular requests as fallback
            if not html:
                logger.info(f"Playwright failed for {url}, trying regular requests...")
                html = self.fetch_page(url)
        else:
            html = self.fetch_page(url)
        
        if not html:
            return {'url': url, 'error': 'Failed to fetch page content'}

        # Analyze HTML
        analysis = self.analyze_html(html, url)
        
        # Create structured audit prompt
        prompt = self.create_structured_audit_prompt(analysis, url, audit_type)
        
        # Get AI analysis
        ai_analysis = self.ask_ai(prompt)
        
        return {
            'url': url,
            'timestamp': datetime.now().isoformat(),
            'page_analysis': analysis,
            'structured_audit': ai_analysis,
            'audit_type': audit_type
        }

    def analyze_multiple_pages(self, urls: List[str], use_playwright: bool = False) -> List[Dict]:
        """Analyze multiple pages."""
        results = []
        for url in urls:
            try:
                result = self.analyze_page(url, use_playwright)
                results.append(result)
                time.sleep(1)  # Rate limiting
            except Exception as e:
                logger.error(f"Error analyzing {url}: {e}")
                results.append({'url': url, 'error': str(e)})
        return results

    def crawl_website(self, base_url: str, max_pages: int = 10, use_playwright: bool = False) -> List[str]:
        """Crawl a website and find all internal pages."""
        logger.info(f"Starting website crawl for: {base_url}")
        
        # Parse the base URL
        parsed_base = urlparse(base_url)
        base_domain = parsed_base.netloc
        base_scheme = parsed_base.scheme
        
        visited_urls = set()
        urls_to_visit = [base_url]
        found_urls = []
        
        while urls_to_visit and len(found_urls) < max_pages:
            current_url = urls_to_visit.pop(0)
            
            if current_url in visited_urls:
                continue
                
            visited_urls.add(current_url)
            logger.info(f"Crawling: {current_url}")
            
            try:
                # Fetch the page
                if use_playwright:
                    html = self.fetch_page_with_playwright(current_url)
                    if not html:
                        html = self.fetch_page(current_url)
                else:
                    html = self.fetch_page(current_url)
                
                if not html:
                    continue
                
                # Parse HTML and find links
                soup = BeautifulSoup(html, 'html.parser')
                links = soup.find_all('a', href=True)
                
                for link in links:
                    href = link['href']
                    
                    # Convert relative URLs to absolute
                    if href.startswith('/'):
                        full_url = f"{base_scheme}://{base_domain}{href}"
                    elif href.startswith('http'):
                        full_url = href
                    else:
                        continue
                    
                    # Check if it's the same domain
                    parsed_link = urlparse(full_url)
                    if parsed_link.netloc == base_domain:
                        # Clean the URL (remove fragments, query params if needed)
                        clean_url = f"{parsed_link.scheme}://{parsed_link.netloc}{parsed_link.path}"
                        
                        if clean_url not in visited_urls and clean_url not in urls_to_visit:
                            urls_to_visit.append(clean_url)
                            found_urls.append(clean_url)
                            logger.info(f"Found new page: {clean_url}")
                
                time.sleep(0.5)  # Be respectful to the server
                
            except Exception as e:
                logger.error(f"Error crawling {current_url}: {e}")
                continue
        
        logger.info(f"Crawl completed. Found {len(found_urls)} pages.")
        return found_urls[:max_pages]

    def analyze_entire_website(self, base_url: str, max_pages: int = 10, use_playwright: bool = False) -> Dict:
        """Analyze an entire website by crawling and analyzing all pages."""
        logger.info(f"Starting full website analysis for: {base_url}")
        
        # First, crawl the website to find all pages
        print(f"🔍 Crawling website to find pages...")
        all_urls = self.crawl_website(base_url, max_pages, use_playwright)
        
        if not all_urls:
            return {'error': 'No pages found to analyze'}
        
        print(f"📊 Found {len(all_urls)} pages to analyze")
        
        # Analyze each page
        results = []
        for i, url in enumerate(all_urls, 1):
            print(f"📄 Analyzing page {i}/{len(all_urls)}: {url}")
            try:
                result = self.analyze_page(url, use_playwright)
                results.append(result)
                time.sleep(1)  # Rate limiting
            except Exception as e:
                logger.error(f"Error analyzing {url}: {e}")
                results.append({'url': url, 'error': str(e)})
        
        # Create a comprehensive summary
        summary = {
            'base_url': base_url,
            'total_pages_found': len(all_urls),
            'pages_analyzed': len([r for r in results if 'error' not in r]),
            'pages_with_errors': len([r for r in results if 'error' in r]),
            'analysis_timestamp': datetime.now().isoformat(),
            'individual_results': results
        }
        
        return summary

    def save_results(self, results: Dict, filename: str = None) -> str:
        """Save analysis results to a JSON file."""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"cro_analysis_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Results saved to: {filename}")
        return filename

    def create_pdf_report(self, results: Dict, filename: str = None) -> str:
        """Create a professional PDF report for a single page."""
        # Create Reports folder if it doesn't exist
        reports_dir = "Reports"
        if not os.path.exists(reports_dir):
            os.makedirs(reports_dir)
        
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"cro_report_{timestamp}.pdf"
        
        filepath = os.path.join(reports_dir, filename)
        
        # Create the PDF document
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            spaceBefore=20,
            textColor=colors.darkblue
        )
        
        subheading_style = ParagraphStyle(
            'CustomSubheading',
            parent=styles['Heading3'],
            fontSize=14,
            spaceAfter=8,
            spaceBefore=15,
            textColor=colors.darkgreen
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            alignment=TA_JUSTIFY
        )
        
        # Title page
        story.append(Paragraph("CRO & UX Analysis Report", title_style))
        story.append(Spacer(1, 20))
        
        # Report metadata
        if 'url' in results:
            story.append(Paragraph(f"<b>Analyzed URL:</b> {results['url']}", normal_style))
        if 'timestamp' in results:
            report_date = datetime.fromisoformat(results['timestamp']).strftime("%B %d, %Y at %I:%M %p")
            story.append(Paragraph(f"<b>Report Generated:</b> {report_date}", normal_style))
        
        story.append(Spacer(1, 30))
        
        # Page analysis summary
        if 'page_analysis' in results:
            analysis = results['page_analysis']
            story.append(Paragraph("Page Analysis Summary", heading_style))
            
            summary_data = [
                ["Metric", "Value"],
                ["Page Title", analysis.get('title', 'N/A')[:50] + "..." if len(analysis.get('title', '')) > 50 else analysis.get('title', 'N/A')],
                ["Meta Description", analysis.get('meta_description', 'N/A')[:50] + "..." if len(analysis.get('meta_description', '')) > 50 else analysis.get('meta_description', 'N/A')],
                ["Headings Found", str(len(analysis.get('headings', [])))],
                ["Links Found", str(len(analysis.get('links', [])))],
                ["Forms Found", str(len(analysis.get('forms', [])))],
                ["Buttons/CTAs", str(len(analysis.get('buttons', [])))],
                ["Images Found", str(len(analysis.get('images', [])))]
            ]
            
            summary_table = Table(summary_data, colWidths=[2*inch, 4*inch])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            
            story.append(summary_table)
            story.append(Spacer(1, 20))
        
        # Structured Audit Results
        if 'structured_audit' in results:
            story.append(PageBreak())
            story.append(Paragraph("Structured CRO & UX Audit Results", heading_style))
            
            # Split audit results into sections
            audit_results = results['structured_audit']
            
            # Process the audit results text
            lines = audit_results.split('\n')
            current_section = ""
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Check if this is a main section header
                if line.startswith('## '):
                    current_section = line[3:]
                    story.append(Paragraph(f"<b>{current_section}</b>", heading_style))
                elif line.startswith('### '):
                    # Sub-section
                    story.append(Paragraph(f"<b>{line[4:]}</b>", subheading_style))
                elif line.startswith('Q') and line[1].isdigit():
                    # Question
                    story.append(Paragraph(f"<b>{line}</b>", normal_style))
                elif line.startswith('- Answer:') or line.startswith('- Evidence:') or line.startswith('- Quick-win:'):
                    # Answer details
                    story.append(Paragraph(line, normal_style))
                elif line.startswith('- High Priority Fixes:') or line.startswith('- Medium Priority:') or line.startswith('- Quick Wins:'):
                    # Priority recommendations
                    story.append(Paragraph(f"<b>{line}</b>", normal_style))
                elif line.startswith('- CRO Score:') or line.startswith('- UX Score:') or line.startswith('- Overall Grade:'):
                    # Scores
                    story.append(Paragraph(f"<b>{line}</b>", normal_style))
                elif line.startswith('- ') or line.startswith('• '):
                    # Bullet points
                    story.append(Paragraph(f"• {line[2:]}", normal_style))
                else:
                    # Regular paragraph
                    if line:
                        story.append(Paragraph(line, normal_style))
                        story.append(Spacer(1, 6))
        
        # Build the PDF
        doc.build(story)
        logger.info(f"PDF report saved to: {filepath}")
        return filepath

    def create_website_pdf_report(self, website_results: Dict, filename: str = None) -> str:
        """Create a comprehensive PDF report for an entire website analysis."""
        # Create Reports folder if it doesn't exist
        reports_dir = "Reports"
        if not os.path.exists(reports_dir):
            os.makedirs(reports_dir)
        
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"website_cro_report_{timestamp}.pdf"
        
        filepath = os.path.join(reports_dir, filename)
        
        # Create the PDF document
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            spaceBefore=20,
            textColor=colors.darkblue
        )
        
        subheading_style = ParagraphStyle(
            'CustomSubheading',
            parent=styles['Heading3'],
            fontSize=14,
            spaceAfter=8,
            spaceBefore=15,
            textColor=colors.darkgreen
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            alignment=TA_JUSTIFY
        )
        
        # Title page
        story.append(Paragraph("Website CRO & UX Analysis Report", title_style))
        story.append(Spacer(1, 20))
        
        # Report metadata
        if 'base_url' in website_results:
            story.append(Paragraph(f"<b>Website URL:</b> {website_results['base_url']}", normal_style))
        if 'analysis_timestamp' in website_results:
            report_date = datetime.fromisoformat(website_results['analysis_timestamp']).strftime("%B %d, %Y at %I:%M %p")
            story.append(Paragraph(f"<b>Report Generated:</b> {report_date}", normal_style))
        
        story.append(Spacer(1, 30))
        
        # Website summary
        story.append(Paragraph("Website Analysis Summary", heading_style))
        
        summary_data = [
            ["Metric", "Value"],
            ["Total Pages Found", str(website_results.get('total_pages_found', 0))],
            ["Pages Successfully Analyzed", str(website_results.get('pages_analyzed', 0))],
            ["Pages with Errors", str(website_results.get('pages_with_errors', 0))],
            ["Analysis Success Rate", f"{website_results.get('pages_analyzed', 0) / max(website_results.get('total_pages_found', 1), 1) * 100:.1f}%"]
        ]
        
        summary_table = Table(summary_data, colWidths=[2.5*inch, 3.5*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        story.append(summary_table)
        story.append(Spacer(1, 30))
        
        # Individual page analyses
        if 'individual_results' in website_results:
            story.append(PageBreak())
            story.append(Paragraph("Individual Page Analyses", heading_style))
            
            for i, page_result in enumerate(website_results['individual_results'], 1):
                if 'error' in page_result:
                    # Page with error
                    story.append(Paragraph(f"Page {i}: {page_result['url']}", subheading_style))
                    story.append(Paragraph(f"❌ Error: {page_result['error']}", normal_style))
                    story.append(Spacer(1, 15))
                else:
                    # Successful page analysis
                    story.append(Paragraph(f"Page {i}: {page_result['url']}", subheading_style))
                    
                    # Page summary table
                    if 'page_analysis' in page_result:
                        analysis = page_result['page_analysis']
                        page_summary_data = [
                            ["Metric", "Value"],
                            ["Page Title", analysis.get('title', 'N/A')[:40] + "..." if len(analysis.get('title', '')) > 40 else analysis.get('title', 'N/A')],
                            ["Headings", str(len(analysis.get('headings', [])))],
                            ["Links", str(len(analysis.get('links', [])))],
                            ["Forms", str(len(analysis.get('forms', [])))],
                            ["Buttons/CTAs", str(len(analysis.get('buttons', [])))]
                        ]
                        
                        page_table = Table(page_summary_data, colWidths=[1.5*inch, 4.5*inch])
                        page_table.setStyle(TableStyle([
                            ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
                            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                            ('FONTSIZE', (0, 0), (-1, 0), 10),
                            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
                            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                            ('FONTSIZE', (0, 1), (-1, -1), 9),
                            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ]))
                        
                        story.append(page_table)
                        story.append(Spacer(1, 10))
                    
                    # AI recommendations (truncated for space)
                    if 'ai_recommendations' in page_result:
                        recommendations = page_result['ai_recommendations']
                        # Take first 500 characters and add ellipsis
                        preview = recommendations[:500] + "..." if len(recommendations) > 500 else recommendations
                        story.append(Paragraph("<b>Key Recommendations:</b>", normal_style))
                        story.append(Paragraph(preview, normal_style))
                    
                    story.append(Spacer(1, 20))
                    
                    # Add page break every 3 pages to avoid overcrowding
                    if i % 3 == 0 and i < len(website_results['individual_results']):
                        story.append(PageBreak())
        
        # Build the PDF
        doc.build(story)
        logger.info(f"Website PDF report saved to: {filepath}")
        return filepath

def main():
    """Main function to run the CRO analyzer."""
    print("=== CRO UX Analysis Bot ===\n")
    
    # Use the provided API key
    api_key = "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"
    
    try:
        analyzer = CROAnalyzer(api_key)
        print("✅ CRO Analyzer initialized successfully!")
    except ValueError as e:
        print(f"Error: {e}")
        return

    while True:
        print("\nOptions:")
        print("1. Analyze single page (Structured CRO/UX Audit)")
        print("2. Analyze multiple pages")
        print("3. Crawl and analyze entire website")
        print("4. Check site status")
        print("5. Exit")
        
        choice = input("\nSelect option (1-5): ").strip()
        
        if choice == '1':
            url = input("Enter URL to analyze: ").strip()
            if url:
                print("\nAudit Type:")
                print("1. CRO Audit only (15 questions)")
                print("2. UX Audit only (18 questions)")
                print("3. Both CRO & UX Audit (33 questions)")
                
                audit_choice = input("\nSelect audit type (1-3): ").strip()
                audit_type = "both"
                if audit_choice == '1':
                    audit_type = "cro"
                elif audit_choice == '2':
                    audit_type = "ux"
                
                use_playwright = input("Use Playwright for JavaScript rendering? (y/n): ").lower().startswith('y')
                result = analyzer.analyze_page(url, use_playwright, audit_type)
                
                if 'error' not in result:
                    print("\n" + "="*50)
                    print("STRUCTURED AUDIT RESULTS")
                    print("="*50)
                    print(result['structured_audit'])
                    
                    print("\nSave options:")
                    print("1. Save as JSON file")
                    print("2. Create PDF report")
                    print("3. Both")
                    print("4. Don't save")
                    
                    save_choice = input("\nSelect option (1-4): ").strip()
                    
                    if save_choice == '1':
                        filename = analyzer.save_results(result)
                        print(f"Results saved to: {filename}")
                    elif save_choice == '2':
                        pdf_path = analyzer.create_pdf_report(result)
                        print(f"PDF report saved to: {pdf_path}")
                    elif save_choice == '3':
                        json_filename = analyzer.save_results(result)
                        pdf_path = analyzer.create_pdf_report(result)
                        print(f"JSON results saved to: {json_filename}")
                        print(f"PDF report saved to: {pdf_path}")
                else:
                    print(f"Error: {result['error']}")
        
        elif choice == '2':
            print("Enter URLs (one per line, press Enter twice when done):")
            urls = []
            while True:
                url = input().strip()
                if not url:
                    break
                urls.append(url)
            
            if urls:
                use_playwright = input("Use Playwright for JavaScript rendering? (y/n): ").lower().startswith('y')
                results = analyzer.analyze_multiple_pages(urls, use_playwright)
                
                for result in results:
                    print(f"\n{'='*30}")
                    print(f"URL: {result['url']}")
                    if 'error' in result:
                        print(f"Error: {result['error']}")
                    else:
                        print(result['ai_recommendations'][:500] + "...")
                
                print("\nSave options:")
                print("1. Save as JSON file")
                print("2. Create PDF reports (one per page)")
                print("3. Both")
                print("4. Don't save")
                
                save_choice = input("\nSelect option (1-4): ").strip()
                
                if save_choice == '1':
                    filename = analyzer.save_results(results)
                    print(f"Results saved to: {filename}")
                elif save_choice == '2':
                    for i, result in enumerate(results):
                        if 'error' not in result:
                            pdf_path = analyzer.create_pdf_report(result, f"cro_report_page_{i+1}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
                            print(f"PDF report for {result['url']} saved to: {pdf_path}")
                elif save_choice == '3':
                    filename = analyzer.save_results(results)
                    print(f"JSON results saved to: {filename}")
                    for i, result in enumerate(results):
                        if 'error' not in result:
                            pdf_path = analyzer.create_pdf_report(result, f"cro_report_page_{i+1}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
                            print(f"PDF report for {result['url']} saved to: {pdf_path}")
        
        elif choice == '3':
            url = input("Enter website URL to crawl and analyze: ").strip()
            if url:
                max_pages = input("Maximum number of pages to analyze (default 10): ").strip()
                max_pages = int(max_pages) if max_pages.isdigit() else 10
                
                use_playwright = input("Use Playwright for JavaScript rendering? (y/n): ").lower().startswith('y')
                
                print(f"\n🔍 Starting full website analysis...")
                print(f"📊 Will analyze up to {max_pages} pages")
                
                result = analyzer.analyze_entire_website(url, max_pages, use_playwright)
                
                if 'error' not in result:
                    print(f"\n✅ Website analysis completed!")
                    print(f"📄 Total pages found: {result['total_pages_found']}")
                    print(f"✅ Pages successfully analyzed: {result['pages_analyzed']}")
                    print(f"❌ Pages with errors: {result['pages_with_errors']}")
                    
                    print("\nSave options:")
                    print("1. Save as JSON file")
                    print("2. Create single comprehensive PDF report")
                    print("3. Both")
                    print("4. Don't save")
                    
                    save_choice = input("\nSelect option (1-4): ").strip()
                    
                    if save_choice == '1':
                        filename = analyzer.save_results(result)
                        print(f"Website analysis saved to: {filename}")
                    elif save_choice == '2':
                        pdf_path = analyzer.create_website_pdf_report(result)
                        print(f"Comprehensive PDF report saved to: {pdf_path}")
                    elif save_choice == '3':
                        filename = analyzer.save_results(result)
                        pdf_path = analyzer.create_website_pdf_report(result)
                        print(f"Website analysis saved to: {filename}")
                        print(f"Comprehensive PDF report saved to: {pdf_path}")
                else:
                    print(f"Error: {result['error']}")
        
        elif choice == '4':
            url = input("Enter URL to check status: ").strip()
            if url:
                status = analyzer.check_site_status(url)
                print(f"\n{'='*40}")
                print("SITE STATUS CHECK")
                print(f"{'='*40}")
                if status['reachable']:
                    print(f"✅ Site is reachable!")
                    print(f"Status Code: {status['status_code']}")
                    print(f"Final URL: {status['final_url']}")
                    print(f"Server: {status['server']}")
                    print(f"Response Time: {status['response_time']:.2f} seconds")
                else:
                    print(f"❌ Site is not reachable")
                    print(f"Error: {status['error']}")
                    print("\nPossible solutions:")
                    print("- Check if the URL is correct")
                    print("- Try again later (site might be temporarily down)")
                    print("- The site might be blocking automated requests")
                    print("- Check your internet connection")
        
        elif choice == '5':
            print("Goodbye!")
            break
        
        else:
            print("Invalid choice. Please select 1, 2, 3, 4, or 5.")

if __name__ == "__main__":
    main() 
