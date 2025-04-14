/**
 * AI Services module tests
 */

import { jest } from '@jest/globals';
import { mockLog, mockUtils, mockUI, setupTestEnv, mockAIClients } from '../test-utils.js';

// Mock dependencies
jest.mock('@anthropic-ai/sdk', () => {
  const mockCreate = jest.fn().mockResolvedValue({
    content: [{ text: 'AI response' }],
  });
  const mockAnthropicInstance = {
    messages: {
      create: mockCreate
    }
  };
  const mockAnthropicConstructor = jest.fn().mockImplementation(() => mockAnthropicInstance);
  return {
    Anthropic: mockAnthropicConstructor
  };
});

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: () => mockAIClients.gemini
    }))
  };
});

jest.mock('openai', () => {
  return { default: jest.fn().mockImplementation(() => mockAIClients.openai) };
});

jest.mock('../../scripts/modules/utils.js', () => mockUtils);
jest.mock('../../scripts/modules/ui.js', () => mockUI);

// Store original env
const originalEnv = process.env;

describe('AI Services Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = setupTestEnv();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getPrimaryAIClient function', () => {
    let getPrimaryAIClient;
    
    beforeAll(async () => {
      const module = await import('../../scripts/modules/ai-services.js');
      getPrimaryAIClient = module.getPrimaryAIClient;
    });

    test('should return Gemini client when GEMINI_API_KEY is available', () => {
      const result = getPrimaryAIClient();
      expect(result.type).toBe('gemini');
      expect(result.client).toBeDefined();
    });

    test('should return Anthropic client when only ANTHROPIC_API_KEY is available', () => {
      delete process.env.GEMINI_API_KEY;
      const result = getPrimaryAIClient();
      expect(result.type).toBe('anthropic');
      expect(result.client).toBeDefined();
    });

    test('should throw error when no API keys are available', () => {
      delete process.env.GEMINI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;
      expect(() => getPrimaryAIClient()).toThrow('No AI clients available');
    });
  });

  describe('handleStreamingRequest function', () => {
    let handleStreamingRequest;
    
    beforeAll(async () => {
      const module = await import('../../scripts/modules/ai-services.js');
      handleStreamingRequest = module.handleStreamingRequest;
    });

    test('should use Gemini when available', async () => {
      const result = await handleStreamingRequest(
        'Test PRD content',
        'test.txt',
        3,
        4000,
        'Test system prompt'
      );
      
      expect(result).toBeDefined();
      expect(mockAIClients.gemini.generateContent).toHaveBeenCalled();
    });

    test('should fall back to Claude when Gemini not available', async () => {
      delete process.env.GEMINI_API_KEY;
      
      const result = await handleStreamingRequest(
        'Test PRD content',
        'test.txt',
        3,
        4000,
        'Test system prompt'
      );
      
      expect(result).toBeDefined();
      expect(mockAIClients.anthropic.messages.create).toHaveBeenCalled();
    });

    test('should handle Gemini errors appropriately', async () => {
      const mockError = new Error('Gemini API error');
      mockAIClients.gemini.generateContent.mockRejectedValueOnce(mockError);
      
      await expect(handleStreamingRequest(
        'Test PRD content',
        'test.txt',
        3,
        4000,
        'Test system prompt'
      )).rejects.toThrow();
      
      expect(mockLog).toHaveBeenCalledWith('error', expect.any(String));
    });
  });

  describe('parseSubtasksFromText function', () => {
    test('should parse subtasks from JSON text', () => {
      const jsonText = `[
        {
          "id": 1,
          "title": "First subtask",
          "description": "Test description",
          "dependencies": [],
          "details": "Test details"
        }
      ]`;

      const result = parseSubtasksFromText(jsonText, 1, 1, 5);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        title: "First subtask",
        description: "Test description",
        dependencies: [],
        details: "Test details",
        status: "pending",
        parentTaskId: 5
      });
    });

    test('should create fallback subtasks for invalid JSON', () => {
      const text = `This is not valid JSON and cannot be parsed`;

      const result = parseSubtasksFromText(text, 1, 2, 5);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 1,
        title: 'Subtask 1',
        description: 'Auto-generated fallback subtask',
        status: 'pending',
        dependencies: [],
        parentTaskId: 5
      });
      expect(result[1]).toMatchObject({
        id: 2,
        title: 'Subtask 2',
        description: 'Auto-generated fallback subtask',
        status: 'pending',
        dependencies: [],
        parentTaskId: 5
      });
    });
  });
}); 