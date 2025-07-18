const axios = require('axios');
const AiConversation = require('../models/AiConversation');
require('dotenv').config();

const aiController = {
  // Get user's conversation history
  getConversation: async (req, res) => {
    try {
      const conversation = await AiConversation.findOne({ userId: req.userId });
      res.json(conversation || { messages: [] });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ error: 'Failed to load conversation' });
    }
  },

  // Save a message to conversation history
  // Updated saveMessage function
  saveMessage: async (req, res) => {
    try {
      const { role, content } = req.body;

      // Add validation
      if (!role || !content) {
        return res.status(400).json({
          error: 'Both role and content are required',
          received: req.body // For debugging
        });
      }

      // Validate role enum
      const validRoles = ['system', 'user', 'assistant'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
        });
      }

      const conversation = await AiConversation.findOneAndUpdate(
        { userId: req.userId },
        {
          $push: {
            messages: {
              role,
              content,
              timestamp: new Date()
            }
          },
          $set: { lastUpdated: new Date() }
        },
        { new: true, upsert: true }
      );

      res.json(conversation);
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({
        error: 'Failed to save message',
        details: error.message
      });
    }
  },

  // Regular chat completion
chatCompletion: async (req, res) => {
    try {
      const { messages } = req.body;
      const userId = req.userId;

      // Save user's last message first
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        await AiConversation.findOneAndUpdate(
          { userId },
          {
            $push: {
              messages: {
                role: lastMessage.role,
                content: lastMessage.content,
                timestamp: new Date()
              }
            },
            $set: { lastUpdated: new Date() }
          },
          { upsert: true }
        );
      }

      const response = await axios.post(
        process.env.GROK_API,
        {
          model: 'llama3-70b-8192',
          messages,
          temperature: 0.7,
          max_tokens: 1024
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Save AI's response
      if (response.data.choices && response.data.choices[0].message) {
        const aiMessage = response.data.choices[0].message;
        await AiConversation.findOneAndUpdate(
          { userId },
          {
            $push: {
              messages: {
                role: aiMessage.role,
                content: aiMessage.content,
                timestamp: new Date()
              }
            },
            $set: { lastUpdated: new Date() }
          },
          { upsert: true }
        );
      }

      res.json(response.data);
    } catch (error) {
      console.error('Groq API error:', error.response?.data || error.message);
      res.status(500).json({
        error: 'AI service error',
        details: error.response?.data || error.message
      });
    }
  },

// Streaming chat completion with automatic saving
streamCompletion: async (req, res) => {
    try {
        const { messages } = req.body;
        const userId = req.userId;
        let fullResponse = '';
        let buffer = '';

        // Save user's last message first
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'user') {
            await AiConversation.findOneAndUpdate(
                { userId },
                {
                    $push: {
                        messages: {
                            role: lastMessage.role,
                            content: lastMessage.content,
                            timestamp: new Date()
                        }
                    },
                    $set: { lastUpdated: new Date() }
                },
                { upsert: true }
            );
        }

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const response = await axios.post(
            process.env.GROK_API,
            {
                model: 'llama3-70b-8192',
                messages,
                temperature: 0.7,
                max_tokens: 1024,
                stream: true
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'stream'
            }
        );

        // Process streaming response
        response.data.on('data', chunk => {
            try {
                buffer += chunk.toString();
                
                // Process complete lines only
                let boundary;
                while ((boundary = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.substring(0, boundary).trim();
                    buffer = buffer.substring(boundary + 1);
                    
                    if (!line.startsWith('data:')) continue;
                    if (line.includes('[DONE]')) continue;
                    
                    try {
                        const jsonStr = line.substring(5).trim();
                        if (jsonStr) {
                            const data = JSON.parse(jsonStr);
                            if (data.choices?.[0]?.delta?.content) {
                                const content = data.choices[0].delta.content;
                                fullResponse += content;
                                res.write(`data: ${JSON.stringify({ content })}\n\n`);
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing JSON line:', e);
                    }
                }
            } catch (e) {
                console.error('Error processing stream chunk:', e);
            }
        });

        response.data.on('end', async () => {
            // Save the complete AI response
            if (fullResponse) {
                await AiConversation.findOneAndUpdate(
                    { userId },
                    {
                        $push: {
                            messages: {
                                role: 'assistant',
                                content: fullResponse,
                                timestamp: new Date()
                            }
                        },
                        $set: { lastUpdated: new Date() }
                    },
                    { upsert: true }
                );
            }
            res.write('data: [DONE]\n\n');
            res.end();
        });

        response.data.on('error', err => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Stream error',
                    details: err.message
                });
            }
        });

        req.on('close', () => {
            response.data.destroy();
        });

    } catch (error) {
        console.error('Streaming error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Stream initialization failed',
                details: error.message
            });
        }
    }
}

};

module.exports = aiController;