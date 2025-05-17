# Resume Generator

A web application that customizes LaTeX resumes for job applications using Claude AI.

## Features

- Upload your LaTeX resume (.tex file)
- Input a job posting
- AI customizes your resume to match the job requirements
- Compiles LaTeX to PDF
- Download the customized resume

## Prerequisites

- Node.js (v16 or newer)
- LaTeX installed on the server (for PDF generation)
- Claude API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd resume-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your API key:
```
ANTHROPIC_API_KEY=your-api-key-here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add your environment variables in the Vercel dashboard.

5. Note: For LaTeX compilation to work in production, you need to use Vercel's MCP feature to execute the LaTeX compiler.

## MCP Integration

To use Vercel's Managed Compute Platform for LaTeX compilation:

1. Create an MCP server that has LaTeX installed
2. Update the API endpoint to call MCP for compilation
3. Configure the MCP to return the compiled PDF

## Project Structure

- `/pages` - Next.js pages and API routes
- `/templates` - LaTeX resume templates
- `/lib` - Utility functions for Claude API and LaTeX
- `/styles` - CSS styles
- `/public` - Static assets
- `/components` - React components

## License

MIT