import streamlit as st
import os
import tempfile
import base64
from pathlib import Path
import time
from cro_bot import CROAnalyzer

# Page configuration
st.set_page_config(
    page_title="CRO UX Analysis Bot",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        color: #1f77b4;
        margin-bottom: 2rem;
    }
    .sub-header {
        font-size: 1.5rem;
        color: #666;
        text-align: center;
        margin-bottom: 2rem;
    }
    .feature-box {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 10px;
        margin: 0.5rem 0;
    }
    .success-box {
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        border-radius: 10px;
        padding: 1rem;
        margin: 1rem 0;
    }
    .error-box {
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 10px;
        padding: 1rem;
        margin: 1rem 0;
    }
    .info-box {
        background-color: #d1ecf1;
        border: 1px solid #bee5eb;
        border-radius: 10px;
        padding: 1rem;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

def main():
    # Header
    st.markdown('<h1 class="main-header">🤖 CRO UX Analysis Bot</h1>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">AI-Powered Website Conversion Rate Optimization & User Experience Analysis</p>', unsafe_allow_html=True)
    
    # Sidebar for configuration
    with st.sidebar:
        st.header("⚙️ Configuration")
        
        # API Key (hardcoded)
        api_key = "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"
        
        st.info("🔑 API Key configured and ready to use")
        
        # Audit type selection
        audit_type = st.selectbox(
            "Audit Type",
            ["both", "cro", "ux"],
            format_func=lambda x: {
                "both": "CRO + UX (Recommended)",
                "cro": "CRO Only",
                "ux": "UX Only"
            }[x],
            help="Choose what type of analysis to perform"
        )
        
        # Use JavaScript rendering
        use_js = st.checkbox(
            "Use JavaScript Rendering",
            value=False,
            help="Enable if the website uses JavaScript to load content"
        )
        
        # Max pages for crawling
        max_pages = st.slider(
            "Max Pages to Crawl",
            min_value=1,
            max_value=10,
            value=3,
            help="Maximum total number of pages to analyze when crawling a website (includes all pages found at any depth)"
        )
        
        st.markdown("---")
        st.markdown("### 📊 Features")
        st.markdown("""
        - **15 CRO Questions** across 7 categories
        - **18 UX Questions** across 8 categories
        - **AI-Powered Insights** with actionable recommendations
        - **Professional PDF Reports**
        - **Website Crawling** for comprehensive analysis
        """)
        
        st.markdown("---")
        st.markdown("### 🔧 Requirements")
        st.markdown("""
        - Internet connection
        - Valid website URL
        - OpenAI API credits (configured)
        """)
    
    # Main content area
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.header("🌐 Website Analysis")
        
        # URL input
        url = st.text_input(
            "Enter Website URL",
            placeholder="https://example.com",
            help="Enter the full URL of the website you want to analyze"
        )
        
        # Analysis options
        col1_1, col1_2 = st.columns(2)
        
        with col1_1:
            crawl_site = st.checkbox(
                "Crawl Multiple Pages",
                value=False,
                help="Analyze multiple pages from the same website"
            )
        

        
        # Analyze button
        if st.button("🚀 Start Analysis", type="primary", use_container_width=True):
            if not url:
                st.error("Please enter a website URL")
                return
            

            
            # Initialize bot
            try:
                bot = CROAnalyzer(api_key)
                
                # Show progress
                with st.spinner("🔍 Analyzing website..."):
                    progress_bar = st.progress(0)
                    status_text = st.empty()
                    
                    # Update progress
                    progress_bar.progress(25)
                    status_text.text("Fetching webpage content...")
                    
                    if crawl_site:
                        progress_bar.progress(50)
                        status_text.text("Crawling website pages...")
                        result = bot.analyze_entire_website(url, max_pages=max_pages, audit_type=audit_type, use_playwright=use_js)
                    else:
                        progress_bar.progress(75)
                        status_text.text("Generating AI analysis...")
                        result = bot.analyze_page(url, audit_type=audit_type, use_playwright=use_js)
                    
                    progress_bar.progress(100)
                    status_text.text("Generating PDF report...")
                
                if result:
                    st.success("✅ Analysis completed successfully!")
                    
                    # Generate PDF report from the analysis results
                    try:
                        pdf_path = bot.create_pdf_report(result)
                        
                        # Display results
                        st.markdown("### 📄 Generated Report")
                        
                        # Create download button for PDF
                        with open(pdf_path, "rb") as file:
                            pdf_data = file.read()
                            b64_pdf = base64.b64encode(pdf_data).decode()
                            
                            st.download_button(
                                label="📥 Download PDF Report",
                                data=pdf_data,
                                file_name=f"cro_ux_analysis_{url.replace('://', '_').replace('/', '_').replace('.', '_')}.pdf",
                                mime="application/pdf",
                                use_container_width=True
                            )
                        
                        # Show preview of the report
                        st.markdown("### 📋 Report Preview")
                        st.info("Click the download button above to get the full PDF report with detailed analysis and recommendations.")
                        
                    except Exception as pdf_error:
                        st.error(f"❌ Error generating PDF report: {str(pdf_error)}")
                        st.info("Analysis completed but PDF generation failed. Check the console for details.")
                    
                else:
                    st.error("❌ Analysis failed. Please try again.")
                    
            except Exception as e:
                st.error(f"❌ Error during analysis: {str(e)}")
                st.info("💡 Make sure the website URL is valid and accessible.")
    
    with col2:
        st.header("📈 Sample Output")
        
        st.markdown("### 🎯 What You'll Get")
        st.markdown("""
        **CRO Analysis:**
        - Headline optimization
        - CTA effectiveness
        - Value proposition clarity
        - Trust signals
        - Form optimization
        
        **UX Analysis:**
        - Page load speed
        - Mobile responsiveness
        - Navigation clarity
        - Content readability
        - Accessibility
        """)
        
        st.markdown("### 📊 Report Sections")
        st.markdown("""
        1. **Executive Summary**
        2. **CRO Audit Results** (15 questions)
        3. **UX Audit Results** (18 questions)
        4. **Priority Recommendations**
        5. **Quick Wins**
        6. **Overall Score & Grade**
        """)
        
        st.markdown("### ⚡ Quick Tips")
        st.markdown("""
        - Use "CRO + UX" for comprehensive analysis
        - Enable JavaScript rendering for dynamic sites
        - Crawl multiple pages for deeper insights
        - Ensure the website URL is accessible
        """)

if __name__ == "__main__":
    main()
