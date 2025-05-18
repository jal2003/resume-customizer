import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

export default function EditPdf() {
  const router = useRouter();
  const { pdfData } = router.query;
  
  const [latexContent, setLatexContent] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [editInstruction, setEditInstruction] = useState('');
  const [error, setError] = useState('');
  const [updateCount, setUpdateCount] = useState(0);
  
  useEffect(() => {
    if (pdfData && typeof pdfData === 'string') {
      try {
        const decodedData = JSON.parse(atob(pdfData));
        setLatexContent(decodedData.latexContent);
        setPdfUrl(decodedData.pdfUrl);
      } catch (error) {
        console.error("Failed to parse PDF data:", error);
        setError("Failed to parse PDF data. Please go back and try again.");
      }
    }
  }, [pdfData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editInstruction.trim()) {
      setError('Please enter edit instructions');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // EXACTLY copy what the home page does
      const formData = new FormData();
      formData.append('resumeContent', latexContent);
      formData.append('jobPosting', editInstruction);
      
      const response = await fetch('/api/customize-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.pdfUrl) {
        setLatexContent(result.latexContent);
        setPdfUrl(result.pdfUrl);
        setUpdateCount(prev => prev + 1);
        setEditInstruction(''); // Clear the input after successful update
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

  const handleGoBack = () => {
    router.push('/');
  };
  
  return (
    <div className="container">
      <Head>
        <title>Edit Resume | Resume Customizer</title>
        <meta name="description" content="Make targeted edits to your resume" />
      </Head>
      
      <main>
        <a onClick={handleGoBack} className="back-button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 8H1M1 8L8 15M1 8L8 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back to Home</span>
        </a>

        <h1>Fine-tune Your Resume</h1>
        <p>Make targeted edits to your resume to highlight specific skills or experiences.</p>
        
        <div style={{ display: 'flex', gap: '30px', marginTop: '2rem' }}>
          <div className="edit-panel" style={{ flex: 1 }}>
            <div className="form-container">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="editInstructions">
                    <h3>Edit Instructions</h3>
                    <p>Describe the changes you want to make. Try to be specific.</p>
                  </label>
                  <textarea
                    id="editInstructions"
                    rows={5}
                    value={editInstruction}
                    onChange={(e) => setEditInstruction(e.target.value)}
                    placeholder="Example: Add a leadership section highlighting my management experience, or Make my technical skills more prominent"
                    disabled={loading}
                  />
                </div>
                
                {error && (
                  <div className="error">{error}</div>
                )}
                
                {updateCount > 0 && (
                  <div className="update-message">
                    <span className="success-icon">✓</span> 
                    Resume updated successfully!
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={loading || !editInstruction.trim()}
                  className={loading ? 'loading-button' : ''}
                >
                  {loading ? (
                    <span className="loading-content">
                      <span className="loading-spinner"></span>
                      <span>Updating...</span>
                    </span>
                  ) : (
                    'Update Resume'
                  )}
                </button>
              </form>
            </div>
            
            <div className="tips">
              <h3>Tips for effective editing</h3>
              <ul>
                <li>Be specific about which sections to modify</li>
                <li>Ask for emphasis on relevant skills</li>
                <li>Request to highlight experiences relevant to the job</li>
                <li>Suggest wording changes for better impact</li>
              </ul>
            </div>
          </div>
          
          <div className="preview-panel" style={{ flex: 1 }}>
            <h2>Resume Preview</h2>
            <div className="preview-container">
              {loading ? (
                <div className="loading-message">
                  <div className="loading-spinner"></div>
                  <p>Updating your resume...</p>
                </div>
              ) : pdfUrl ? (
                <iframe 
                  src={pdfUrl} 
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Resume PDF Preview"
                />
              ) : (
                <div className="loading-message">
                  <p>No PDF to display</p>
                </div>
              )}
            </div>
            
            {pdfUrl && (
              <div className="action-buttons">
                <a 
                  href={pdfUrl} 
                  download="customized_resume.pdf"
                  className="button download-button"
                >
                  Download PDF
                </a>
              </div>
            )}
          </div>
        </div>
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