# Deployment Guide

This guide will help you deploy the CRO-UX Analysis Tool to production.

## Prerequisites

- Node.js 18+ installed
- Git repository set up
- OpenAI API account and key
- PostHog account (optional)

## Environment Variables

### Required Variables

**OPENAI_API_KEY** (Required for AI analysis)
- Sign up at [OpenAI Platform](https://platform.openai.com/)
- Create an API key in your dashboard
- Ensure you have sufficient credits for GPT-4 usage

### Optional Variables

**NEXT_PUBLIC_POSTHOG_KEY** (Optional for analytics)
- Sign up at [PostHog](https://posthog.com/)
- Get your project API key from the project settings

**NEXT_PUBLIC_POSTHOG_HOST** (Optional)
- Default: `https://us.i.posthog.com`
- Change if using a different PostHog instance

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides the easiest deployment experience for Next.js applications.

#### Step 1: Prepare Your Repository
```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your repository
5. Configure environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NEXT_PUBLIC_POSTHOG_KEY`: Your PostHog key (optional)
   - `NEXT_PUBLIC_POSTHOG_HOST`: PostHog host (optional)
6. Click "Deploy"

#### Step 3: Verify Deployment
- Check that the build completes successfully
- Test the analysis functionality
- Verify PDF generation works

### 2. Netlify

#### Step 1: Build Configuration
Create a `netlify.toml` file in your project root:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Step 2: Deploy
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables in the Netlify dashboard
6. Deploy

### 3. Railway

#### Step 1: Prepare for Railway
Create a `railway.json` file:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

#### Step 2: Deploy
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables
4. Deploy

### 4. Docker Deployment

#### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Step 2: Build and Run
```bash
docker build -t cro-ux-analysis .
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your-key \
  -e NEXT_PUBLIC_POSTHOG_KEY=your-key \
  cro-ux-analysis
```

## Environment Variable Setup

### Local Development
Create a `.env.local` file:
```env
# Required for AI analysis
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional for analytics
NEXT_PUBLIC_POSTHOG_KEY=phc-your-posthog-key-here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Production Deployment
Add these variables in your deployment platform's dashboard:

**Vercel:**
- Go to Project Settings → Environment Variables
- Add each variable with the appropriate scope (Production, Preview, Development)

**Netlify:**
- Go to Site Settings → Environment Variables
- Add each variable

**Railway:**
- Go to your project → Variables
- Add each variable

## Troubleshooting Deployment

### Common Issues

**1. Build Failures**
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint

# Ensure all dependencies are installed
npm install
```

**2. Environment Variables Not Working**
- Verify variable names are correct (case-sensitive)
- Check that variables are set for the correct environment
- Restart the deployment after adding variables

**3. OpenAI API Errors**
- Verify your API key is valid
- Check your OpenAI account has sufficient credits
- Ensure the key has access to GPT-4

**4. PDF Generation Issues**
- Verify jsPDF is properly installed
- Check browser console for errors
- Test in different browsers

### Performance Optimization

**1. Enable Caching**
Add to your `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig
```

**2. Optimize Images**
- Use Next.js Image component
- Compress images before upload
- Consider using a CDN

**3. Monitor Performance**
- Use PostHog analytics to track performance
- Monitor API response times
- Set up error tracking

## Security Considerations

### API Key Security
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Monitor API usage for unusual activity

### CORS Configuration
The application handles CORS automatically, but you may need to configure it for your domain:
```javascript
// In next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
      },
    ]
  },
}
```

## Monitoring and Maintenance

### Health Checks
Set up health check endpoints:
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
}
```

### Error Tracking
- Use PostHog for error tracking
- Set up alerts for critical errors
- Monitor API rate limits

### Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Test updates in staging environment

## Support

If you encounter deployment issues:
1. Check the troubleshooting section above
2. Review the deployment platform's documentation
3. Check the application logs
4. Create an issue on GitHub with detailed information

## Cost Considerations

### OpenAI API Costs
- GPT-4 is more expensive than GPT-3.5
- Monitor usage to avoid unexpected charges
- Consider implementing rate limiting
- Set up billing alerts

### Hosting Costs
- Vercel: Free tier available, paid plans start at $20/month
- Netlify: Free tier available, paid plans start at $19/month
- Railway: Pay-as-you-go pricing
- Docker: Depends on your hosting provider

## Best Practices

1. **Environment Separation**: Use different API keys for development and production
2. **Monitoring**: Set up comprehensive monitoring and alerting
3. **Backup**: Regularly backup your configuration and data
4. **Testing**: Test deployments in staging environment first
5. **Documentation**: Keep deployment documentation updated
6. **Security**: Regularly review and update security measures
