import { Anthropic } from '@anthropic-ai/sdk';

export async function customizeResume(resumeContent: string, jobPosting: string) {
  const systemPrompt = `You are an expert resume customizer. Your task is to modify a LaTeX resume to better match a job posting.
  
Follow these rules VERY CAREFULLY:
1. They are APPLYING for a position there, and have completely strong technical work experiences mirroring and strongly aligning with the job description.
2. Modify and replace the example bullet points and job title for all the work experiences to better match the job description.
3. Make sure every work experience has at least one backend language mentioned.
4. Do NOT change the company names (make up bullet points if needed, but ensure they align with each company).
5. Change the job titles to match the job description's job title (not too specific though).
6. Change the skills section to include ALL skills from the job description, including nice-to-haves.
7. Use AS MUCH OF THE TECH STACK from the job description as possible.
8. CRITICALLY IMPORTANT: Ensure you maintain proper LaTeX syntax with all environments properly closed.
9. If you use an \\begin{itemize}, you MUST have a matching \\end{itemize} before the end of the document.
10. Verify all LaTeX environments are properly closed before returning your response.
11. Do NOT add any new LaTeX packages or commands that weren't in the original.
12. Return ONLY the complete LaTeX document with your modifications.
13. ENSURE that for every \\begin{} there is a matching \\end{} tag.`;

  try {
    const response = await client.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 4000,
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Here is my current LaTeX resume:\n\n${resumeContent}\n\nHere is the job posting I want to apply for:\n\n${jobPosting}\n\nPlease customize my resume to better match this job posting. Return ONLY the modified LaTeX code.`
        }
      ]
    });

    if (response.content[0].type === 'text') {
      return response.content[0].text;
    } else {
      throw new Error('Unexpected response format from Claude');
    }
  } catch (error) {
    console.error('Error customizing resume with Claude:', error);
    throw error;
  }
}