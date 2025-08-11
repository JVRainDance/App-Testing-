#!/usr/bin/env python3
"""
Setup script for CRO UX Analysis Bot
"""

from setuptools import setup, find_packages
import os

# Read the README file
def read_readme():
    with open("README.md", "r", encoding="utf-8") as fh:
        return fh.read()

# Read requirements
def read_requirements():
    with open("requirements.txt", "r", encoding="utf-8") as fh:
        return [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="cro-ux-analysis-bot",
    version="1.0.0",
    author="CRO UX Analysis Bot",
    author_email="your-email@example.com",
    description="AI-powered Conversion Rate Optimization and User Experience analysis tool",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/cro-ux-analysis-bot",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Marketing",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Programming Language :: Python :: 3.13",
        "Topic :: Internet :: WWW/HTTP :: Site Management",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Text Processing :: Markup :: HTML",
    ],
    python_requires=">=3.8",
    install_requires=read_requirements(),
    entry_points={
        "console_scripts": [
            "cro-bot=cro_bot:main",
        ],
    },
    keywords="cro, ux, conversion, optimization, analysis, ai, gpt, website, audit",
    project_urls={
        "Bug Reports": "https://github.com/yourusername/cro-ux-analysis-bot/issues",
        "Source": "https://github.com/yourusername/cro-ux-analysis-bot",
        "Documentation": "https://github.com/yourusername/cro-ux-analysis-bot#readme",
    },
)
