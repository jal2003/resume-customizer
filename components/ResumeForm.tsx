import { useState } from 'react';

interface ResumeFormProps {
  onSubmit: (resumeContent: string, jobPosting: string) => Promise<void>;
  loading: boolean;
}

export default function ResumeForm({ onSubmit, loading }: ResumeFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobPosting, setJobPosting] = useState('');
  const [error, setError] = useState('');
  const [useTemplate, setUseTemplate] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
      setUseTemplate(false);
    }
  };
  
  const handleUseTemplate = () => {
    setUseTemplate(true);
    setResumeFile(null);
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
      <div className="form-group">
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', marginRight: '1rem' }}>
            <input
              type="radio"
              checked={!useTemplate}
              onChange={() => setUseTemplate(false)}
              style={{ marginRight: '0.5rem' }}
            />
            Upload your LaTeX resume
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              checked={useTemplate}
              onChange={handleUseTemplate}
              style={{ marginRight: '0.5rem' }}
            />
            Use a template
          </label>
        </div>
        
        {!useTemplate && (
          <div>
            <label htmlFor="resume">Upload Your LaTeX Resume (.tex file)</label>
            <input
              type="file"
              id="resume"
              accept=".tex"
              onChange={handleFileChange}
              required={!useTemplate}
            />
          </div>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="jobPosting">Job Posting</label>
        <textarea
          id="jobPosting"
          rows={10}
          value={jobPosting}
          onChange={(e) => setJobPosting(e.target.value)}
          placeholder="Paste the job description here..."
          required
        />
      </div>
      
      {error && <div className="error" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Customizing...' : 'Customize Resume'}
      </button>
    </form>
  );
}