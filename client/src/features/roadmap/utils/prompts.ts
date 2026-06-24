export interface GenerateRoadmapPromptParams {
  topic: string;
  difficulty: string;
  durationWeeks?: number;
  durationType: string;
  durationValue: number;
  estimatedHoursPerDay: number;
  additionalContext?: string;
}

export function buildRoadmapPrompt(params: GenerateRoadmapPromptParams): string {
  const { topic, difficulty, durationType, durationValue, estimatedHoursPerDay, additionalContext } = params;

  return `
You are an expert curriculum designer and educational consultant. I need you to create a comprehensive, highly structured learning roadmap for the following topic:

**Topic:** ${topic.trim()}
**Target Audience Difficulty:** ${difficulty.toLowerCase()}
**Total Duration:** ${durationValue} ${durationType}
**Time Commitment:** ${estimatedHoursPerDay} hours per day
${additionalContext && additionalContext.trim() !== '' ? `**Specific User Instructions/Context:** ${additionalContext.trim()}` : ''}

Please generate a detailed, phase-by-phase roadmap that strictly adheres to these constraints. For each phase (milestone), provide:
1. A clear, inspiring title for the phase.
2. A brief description of what will be learned and why it is important.
3. A list of actionable, specific tasks that the learner must complete during that phase.
4. Make sure the total amount of work is realistic for the given time commitment (${estimatedHoursPerDay} hours/day over ${durationValue} ${durationType}).

Ensure the learning curve is appropriate for a ${difficulty.toLowerCase()} level. Begin with foundational concepts if beginner, or jump into advanced paradigms if advanced. Return the roadmap in a clear, structured format.
`.trim();
}
