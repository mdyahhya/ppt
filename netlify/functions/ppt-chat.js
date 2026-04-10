exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages, systemPrompt } = JSON.parse(event.body);
    const API_KEY = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;

    if (!API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API Key not configured in Netlify environment variables' })
      };
    }

    // Using Groq or OpenAI compatible endpoint
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // High quality, fast model
        messages: [
          { role: 'system', content: systemPrompt || 'You are a professional presentation expert.' },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'AI API Error');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reply: data.choices[0].message.content
      })
    };
  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
