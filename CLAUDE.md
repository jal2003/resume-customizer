# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a resume generator application that helps users customize their LaTeX resumes for specific job postings using Claude API and LaTeX compilation.

## Development Setup

### Installation
```bash
npm install
```

### Running the Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Architecture

### Core Components
- `pages/index.tsx`: Main UI for uploading resume and job posting
- `pages/api/customize-resume.ts`: API endpoint that processes the customization
- `lib/claude.ts`: Handles interaction with Claude API
- `lib/latex.ts`: Manages LaTeX compilation and PDF generation
- `templates/`: Contains LaTeX resume templates

### Data Flow
1. User uploads LaTeX resume and job posting
2. Frontend sends data to API endpoint
3. API sends resume and job posting to Claude for customization
4. Claude returns optimized LaTeX
5. LaTeX compiler converts to PDF
6. PDF is returned to user for download

### Environment Variables
- `ANTHROPIC_API_KEY`: Required for Claude API access

## Deployment Notes

This application is designed to be deployed on Vercel, but requires LaTeX to be available in the environment for PDF compilation. For production, it should use Vercel's MCP (Managed Compute Platform) to execute LaTeX compilation.