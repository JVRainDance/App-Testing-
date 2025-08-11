# 🚨 Streamlit Deployment Fix

## The Problem
You're getting these errors:
- `Failed to parse: App/requirements.txt`
- `ERROR: Invalid requirement: 'App/requirements.txt'`

## The Solution

### 1. Fix Your GitHub Repository Structure

**❌ WRONG Structure (what you have now):**
```
your-repo/
└── CRO-UX Analysis App/
    ├── streamlit_app.py
    ├── cro_bot.py
    ├── requirements.txt
    └── ...
```

**✅ CORRECT Structure (what you need):**
```
your-repo/
├── streamlit_app.py
├── cro_bot.py
├── requirements.txt
├── .streamlit/
│   └── config.toml
├── README.md
└── ...
```

### 2. How to Fix It

1. **Go to your GitHub repository**
2. **Move all files** from the `CRO-UX Analysis App/` folder to the **root** of your repository
3. **Delete the empty folder** `CRO-UX Analysis App/`

### 3. Update Streamlit Cloud Settings

1. **Go to [share.streamlit.io](https://share.streamlit.io)**
2. **Edit your app settings**
3. **Change the main file path** from:
   - ❌ `CRO-UX Analysis App/streamlit_app.py`
   - ✅ `streamlit_app.py`

### 4. Redeploy

1. **Push your changes** to GitHub
2. **Redeploy** on Streamlit Cloud
3. **Set your secrets** (OpenAI API key)

## Why This Happened

Streamlit Cloud expects your main app file to be in the **root** of your repository, not in a subfolder. The `App/requirements.txt` error occurs because Streamlit is looking for `requirements.txt` in the root, but it's finding a path instead.

## Quick Commands (if using Git)

```bash
# Clone your repo locally
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Move files from subfolder to root
mv "CRO-UX Analysis App"/* .
rmdir "CRO-UX Analysis App"

# Commit and push
git add .
git commit -m "Fix repository structure for Streamlit deployment"
git push
```

## After Fixing

Your app should deploy successfully! The `playwright` dependency has been removed from `requirements.txt` to avoid installation issues on Streamlit Cloud.
