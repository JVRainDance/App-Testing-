# Debug Guide - CRO-UX Analysis Tool

This guide will help you identify and fix issues with the CRO-UX Analysis Tool using the built-in debugging features.

## 🐛 Debug Mode

### Enabling Debug Mode

1. **Open the Analysis Page**: Navigate to `/analyze` in your application
2. **Click "Show Debug"**: Look for the debug button in the header (eye icon)
3. **Debug Panel Appears**: A new orange panel will appear at the top of the page

### Debug Panel Features

The debug panel has 4 tabs:

#### 1. Debug Logs
- **Real-time logs**: Shows what's happening during analysis
- **Timestamps**: Each log entry has a timestamp
- **Clear logs**: Button to reset the log history

#### 2. API Response
- **Raw API data**: Shows the complete response from the analysis API
- **JSON formatted**: Easy to read and understand
- **Response structure**: See exactly what data is being returned

#### 3. Errors
- **Error details**: Shows any API errors that occur
- **Error messages**: Complete error information
- **Stack traces**: When available

#### 4. API Test
- **Test endpoints**: Verify API connectivity
- **Environment check**: See if environment variables are loaded
- **Connection test**: Ensure the API is responding

## 🔍 How to Debug Issues

### Step 1: Test API Connectivity

1. **Enable debug mode**
2. **Go to "API Test" tab**
3. **Click "Test GET /api/test"**
4. **Check the response**:
   - Status should be 200
   - Should see environment variable status
   - No network errors

### Step 2: Check Environment Variables

In the API test response, look for:
```json
{
  "environment": {
    "hasOpenAIKey": true/false,
    "hasPostHogKey": true/false,
    "hasPostHogHost": true/false
  }
}
```

**If `hasOpenAIKey` is false:**
- Your OpenAI API key is not configured
- Add `OPENAI_API_KEY=your-key-here` to `.env.local`
- The tool will use fallback analysis instead

### Step 3: Run a Test Analysis

1. **Enter a test URL** (e.g., `https://example.com`)
2. **Click "Analyze"**
3. **Watch the debug logs** in real-time
4. **Check for errors** in the Errors tab

### Step 4: Analyze the Results

#### If Analysis Fails:
- **Check the Errors tab** for specific error messages
- **Look at the Debug Logs** to see where it failed
- **Check the API Response** tab for partial responses

#### If Analysis Works but Shows "Please Review Manually":
- **Check if OpenAI API key is configured**
- **Look at the API Response** to see what analysis was performed
- **Check the Debug Logs** for fallback analysis messages

## 🚨 Common Issues and Solutions

### Issue 1: "Please Review Manually" for All Items

**Symptoms:**
- Every analysis item shows "Please review manually"
- No specific analysis results

**Debug Steps:**
1. Check API test response for `hasOpenAIKey: false`
2. Verify `.env.local` file exists and has `OPENAI_API_KEY`
3. Check debug logs for "OpenAI API key not configured" messages

**Solution:**
```bash
# Create .env.local file
cp env.example .env.local

# Edit .env.local and add your OpenAI API key
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Issue 2: API Endpoint Not Responding

**Symptoms:**
- Analysis fails immediately
- Network errors in browser console

**Debug Steps:**
1. Test GET `/api/test` endpoint
2. Check if server is running (`npm run dev`)
3. Look for CORS errors in browser console

**Solution:**
```bash
# Restart the development server
npm run dev

# Check if port 3000 is available
# Try a different port if needed
```

### Issue 3: Website Analysis Fails

**Symptoms:**
- Analysis starts but fails during website crawling
- Specific error messages about website access

**Debug Steps:**
1. Check the Debug Logs for website fetching errors
2. Try a different website URL
3. Check if the website is accessible

**Solution:**
- Try analyzing a different website
- Some websites block automated requests
- Use a public website for testing

### Issue 4: PDF Generation Fails

**Symptoms:**
- Analysis completes but PDF download fails
- Browser console shows PDF-related errors

**Debug Steps:**
1. Check if jsPDF is properly installed
2. Look for browser compatibility issues
3. Check the Debug Logs for PDF generation errors

**Solution:**
```bash
# Reinstall dependencies
npm install

# Clear browser cache
# Try a different browser
```

## 📊 Understanding Debug Output

### Debug Logs Format
```
12:34:56: Starting analysis for: https://example.com
12:34:57: Progress: 10% - Initializing analysis...
12:34:58: Making API request to /api/analyze
12:34:59: API Response Status: 200
12:35:00: Successfully parsed API response
12:35:01: Analysis completed. CRO Score: 8, UX Score: 12
```

### API Response Structure
```json
{
  "url": "https://example.com",
  "croScore": 8,
  "uxScore": 12,
  "overallGrade": "C",
  "croAnalysis": [...],
  "uxAnalysis": [...],
  "recommendations": [...],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Error Response Format
```json
{
  "error": "Specific error message",
  "details": "Additional error information"
}
```

## 🛠️ Advanced Debugging

### Server-Side Logs

Check your terminal/console where you ran `npm run dev` for server-side logs:

```
=== API Analysis Started ===
Received URL: https://example.com
URL validation passed
Checking OpenAI API key...
Warning: OpenAI API key is not configured, will use fallback analysis
Starting website content fetch...
Website content fetched successfully
Content summary: { title: "Example", description: "...", headingsCount: 5, forms: 1, buttons: 3, imagesCount: 2 }
Starting CRO analysis...
Analyzing CRO category: Offers & Messaging
CRO category Offers & Messaging analysis completed: { questionsCount: 4, answers: ["yes", "no", "needs_work", "yes"] }
Completed CRO category: Offers & Messaging
...
=== API Analysis Completed Successfully ===
```

### Browser Console

Open browser developer tools (F12) and check:
- **Console tab**: For JavaScript errors
- **Network tab**: For API request/response details
- **Application tab**: For environment variables (if accessible)

## 🎯 Quick Debug Checklist

- [ ] Debug mode is enabled
- [ ] API test endpoints respond (200 status)
- [ ] Environment variables are loaded correctly
- [ ] OpenAI API key is configured (if using AI analysis)
- [ ] No CORS or network errors
- [ ] Website URL is accessible
- [ ] Analysis completes without errors
- [ ] Results are displayed correctly
- [ ] PDF generation works (if needed)

## 📞 Getting Help

If you're still having issues after using the debug features:

1. **Collect debug information**:
   - Screenshot of debug logs
   - API test response
   - Any error messages

2. **Check the troubleshooting section** in README.md

3. **Create a GitHub issue** with:
   - Debug logs
   - Error messages
   - Steps to reproduce
   - Environment information

## 🔧 Debug Mode Tips

- **Keep debug mode enabled** during development
- **Clear logs** between tests for cleaner output
- **Test with simple URLs** first (e.g., `https://example.com`)
- **Check both client and server logs**
- **Use the API test** to verify basic connectivity
- **Monitor the Network tab** in browser dev tools

---

**Happy Debugging! 🐛✨**
