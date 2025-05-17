import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Path to the basic template
    const templatePath = path.join(process.cwd(), 'templates', 'basic_resume.tex');
    
    // Read the template file
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    // Return the template content
    res.status(200).send(templateContent);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
}