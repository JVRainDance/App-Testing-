#!/usr/bin/env python3
"""
Quick Start Script for CRO UX Analysis Bot
This script demonstrates how to use the bot with a simple example.
"""

import os
import sys
from cro_bot import CROUXBot

def main():
    print("🚀 CRO UX Analysis Bot - Quick Start")
    print("=" * 50)
    
    # Check if API key is available
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OpenAI API key not found!")
        print("Please set your API key:")
        print("1. Set environment variable: export OPENAI_API_KEY='your-key-here'")
        print("2. Or run: python cro_bot.py")
        return
    
    # Initialize the bot
    bot = CROUXBot(api_key)
    
    # Example URL (you can change this)
    example_url = "https://example.com"
    
    print(f"📊 Analyzing: {example_url}")
    print("This will take a moment...")
    print()
    
    try:
        # Run analysis
        result = bot.analyze_page(example_url, audit_type="both")
        
        if result:
            print("✅ Analysis completed successfully!")
            print(f"📄 Report saved as: {result}")
            print()
            print("🎯 Key Features:")
            print("- 15 CRO audit questions across 7 categories")
            print("- 18 UX audit questions across 8 categories")
            print("- AI-powered insights with actionable recommendations")
            print("- Professional PDF report generation")
            print()
            print("💡 Try analyzing your own website:")
            print("python cro_bot.py")
        else:
            print("❌ Analysis failed. Check the error messages above.")
            
    except Exception as e:
        print(f"❌ Error during analysis: {e}")
        print("Make sure your OpenAI API key is valid and has sufficient credits.")

if __name__ == "__main__":
    main()
