import { useState } from 'react';
import Head from 'next/head';
import ResumeForm from '@/components/ResumeForm';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (resumeContent: string, jobPosting: string) => {
    setLoading(true);
    setError('');
    setDownloadUrl('');
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('resumeContent', resumeContent);
      formData.append('jobPosting', jobPosting);
      
      // Send to API
      const response = await fetch('/api/customize-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.pdfUrl) {
        setDownloadUrl(result.pdfUrl);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      <Head>
        <title>Resume Customizer</title>
        <meta name="description" content="Customize your resume for job applications" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <h1>Resume Customizer</h1>
        <p>Upload your LaTeX resume and paste a job description to customize your resume for the specific job.</p>
        
        <ResumeForm onSubmit={handleSubmit} loading={loading} />
        
        {error && <div className="error" style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
        
        {downloadUrl && (
          <div className="success" style={{ marginTop: '1rem' }}>
            <p>Your customized resume is ready!</p>
            <a 
              href={downloadUrl} 
              download="customized_resume.pdf"
              className="download-button"
              style={{
                display: 'inline-block',
                background: '#4caf50',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                fontWeight: 600,
                marginTop: '0.5rem'
              }}
            >
              Download PDF
            </a>
          </div>
        )}
      </main>
    </div>
  );
}