/**
 * Shared test utilities and mocks
 */

import { jest } from '@jest/globals';

// Create a mock log function we can check later
export const mockLog = jest.fn();

// Mock configuration
export const mockConfig = {
  model: 'claude-3-sonnet-20240229',
  temperature: 0.7,
  maxTokens: 4000,
  geminiModel: 'gemini-pro',
  debug: false,
  logLevel: 'info',
  defaultSubtasks: 3,
  defaultPriority: 'medium',
  projectName: 'Test Project',
  projectVersion: '1.0.0'
};

// Mock utils module
export const mockUtils = {
  CONFIG: mockConfig,
  log: mockLog,
  sanitizePrompt: jest.fn(text => text),
  readJSON: jest.fn(),
  writeJSON: jest.fn(),
  taskExists: jest.fn(),
  findTaskById: jest.fn(),
};

// Mock UI module
export const mockUI = {
  startLoadingIndicator: jest.fn().mockReturnValue('mockLoader'),
  stopLoadingIndicator: jest.fn(),
};

// Setup environment variables for testing
export function setupTestEnv() {
  const originalEnv = process.env;
  process.env = { ...originalEnv };
  process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
  process.env.PERPLEXITY_API_KEY = 'test-perplexity-key';
  process.env.GEMINI_API_KEY = 'test-gemini-key';
  return originalEnv;
}

// Mock AI service clients
export const mockAIClients = {
  // Anthropic mock
  anthropic: {
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ text: 'AI response' }],
      }),
    },
  },

  // OpenAI mock
  openai: {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Perplexity response' } }],
        }),
      },
    },
  },

  // Gemini mock
  gemini: {
    generateContent: jest.fn().mockResolvedValue({
      response: {
        text: () => 'Gemini response'
      }
    }),
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => 'Gemini response'
        }
      })
    })
  }
}; 