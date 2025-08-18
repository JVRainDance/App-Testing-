# CRO-UX Analysis Tool v2.0 🚀

A modern, advanced Conversion Rate Optimization (CRO) and User Experience (UX) analysis tool built with Next.js and powered by PostHog analytics.

## ✨ Features

- **Real-time Analytics**: PostHog integration for user behavior tracking
- **AI-Powered Analysis**: GPT-4 powered website analysis
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **Comprehensive Reports**: Detailed CRO and UX analysis with actionable recommendations
- **Vercel Deployment**: Ready for instant deployment
- **TypeScript**: Full type safety and better developer experience

## 🎯 Analysis Categories

### CRO Analysis (15 Questions)
1. **Offers & Messaging** (4 questions)
2. **Social Proof & Trust** (2 questions)
3. **Analytics & Tracking** (2 questions)
4. **Lead Capture & Forms** (2 questions)
5. **Urgency & Scarcity** (1 question)
6. **Pricing & Friction** (2 questions)
7. **Speed & Experimentation** (2 questions)

### UX Analysis (18 Questions)
1. **Performance & Stability** (2 questions)
2. **Mobile-First Usability** (3 questions)
3. **Navigation & Information Architecture** (2 questions)
4. **Accessibility (WCAG 2.1 AA)** (3 questions)
5. **Content & Microcopy** (2 questions)
6. **Error States & Feedback** (2 questions)
7. **Visual Design & Consistency** (2 questions)
8. **Delight & Engagement** (2 questions)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key
- PostHog account (free tier available)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd cro-ux-analysis-tool
npm install
```

### 2. Environment Setup
Copy the example environment file and configure your keys:
```bash
cp env.example .env.local
```

Edit `.env.local` with your API keys:
```env
# PostHog Configuration
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🚀 Deploy to Vercel

### Option 1: Deploy with Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: Deploy via GitHub
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Vercel
Add these in your Vercel project settings:
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `OPENAI_API_KEY`

## 📊 PostHog Integration

This tool integrates with PostHog to provide:
- **User Behavior Tracking**: Track how users interact with the analysis tool
- **Conversion Analytics**: Monitor analysis completion rates
- **Performance Insights**: Track analysis performance and errors
- **A/B Testing**: Test different analysis approaches

### PostHog Events Tracked
- `analysis_started`: When a user starts an analysis
- `analysis_completed`: When analysis finishes successfully
- `analysis_error`: When analysis encounters errors
- `page_view`: Standard page view tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Analytics**: PostHog
- **AI**: OpenAI GPT-4
- **Deployment**: Vercel
- **Web Scraping**: Cheerio, Axios

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── analyze/           # Analysis page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── providers/         # Context providers
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── types/                # TypeScript types
```

## 🔧 Configuration

### Customizing Analysis Questions
Edit the questions in `src/app/api/analyze/route.ts`:
- `CRO_QUESTIONS`: CRO analysis questions
- `UX_QUESTIONS`: UX analysis questions

### Styling
The app uses Tailwind CSS with a custom design system. Modify `tailwind.config.js` for theme changes.

### Analytics
PostHog tracking can be customized in:
- `src/components/providers/posthog-provider.tsx`
- `src/app/api/analyze/route.ts`

## 📈 Usage

1. **Enter URL**: Input any website URL
2. **Run Analysis**: Click "Analyze" to start
3. **View Results**: Get comprehensive CRO/UX analysis
4. **Download Report**: Export results as PDF
5. **Track Progress**: Monitor improvements over time

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Create an issue on GitHub
- **Documentation**: Check the code comments and this README
- **PostHog**: Visit [posthog.com](https://posthog.com) for analytics help

## 🔮 Roadmap

- [ ] User authentication and dashboard
- [ ] Historical analysis tracking
- [ ] Competitor analysis
- [ ] Automated monitoring
- [ ] Team collaboration features
- [ ] Advanced PostHog integrations
- [ ] Mobile app

---

**Built with ❤️ for better websites**
