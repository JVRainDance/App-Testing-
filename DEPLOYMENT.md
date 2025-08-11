# 🚀 Deployment Guide for Streamlit Cloud

This guide will help you deploy the CRO UX Analysis Bot to Streamlit Cloud.

## 📋 Prerequisites

1. **GitHub Account**: You need a GitHub account to host your code
2. **Streamlit Account**: Sign up at [share.streamlit.io](https://share.streamlit.io)
3. **OpenAI API Key**: Get one from [OpenAI Platform](https://platform.openai.com/api-keys)

## 🔧 Step-by-Step Deployment

### 1. Prepare Your GitHub Repository

1. **Create a new repository** on GitHub
2. **Upload all files** from the `For Github` folder to your repository
3. **Ensure your repository structure** looks like this:
   ```
   your-repo/
   ├── streamlit_app.py          # Main Streamlit app
   ├── cro_bot.py               # Core bot functionality
   ├── requirements.txt         # Python dependencies
   ├── .streamlit/
   │   └── config.toml         # Streamlit configuration
   ├── README.md               # Project documentation
   ├── LICENSE                 # MIT License
   ├── .gitignore             # Git ignore rules
   └── setup.py               # Package setup
   ```

### 2. Deploy to Streamlit Cloud

1. **Go to [share.streamlit.io](https://share.streamlit.io)**
2. **Sign in** with your GitHub account
3. **Click "New app"**
4. **Fill in the deployment form**:
   - **Repository**: `yourusername/your-repo-name`
   - **Branch**: `main` (or `master` if that's your default branch)
   - **Main file path**: `streamlit_app.py`
   - **App URL**: Leave empty (will be auto-generated)
5. **Click "Deploy"**

### 3. Configure Environment Variables

After deployment, you need to set up your OpenAI API key:

1. **Go to your app's settings** in Streamlit Cloud
2. **Navigate to "Secrets"**
3. **Add your OpenAI API key**:
   ```toml
   OPENAI_API_KEY = "your-actual-api-key-here"
   ```

### 4. Test Your Deployment

1. **Visit your deployed app** (URL will be shown after deployment)
2. **Enter your OpenAI API key** in the sidebar
3. **Test with a sample URL** like `https://example.com`
4. **Verify the analysis works** and PDF download functions

## 🔍 Troubleshooting

### Common Issues

#### 1. "Repository not found" Error
- **Solution**: Make sure your repository is public or you've given Streamlit access to private repos
- **Check**: Repository name is correct and exists

#### 2. "Branch does not exist" Error
- **Solution**: Check your default branch name (usually `main` or `master`)
- **Fix**: Update the branch name in the deployment form

#### 3. "File does not exist" Error
- **Solution**: Ensure `streamlit_app.py` is in the root of your repository
- **Check**: File path is exactly `streamlit_app.py` (not in a subfolder)

#### 4. Import Errors
- **Solution**: Make sure all dependencies are in `requirements.txt`
- **Check**: All required files (`cro_bot.py`) are in the repository

#### 5. API Key Issues
- **Solution**: Set the `OPENAI_API_KEY` in Streamlit secrets
- **Check**: API key is valid and has sufficient credits

### Performance Optimization

1. **Enable caching** for better performance
2. **Use appropriate timeouts** for API calls
3. **Monitor resource usage** in Streamlit Cloud dashboard

## 🔒 Security Considerations

1. **Never commit API keys** to your repository
2. **Use Streamlit secrets** for sensitive data
3. **Keep dependencies updated** for security patches
4. **Monitor API usage** to avoid unexpected costs

## 📊 Monitoring

1. **Check app logs** in Streamlit Cloud dashboard
2. **Monitor API usage** in OpenAI dashboard
3. **Track user interactions** and errors
4. **Set up alerts** for critical issues

## 🔄 Updates and Maintenance

1. **Push changes** to your GitHub repository
2. **Streamlit will auto-deploy** new versions
3. **Test thoroughly** before pushing to main branch
4. **Keep dependencies updated** regularly

## 📞 Support

If you encounter issues:

1. **Check Streamlit documentation**: [docs.streamlit.io](https://docs.streamlit.io)
2. **Review GitHub issues** for similar problems
3. **Contact Streamlit support** for deployment issues
4. **Check OpenAI API status** for service issues

## 🎉 Success!

Once deployed, your CRO UX Analysis Bot will be available at:
`https://your-app-name-yourusername.streamlit.app`

Share this URL with your team and start analyzing websites! 🚀
