import axios from 'axios';
import { ApiError } from '../utils/helpers.js';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export const generateArticleWithClaude = async (keywords, context = '') => {
  try {
    if (!CLAUDE_API_KEY) {
      throw new ApiError(500, 'Claude API key not configured');
    }

    const keywordString = Array.isArray(keywords) ? keywords.join(', ') : keywords;

    const prompt = `Generate an SEO-optimized, professional blog article based on the following keywords: ${keywordString}

${context ? `Additional context: ${context}` : ''}

Requirements:
- Article length: 1500-2000 words
- Include an engaging introduction
- Use proper heading structure (H2, H3)
- Include relevant paragraphs with good flow
- Add a conclusion
- Make it SEO-friendly and reader-friendly
- Use natural language, avoid keyword stuffing

Please provide the article in HTML format with proper tags.`;

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    );

    const article = response.data.content[0].text;

    return {
      success: true,
      content: article,
      model: response.data.model,
      usage: response.data.usage,
    };
  } catch (error) {
    console.error('Claude API Error:', error.message);
    throw new ApiError(500, `Failed to generate article: ${error.message}`);
  }
};

export const generateSeoMetadata = async (title, content) => {
  try {
    if (!CLAUDE_API_KEY) {
      throw new ApiError(500, 'Claude API key not configured');
    }

    const prompt = `Based on the following article title and content, generate SEO metadata:

Title: ${title}

Content: ${content.substring(0, 500)}...

Please provide in JSON format:
{
  "seoTitle": "SEO optimized title (max 60 chars)",
  "seoDescription": "Meta description (max 160 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    );

    const metadata = JSON.parse(response.data.content[0].text);
    return metadata;
  } catch (error) {
    console.error('SEO Metadata Generation Error:', error.message);
    // Return default metadata if generation fails
    return {
      seoTitle: title.substring(0, 60),
      seoDescription: `Read about ${title.substring(0, 150)}`,
      keywords: title.split(' ').slice(0, 3),
    };
  }
};

export default {
  generateArticleWithClaude,
  generateSeoMetadata,
};
