import * as LatexJS from 'latex.js';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Function to use LaTeX.js for client-side rendering (fallback)
export function renderLatexWithJs(latexContent: string): Promise<string> {
  try {
    const generator = new LatexJS.Document({ latexEngine: { command: 'pdflatex' } });
    const output = generator.parse(latexContent);
    return Promise.resolve(output.htmlDocument().documentElement.outerHTML);
  } catch (error) {
    console.error('Error rendering LaTeX with latex.js:', error);
    return Promise.reject(error);
  }
}

// Function to validate LaTeX code before compilation
function validateLatex(latexContent: string): { valid: boolean, errors: string[] } {
  const errors: string[] = [];
  
  // Check for unclosed environments
  const beginEnvRegex = /\\begin\{([^\}]+)\}/g;
  const endEnvRegex = /\\end\{([^\}]+)\}/g;
  
  const beginEnvironments: Map<string, number> = new Map();
  const endEnvironments: Map<string, number> = new Map();
  
  let match;
  while ((match = beginEnvRegex.exec(latexContent)) !== null) {
    const envName = match[1];
    beginEnvironments.set(envName, (beginEnvironments.get(envName) || 0) + 1);
  }
  
  while ((match = endEnvRegex.exec(latexContent)) !== null) {
    const envName = match[1];
    endEnvironments.set(envName, (endEnvironments.get(envName) || 0) + 1);
  }
  
  // Check for environments that have different counts of \begin and \end
  for (const [envName, beginCount] of beginEnvironments.entries()) {
    const endCount = endEnvironments.get(envName) || 0;
    if (beginCount !== endCount) {
      errors.push(`Environment '${envName}' has ${beginCount} \\begin but ${endCount} \\end tags`);
    }
  }
  
  // Check for environments that have an \end without a \begin
  for (const [envName, endCount] of endEnvironments.entries()) {
    if (!beginEnvironments.has(envName)) {
      errors.push(`Environment '${envName}' has an \\end tag without a matching \\begin`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Function to compile LaTeX to PDF using actual LaTeX compiler
export async function compileLatexToPdf(latexContent: string): Promise<{ pdfPath: string }> {
  // Validate LaTeX code first
  const validation = validateLatex(latexContent);
  if (!validation.valid) {
    console.error('LaTeX validation failed:', validation.errors);
    throw new Error(`Invalid LaTeX: ${validation.errors.join(', ')}`);
  }
  
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-'));
  const latexFilePath = path.join(tempDir, 'resume.tex');
  const pdfFilePath = path.join(tempDir, 'resume.pdf');
  
  try {
    // Write LaTeX content to temp file
    await fs.writeFile(latexFilePath, latexContent);
    
    // Write LaTeX content to a debug file for inspection
    await fs.writeFile(path.join(tempDir, 'debug_resume.tex'), latexContent);
    
    // Compile LaTeX to PDF
    await new Promise<void>((resolve, reject) => {
      const pdflatex = spawn('pdflatex', [
        '-interaction=nonstopmode',
        '-output-directory', tempDir,
        latexFilePath
      ]);
      
      let stdoutOutput = '';
      let stderrOutput = '';
      
      pdflatex.stdout.on('data', (data) => {
        stdoutOutput += data.toString();
      });
      
      pdflatex.stderr.on('data', (data) => {
        stderrOutput += data.toString();
      });
      
      pdflatex.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          // Save error logs for debugging
          fs.writeFile(path.join(tempDir, 'pdflatex-stdout.log'), stdoutOutput)
            .catch(err => console.error('Failed to write stdout log', err));
          
          fs.writeFile(path.join(tempDir, 'pdflatex-stderr.log'), stderrOutput)
            .catch(err => console.error('Failed to write stderr log', err));
          
          console.error('LaTeX compilation error. Check logs in:', tempDir);
          console.error('Error output:', stderrOutput || stdoutOutput);
          
          reject(new Error(`pdflatex process exited with code ${code}`));
        }
      });
    });
    
    // Check if PDF was created
    await fs.access(pdfFilePath);
    
    return { pdfPath: pdfFilePath };
  } catch (error) {
    console.error('Error compiling LaTeX to PDF:', error);
    throw error;
  }
}