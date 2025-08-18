# Deployment Guide - CRO-UX Analysis Tool v2.0

This guide will help you deploy your CRO-UX Analysis Tool to Vercel with PostHog integration.

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy with Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**
   ```bash
   cd cro-ux-analysis-tool
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `cro-ux-analysis-tool` (or your preferred name)
   - Directory: `./` (current directory)
   - Override settings: `N`

5. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_POSTHOG_KEY
   vercel env add NEXT_PUBLIC_POSTHOG_HOST
   vercel env add OPENAI_API_KEY
   ```

### Option 2: Deploy via GitHub

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Environment Variables**
   In the Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add the following variables:
     - `NEXT_PUBLIC_POSTHOG_KEY`: Your PostHog API key
     - `NEXT_PUBLIC_POSTHOG_HOST`: `https://us.i.posthog.com`
     - `OPENAI_API_KEY`: Your OpenAI API key

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

## 🔧 Environment Variables Setup

### Required Variables

Create a `.env.local` file in your project root:

```env
# PostHog Configuration
NEXT_PUBLIC_POSTHOG_KEY=phc_XhPqbGDv2AvcD9i57LqHBoFcl9jcOJV1zMdWd5YMIkv
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
```

### Getting Your API Keys

#### PostHog API Key
1. Go to [posthog.com](https://posthog.com)
2. Sign up for a free account
3. Create a new project
4. Go to Project Settings → API Keys
5. Copy your API key

#### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in to your account
3. Go to API Keys
4. Create a new API key
5. Copy the key (keep it secure!)

## 🌐 Domain Configuration

### Custom Domain (Optional)
1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Wait for DNS propagation (up to 24 hours)

### Subdomain (Optional)
You can also use a Vercel subdomain:
- Your app will be available at: `your-project.vercel.app`
- You can customize this in Project Settings → Domains

## 📊 PostHog Setup

### 1. Create PostHog Project
1. Go to [posthog.com](https://posthog.com)
2. Create a new project
3. Note your API key and host URL

### 2. Configure Tracking
The app automatically tracks:
- Page views
- Analysis starts
- Analysis completions
- Errors

### 3. View Analytics
1. Go to your PostHog dashboard
2. Check Events for tracking data
3. Create funnels to track conversion rates
4. Set up session recordings

## 🔍 Testing Your Deployment

### 1. Test the Homepage
- Visit your deployed URL
- Verify the homepage loads correctly
- Check that PostHog tracking is working

### 2. Test Analysis
- Enter a test URL (e.g., `https://example.com`)
- Run an analysis
- Verify results are displayed correctly

### 3. Check API Endpoints
- Test the `/api/analyze` endpoint
- Verify error handling works

## 🛠️ Troubleshooting

### Common Issues

#### Build Errors
```bash
# Check build logs
vercel logs

# Rebuild locally
npm run build
```

#### Environment Variables Not Working
```bash
# Check environment variables
vercel env ls

# Redeploy with new env vars
vercel --prod
```

#### PostHog Not Tracking
1. Check browser console for errors
2. Verify API key is correct
3. Check PostHog dashboard for events

#### OpenAI API Errors
1. Verify API key is valid
2. Check OpenAI account has credits
3. Verify API key has GPT-4 access

### Performance Optimization

#### Vercel Function Limits
- Function timeout: 60 seconds (configured in `vercel.json`)
- Memory: 1024MB
- Payload size: 4.5MB

#### Optimization Tips
1. **Caching**: Implement Redis caching for repeated analyses
2. **CDN**: Vercel automatically provides CDN
3. **Image Optimization**: Use Next.js Image component
4. **Bundle Size**: Monitor with `npm run build`

## 🔒 Security Considerations

### API Key Security
- Never commit API keys to Git
- Use environment variables
- Rotate keys regularly
- Monitor usage

### Rate Limiting
- Implement rate limiting for API endpoints
- Monitor for abuse
- Set up alerts for unusual activity

### CORS Configuration
- Configure CORS in `next.config.js`
- Restrict to trusted domains
- Monitor for unauthorized requests

## 📈 Monitoring & Analytics

### Vercel Analytics
- Function execution times
- Error rates
- Performance metrics

### PostHog Analytics
- User behavior
- Conversion funnels
- Session recordings
- A/B testing

### Custom Monitoring
- Set up alerts for errors
- Monitor API usage
- Track performance metrics

## 🔄 Continuous Deployment

### GitHub Integration
1. Connect your GitHub repository to Vercel
2. Enable automatic deployments
3. Set up branch protection rules

### Environment Management
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Promote preview to production
vercel --prod
```

## 📱 Mobile Optimization

The app is already mobile-responsive, but verify:
1. Test on various screen sizes
2. Check touch targets
3. Verify navigation works on mobile
4. Test analysis flow on mobile devices

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] PostHog tracking working
- [ ] OpenAI API key valid
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Error monitoring set up
- [ ] Performance optimized
- [ ] Mobile responsive
- [ ] Analytics tracking
- [ ] Backup strategy in place

## 🆘 Support

### Vercel Support
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### PostHog Support
- [PostHog Documentation](https://posthog.com/docs)
- [PostHog Community](https://posthog.com/slack)

### General Support
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the main README.md

---

**Happy Deploying! 🚀**
