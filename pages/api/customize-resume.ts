import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { customizeResume } from '@/lib/claude';
import { compileLatexToPdf } from '@/lib/latex';
import fs from 'fs/promises';
import { IncomingForm } from 'formidable';

// Disable body parsing for form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

type ProcessedFields = {
  resumeContent?: string;
  jobPosting?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Parse form data
    const fields = await new Promise<ProcessedFields>((resolve, reject) => {
      const form = new IncomingForm();
      
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve(fields as ProcessedFields);
      });
    });
    
    const { resumeContent, jobPosting } = fields;
    
    if (!resumeContent || !jobPosting) {
      return res.status(400).json({ error: 'Resume content and job posting are required' });
    }
    
    // Customize resume with Claude
    try {
      const customizedResume = await customizeResume(resumeContent, jobPosting);
      
      // Compile LaTeX to PDF
      const { pdfPath } = await compileLatexToPdf(customizedResume);
      
      // Read PDF file
      const pdfBuffer = await fs.readFile(pdfPath);
      
      // Create a temporary URL for the PDF
      // In a production environment, you might want to use a storage service like S3
      const pdfBase64 = pdfBuffer.toString('base64');
      const pdfUrl = `data:application/pdf;base64,${pdfBase64}`;
      
      // Return the PDF URL
      res.status(200).json({ pdfUrl });
    } catch (error) {
      console.error('Error during customization or compilation:', error);
      return res.status(500).json({ error: `Failed to process resume: ${error.message}` });
    }
  } catch (error) {
    console.error('Error in API:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
}