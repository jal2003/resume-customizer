import { useState } from 'react';
import Head from 'next/head';
import ResumeForm from '@/components/ResumeForm';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [latexContent, setLatexContent] = useState('');
  
  const handleSubmit = async (resumeContent: string, jobPosting: string) => {
    setLoading(true);
    setError('');
    setDownloadUrl('');
    setLatexContent(resumeContent);
    
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

  const handleEditPdf = () => {
    // Prepare data to send to the edit page
    const pdfData = JSON.stringify({
      latexContent,
      pdfUrl: downloadUrl
    });
    
    // Navigate to edit page with the data
    router.push(`/edit-pdf?pdfData=${btoa(pdfData)}`);
  };
  
  return (
    <div className="container">
      <Head>
        <title>Resume Customizer | AI-powered resume tailoring</title>
        <meta name="description" content="Instantly customize your resume for job applications using AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <div className="hero">
          <h1>Tailor your resume with AI</h1>
          <p>
            Upload your LaTeX resume and paste a job description. Our AI will customize your resume
            to highlight the most relevant experience for each application.
          </p>
        </div>
        
        <div className="form-container">
          <ResumeForm onSubmit={handleSubmit} loading={loading} />
        </div>
        
        {error && <div className="error">{error}</div>}
        
        {downloadUrl && (
          <div className="success">
            <div className="success-icon">✓</div>
            <h2>Your customized resume is ready!</h2>
            <p>Download your tailored resume or make additional edits.</p>
            
            <div className="action-buttons">
              <a 
                href={downloadUrl} 
                download="customized_resume.pdf"
                className="button download-button"
              >
                Download PDF
              </a>
              <button
                onClick={handleEditPdf}
                className="button edit-button"
              >
                Edit PDF
              </button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="footer">
        <div className="footer-logo">
          <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.67 11.7333H6.83833C7.52333 11.7333 8.09167 12.075 8.36667 12.6433L11.8417 19.4083C12.2333 20.2 11.6517 21.1333 10.755 21.1333H5.58667C4.90167 21.1333 4.33333 20.7917 4.05833 20.2233L0.583333 13.4583C0.191667 12.6667 0.773333 11.7333 1.67 11.7333Z" fill="#86868b"/>
            <path d="M14.8167 11.7333H19.985C20.67 11.7333 21.2383 12.075 21.5133 12.6433L24.9883 19.4083C25.38 20.2 24.7983 21.1333 23.9017 21.1333H18.7333C18.0483 21.1333 17.48 20.7917 17.205 20.2233L13.73 13.4583C13.3383 12.6667 13.92 11.7333 14.8167 11.7333Z" fill="#86868b"/>
            <path d="M27.9633 0.83335H33.1317C33.8167 0.83335 34.385 1.17502 34.66 1.74335L38.135 8.50835C38.5267 9.30002 37.945 10.2334 37.0483 10.2334H31.88C31.195 10.2334 30.6267 9.89168 30.3517 9.32335L26.8767 2.55835C26.485 1.76668 27.0667 0.83335 27.9633 0.83335Z" fill="#86868b"/>
          </svg>
          <span>YC Hackathon</span>
        </div>
        <p>© {new Date().getFullYear()} Resume Customizer. All rights reserved.</p>
      </footer>
    </div>
  );
}