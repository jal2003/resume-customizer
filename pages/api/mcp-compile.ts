import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { latexContent } = req.body;
    
    if (!latexContent) {
      return res.status(400).json({ error: 'LaTeX content is required' });
    }
    
    // Create temp directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-'));
    const latexFilePath = path.join(tempDir, 'resume.tex');
    const pdfFilePath = path.join(tempDir, 'resume.pdf');
    
    // Write LaTeX content to temp file
    await fs.writeFile(latexFilePath, latexContent);
    
    // Compile LaTeX to PDF
    await new Promise<void>((resolve, reject) => {
      const pdflatex = spawn('pdflatex', [
        '-interaction=nonstopmode',
        '-output-directory', tempDir,
        latexFilePath
      ]);
      
      let stderr = '';
      pdflatex.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pdflatex.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`pdflatex process exited with code ${code}: ${stderr}`));
        }
      });
    });
    
    // Check if PDF was created
    await fs.access(pdfFilePath);
    
    // Read PDF file
    const pdfBuffer = await fs.readFile(pdfFilePath);
    
    // Return PDF content
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=customized_resume.pdf');
    res.send(pdfBuffer);
    
    // Clean up temp directory in the background
    fs.rm(tempDir, { recursive: true, force: true })
      .catch(error => console.error('Failed to clean up temp directory:', error));
    
  } catch (error) {
    console.error('Error in MCP compile:', error);
    res.status(500).json({ error: 'Failed to compile LaTeX to PDF' });
  }
}