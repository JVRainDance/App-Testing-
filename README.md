# CRO-UX Analysis Tool

Advanced Conversion Rate Optimization (CRO) and User Experience (UX) analysis tool with PostHog integration.

## Features

- **Comprehensive Analysis**: Evaluate websites across 15 CRO and 18 UX criteria
- **AI-Powered Insights**: Uses OpenAI GPT-4 for intelligent analysis and recommendations
- **Professional Reports**: Generate detailed PDF reports with actionable insights
- **Real-time Tracking**: PostHog integration for usage analytics
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (for AI-powered analysis)
- PostHog account (optional, for analytics)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CRO-UX-Analysis.git
   cd CRO-UX-Analysis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   # OpenAI Configuration (Required for AI analysis)
   OPENAI_API_KEY=your-openai-api-key-here
   
   # PostHog Configuration (Optional)
   NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key-here
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Test your configuration**
   ```bash
   npm run test-config
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Setup

### Required Configuration

**OpenAI API Key** (Required for AI analysis):
- Sign up at [OpenAI](https://platform.openai.com/)
- Create an API key in your dashboard
- Add it to `.env.local` as `OPENAI_API_KEY=your-key-here`

### Optional Configuration

**PostHog Analytics** (Optional):
- Sign up at [PostHog](https://posthog.com/)
- Get your project API key
- Add it to `.env.local` as `NEXT_PUBLIC_POSTHOG_KEY=your-key-here`

## Troubleshooting

### Common Issues

**1. "Please Review Manually" for all items**
- **Cause**: Missing or invalid OpenAI API key
- **Solution**: 
  - Verify your OpenAI API key is correctly set in `.env.local`
  - Ensure you have sufficient OpenAI credits
  - Check that the API key has access to GPT-4

**2. PDF generation fails**
- **Cause**: jsPDF dependency issues
- **Solution**:
  - Run `npm install` to ensure all dependencies are installed
  - Clear browser cache and try again
  - Check browser console for specific error messages

**3. Website analysis fails**
- **Cause**: Website blocking requests or CORS issues
- **Solution**:
  - Try analyzing a different website
  - Check if the website is accessible
  - Some websites may block automated analysis

**4. Build errors**
- **Cause**: Missing dependencies or TypeScript errors
- **Solution**:
  ```bash
   npm install
   npm run build
   ```

### Fallback Analysis

When OpenAI API is not available, the tool provides basic heuristic analysis based on:
- Website content extraction
- Form and button detection
- Heading structure analysis
- Image accessibility checks
- Basic content evaluation

This ensures the tool remains functional even without AI capabilities.

## Usage

1. **Enter Website URL**: Input the website you want to analyze
2. **Run Analysis**: Click "Analyze" to start the comprehensive evaluation
3. **Review Results**: Examine CRO and UX scores, detailed breakdowns, and recommendations
4. **Download Report**: Generate a professional PDF report with all findings
5. **Track Progress**: Monitor your optimization efforts over time

## Analysis Categories

### CRO Analysis (15 criteria)
- **Offers & Messaging**: Value proposition, CTAs, social proof
- **Social Proof & Trust**: Testimonials, trust signals
- **Analytics & Tracking**: Conversion tracking, A/B testing
- **Lead Capture & Forms**: Form optimization, lead magnets
- **Urgency & Scarcity**: Time-sensitive offers
- **Pricing & Friction**: Pricing transparency, options
- **Speed & Experimentation**: Page speed, optimization efforts

### UX Analysis (18 criteria)
- **Performance & Stability**: Loading speed, error handling
- **Mobile-First Usability**: Responsive design, touch targets
- **Navigation & Information Architecture**: Clear navigation, content hierarchy
- **Accessibility**: WCAG 2.1 AA compliance
- **Content & Microcopy**: Clear, scannable content
- **Error States & Feedback**: Form validation, user feedback
- **Visual Design & Consistency**: Design consistency, alignment
- **Delight & Engagement**: Interactive elements, user experience

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the [GitHub Issues](https://github.com/yourusername/CRO-UX-Analysis/issues)
3. Create a new issue with detailed information about your problem

## Roadmap

- [ ] Multi-page website analysis
- [ ] Competitor analysis
- [ ] Historical tracking and trends
- [ ] Custom analysis templates
- [ ] Team collaboration features
- [ ] API endpoints for integration
