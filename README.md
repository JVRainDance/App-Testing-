# CRO UX Analysis Bot 🤖

A powerful AI-powered Conversion Rate Optimization (CRO) and User Experience (UX) analysis tool that provides comprehensive website audits with actionable recommendations.

## 🚀 Features

- **Comprehensive CRO Audit**: 15 structured questions across 7 categories
- **Detailed UX Analysis**: 18 questions across 8 categories  
- **AI-Powered Insights**: Uses GPT-4 for intelligent analysis and recommendations
- **Professional PDF Reports**: Generates detailed, formatted reports
- **Multiple Analysis Modes**: Single page, multiple pages, or entire website crawling
- **JavaScript Rendering**: Optional Playwright support for dynamic content
- **Actionable Recommendations**: Specific, implementable suggestions with priority levels

## 📋 CRO Audit Categories

1. **Offers & Messaging** (4 questions)
2. **Social Proof & Trust** (2 questions)
3. **Analytics & Tracking** (2 questions)
4. **Lead Capture & Forms** (2 questions)
5. **Urgency & Scarcity** (1 question)
6. **Pricing & Friction** (2 questions)
7. **Speed & Experimentation** (2 questions)

## 🎨 UX Audit Categories

1. **Performance & Stability** (2 questions)
2. **Mobile-First Usability** (3 questions)
3. **Navigation & Information Architecture** (2 questions)
4. **Accessibility (WCAG 2.1 AA)** (3 questions)
5. **Content & Microcopy** (2 questions)
6. **Error States & Feedback** (2 questions)
7. **Visual Design & Consistency** (2 questions)
8. **Delight & Engagement** (2 questions)

## 🛠️ Installation

### Prerequisites

- Python 3.8 or higher
- OpenAI API key with GPT-4 access

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cro-ux-analysis-bot.git
   cd cro-ux-analysis-bot
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Playwright (optional, for JavaScript rendering)**
   ```bash
   playwright install
   ```

4. **Set up your OpenAI API key**
   ```bash
   # Option 1: Environment variable
   export OPENAI_API_KEY="your-api-key-here"
   
   # Option 2: Edit the script directly
   # Open cro_bot.py and replace the api_key variable
   ```

## 🚀 Usage

### Option 1: Command Line Interface

```bash
python cro_bot.py
```

### Option 2: Streamlit Web Interface (Recommended)

```bash
streamlit run streamlit_app.py
```

Then open your browser to `http://localhost:8501`

### Option 3: Deploy to Streamlit Cloud

For easy deployment and sharing:

1. **Upload all files** to a GitHub repository
2. **Go to [share.streamlit.io](https://share.streamlit.io)**
3. **Connect your GitHub repository**
4. **Deploy with main file path**: `streamlit_app.py`

📖 **See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions**

### Command Line Options

The bot provides an interactive menu with the following options:

1. **Analyze single page** - Comprehensive CRO/UX audit of one webpage
2. **Analyze multiple pages** - Audit several pages at once
3. **Crawl and analyze entire website** - Discover and analyze all pages on a domain
4. **Check site status** - Verify if a website is accessible
5. **Exit**

### Audit Types

When analyzing a page, you can choose:

- **CRO Audit only** (15 questions) - Focus on conversion optimization
- **UX Audit only** (18 questions) - Focus on user experience
- **Both CRO & UX Audit** (33 questions) - Comprehensive analysis

### Output Options

For each analysis, you can save results as:

- **JSON file** - Raw data for further processing
- **PDF report** - Professional formatted report
- **Both** - Save in both formats

## 📊 Sample Output

The bot generates detailed reports including:

### Structured Analysis
- Question-by-question evaluation (Yes/No/Needs work)
- Evidence-based findings
- Quick-win suggestions for each issue

### Priority Recommendations
- **High Priority Fixes**: Critical issues with exact actions
- **Medium Priority**: Important improvements with specific steps  
- **Quick Wins**: Easy fixes implementable in under 1 hour

### Scoring System
- CRO Score: X/15 with percentage
- UX Score: X/18 with percentage
- Overall Grade: A/B/C/D/F

## 🔧 Configuration

### API Key Setup

Edit `cro_bot.py` and replace the API key:

```python
api_key = "your-openai-api-key-here"
```

### Customization

You can modify the audit questions by editing the `get_cro_audit_questions()` and `get_ux_audit_questions()` methods in `cro_bot.py`.

## 📁 Project Structure

```
cro-ux-analysis-bot/
├── streamlit_app.py        # Streamlit web interface
├── cro_bot.py              # Core bot functionality
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── LICENSE                # MIT License
├── .gitignore            # Git ignore file
├── DEPLOYMENT.md          # Streamlit deployment guide
├── .streamlit/
│   └── config.toml       # Streamlit configuration
├── example_output/       # Sample reports
│   ├── sample_report.pdf
│   └── sample_analysis.json
└── Reports/              # Generated reports (created automatically)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Important Notes

- **API Costs**: This tool uses OpenAI's GPT-4 API. Ensure you have sufficient credits in your OpenAI account.
- **Rate Limits**: Be mindful of API rate limits when analyzing multiple pages.
- **Website Access**: Some websites may block automated requests. Use Playwright for JavaScript-heavy sites.

## 🆘 Troubleshooting

### Common Issues

1. **"Insufficient quota" error**
   - Add billing to your OpenAI account
   - Check your API key is valid

2. **"Failed to fetch page content"**
   - Try enabling Playwright for JavaScript rendering
   - Check if the website is accessible

3. **Small PDF files (3-4 KB)**
   - Indicates API quota exceeded
   - Add billing to OpenAI account

### Getting Help

- Check the [Issues](https://github.com/yourusername/cro-ux-analysis-bot/issues) page
- Create a new issue with detailed error information
- Include the URL you're trying to analyze and any error messages

## 🎯 Use Cases

- **E-commerce Optimization**: Improve conversion rates on product pages
- **Lead Generation**: Optimize landing pages for better lead capture
- **User Experience**: Enhance website usability and accessibility
- **Marketing Campaigns**: Audit campaign landing pages
- **Website Redesign**: Pre-redesign analysis and post-launch validation

## 🔮 Future Enhancements

- [x] Web interface (Streamlit)
- [ ] Batch processing capabilities
- [ ] Integration with Google Analytics
- [ ] A/B testing recommendations
- [ ] Competitor analysis
- [ ] Automated monitoring

---

**Made with ❤️ for better websites**
