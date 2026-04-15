export const FILE_SIZE_LIMIT = 10 * 1024 * 1024;

export const DEFAULT_TEMPLATES: Array<{ title: string; role: string; content: string }> = [
  {
    title: 'Executive Summary',
    role: 'Summarizer',
    content:
      'Transform the provided document into a concise executive summary. ' +
      'Structure the output as follows:\n' +
      '1. One-sentence overview (what this document is about).\n' +
      '2. Key points (3-5 bullet points covering the most important facts, decisions, or findings).\n' +
      '3. Action items or conclusions (if any).\n' +
      'Use plain business language. Avoid jargon. Be brief — the summary should be readable in under 2 minutes.',
  },
  {
    title: 'Legal to Layman',
    role: 'Legal Translator',
    content:
      'Translate the provided legal text into plain, everyday language that anyone can understand. ' +
      'Follow these rules:\n' +
      '- Replace all legal terms and Latin phrases with simple equivalents.\n' +
      '- Break long sentences into short, clear ones.\n' +
      '- Explain what each clause or section actually means for the reader in practice.\n' +
      '- Highlight any obligations, rights, deadlines, or risks the reader should be aware of.\n' +
      '- Do not omit important details — simplify language, not meaning.',
  },
  {
    title: 'Tech for Non-Tech',
    role: 'Tech Explainer',
    content:
      'Explain the provided technical content to someone with no technical background. ' +
      'Guidelines:\n' +
      '- Use everyday analogies to explain technical concepts.\n' +
      '- Avoid acronyms; if you must use one, define it immediately.\n' +
      '- Focus on what the technology does and why it matters, not how it works internally.\n' +
      '- Structure the explanation as: what it is → why it matters → what the reader should know or do.\n' +
      '- Keep the tone friendly and approachable.',
  },
];
export const MAX_FILE_COUNT = 5;
export const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const ALLOWED_EXTENSIONS = new Map<string, string>([
  ['pdf', 'application/pdf'],
  ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['txt', 'text/plain'],
  ['md', 'text/markdown'],
  ['csv', 'text/csv'],
]);
export const TEXT_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
