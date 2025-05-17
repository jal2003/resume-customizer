#!/bin/bash

# Script to install LaTeX on the MCP server

# Update package lists
apt-get update

# Install TeX Live basic packages with non-interactive mode
DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    texlive-base \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-latex-extra \
    latexmk

# Install moderncv package for the resume template
tlmgr init-usertree
tlmgr install moderncv

# Verify installation
pdflatex --version

echo "LaTeX installation completed"