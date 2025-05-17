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
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
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
      res.json(response.data);
    } catch (error) {
      console.error('Groq API error:', error.response?.data || error.message);
      res.status(500).json({
        error: 'AI service error',
        details: error.response?.data || error.message
      });
    }
  },

  // Streaming chat completion
  streamCompletion: async (req, res) => {
    try {
      const { messages } = req.body;

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
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

      // Pipe Groq stream to client
      response.data.on('data', chunk => {
        res.write(`data: ${chunk.toString()}\n\n`);
      });

      response.data.on('end', () => {
        res.end();
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