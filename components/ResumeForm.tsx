import { useState } from 'react';
import React from 'react';

interface ResumeFormProps {
  onSubmit: (resumeContent: string, jobPosting: string) => Promise<void>;
  loading: boolean;
}

export default function ResumeForm({ onSubmit, loading }: ResumeFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobPosting, setJobPosting] = useState('');
  const [error, setError] = useState('');
  const [useTemplate, setUseTemplate] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
      setUseTemplate(false);
      if (jobPosting) {
        setActiveStep(2);
      }
    }
  };
  
  const handleUseTemplate = () => {
    setUseTemplate(true);
    setResumeFile(null);
    if (jobPosting) {
      setActiveStep(2);
    }
  };
  
  const handleJobPostingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobPosting(e.target.value);
    if (e.target.value && (resumeFile || useTemplate)) {
      setActiveStep(2);
    } else {
      setActiveStep(1);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!useTemplate && !resumeFile) {
      setError('Please upload a LaTeX resume file or use a template');
      return;
    }
    
    if (!jobPosting) {
      setError('Please enter a job posting');
      return;
    }
    
    setError('');
    
    try {
      let resumeContent = '';
      
      if (useTemplate) {
        // Fetch the template content from the server
        const response = await fetch('/api/get-template');
        if (!response.ok) {
          throw new Error('Failed to fetch template');
        }
        resumeContent = await response.text();
      } else {
        // Read the uploaded file content
        resumeContent = await resumeFile!.text();
      }
      
      // Submit the form
      await onSubmit(resumeContent, jobPosting);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-steps">
        <div className={`form-step ${activeStep >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-text">Upload Resume</span>
        </div>
        <div className="step-connector"></div>
        <div className={`form-step ${activeStep >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-text">Job Details</span>
        </div>
        <div className="step-connector"></div>
        <div className={`form-step ${activeStep >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-text">Customize</span>
        </div>
      </div>

      <div className="form-group">
        <h3>Resume Source</h3>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              checked={!useTemplate}
              onChange={() => setUseTemplate(false)}
              name="resumeSource"
            />
            <span>Upload your LaTeX resume</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              checked={useTemplate}
              onChange={handleUseTemplate}
              name="resumeSource"
            />
            <span>Use a template</span>
          </label>
        </div>
        
        {!useTemplate && (
          <div className="file-upload">
            <label htmlFor="resume" className="file-label">
              <div className="file-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 15L12 18L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="file-text">
                <span className="file-title">Upload Your LaTeX Resume</span>
                <span className="file-subtitle">.tex file</span>
              </div>
              {resumeFile && <span className="file-name">{resumeFile.name}</span>}
            </label>
            <input
              type="file"
              id="resume"
              accept=".tex"
              onChange={handleFileChange}
              required={!useTemplate}
              className="hidden-file-input"
            />
          </div>
        )}
      </div>
      
      <div className="form-group">
        <h3>Job Posting</h3>
        <label htmlFor="jobPosting">Paste the job description below</label>
        <textarea
          id="jobPosting"
          rows={10}
          value={jobPosting}
          onChange={handleJobPostingChange}
          placeholder="Copy and paste the full job description here..."
          required
        />
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <button 
        type="submit" 
        disabled={loading}
        className={loading ? 'loading-button' : ''}
      >
        {loading ? (
          <span className="loading-content">
            <span className="loading-spinner"></span>
            <span>Customizing...</span>
          </span>
        ) : (
          'Customize Resume'
        )}
      </button>
    </form>
  );
}