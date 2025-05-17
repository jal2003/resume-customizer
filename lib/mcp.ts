// Utility function to interact with the MCP server for LaTeX compilation
// This would be used in a production environment where the LaTeX compiler
// needs to run in a managed compute environment

import { compileLatexToPdf } from './latex';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function debugCompilePdf(latexContent: string): Promise<{ pdfPath: string }> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-debug-'));
  const latexFilePath = path.join(tempDir, 'resume.tex');
  const pdfFilePath = path.join(tempDir, 'resume.pdf');
  
  console.log('Debug compilation directory:', tempDir);
  
  try {
    // Write LaTeX content to temp file
    await fs.writeFile(latexFilePath, latexContent);
    
    // Save the input LaTeX for inspection
    await fs.writeFile(path.join(tempDir, 'input.tex'), latexContent);
    
    // Run pdflatex in verbose mode
    const result = await new Promise<{success: boolean, output: string}>((resolve, reject) => {
      const pdflatex = spawn('pdflatex', [
        '-interaction=nonstopmode',
        '-file-line-error',
        '-output-directory', tempDir,
        '-recorder',
        latexFilePath
      ]);
      
      let output = '';
      
      pdflatex.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        console.log(chunk);
      });
      
      pdflatex.stderr.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        console.error(chunk);
      });
      
      pdflatex.on('close', (code) => {
        // Save the output regardless of success
        fs.writeFile(path.join(tempDir, 'pdflatex.log'), output)
          .catch(err => console.error('Failed to save log', err));
        
        if (code === 0) {
          resolve({success: true, output});
        } else {
          resolve({success: false, output});
        }
      });
    });
    
    if (!result.success) {
      console.error('LaTeX compilation failed with output:', result.output);
      throw new Error(`LaTeX compilation failed. See logs in ${tempDir}`);
    }
    
    // Check if PDF was created
    await fs.access(pdfFilePath);
    
    return { pdfPath: pdfFilePath };
  } catch (error) {
    console.error('Error in debug compilation:', error);
    throw error;
  }
}

export async function compilePdfWithMcp(latexContent: string): Promise<{ pdfBuffer: Buffer }> {
  // In development, use the local LaTeX compiler
  if (process.env.NODE_ENV === 'development') {
    try {
      // Try the debug compiler first which has better error reporting
      const { pdfPath } = await debugCompilePdf(latexContent);
      const pdfBuffer = await fs.readFile(pdfPath);
      return { pdfBuffer };
    } catch (error) {
      console.error('Debug compilation failed, falling back to standard compiler:', error);
      const { pdfPath } = await compileLatexToPdf(latexContent);
      const pdfBuffer = await fs.readFile(pdfPath);
      return { pdfBuffer };
    }
  }
  
  // In production, use the MCP server
  // Note: This is a simplified example. In a real implementation,
  // you would need to handle the MCP server setup and deployment
  try {
    const response = await fetch('/api/mcp-compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latexContent }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to compile PDF: ${errorText}`);
    }
    
    const pdfBuffer = Buffer.from(await response.arrayBuffer());
    return { pdfBuffer };
  } catch (error) {
    console.error('Error compiling PDF with MCP:', error);
    throw error;
  }
}