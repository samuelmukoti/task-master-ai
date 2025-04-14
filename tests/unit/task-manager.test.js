/**
 * Task Manager module tests
 */

import { jest } from '@jest/globals';
import { mockUtils, mockUI } from '../test-utils.js';

jest.mock('../../scripts/modules/utils.js', () => mockUtils);
jest.mock('../../scripts/modules/ui.js', () => mockUI);

describe('Task Manager Module', () => {
  let taskManager;
  
  beforeAll(async () => {
    taskManager = await import('../../scripts/modules/task-manager.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findNextTask', () => {
    test('should find the next available task', () => {
      const tasks = [
        { id: 1, status: 'done', dependencies: [] },
        { id: 2, status: 'pending', dependencies: [1] },
        { id: 3, status: 'pending', dependencies: [2] }
      ];

      const result = taskManager.findNextTask(tasks);
      expect(result).toBeDefined();
      expect(result.id).toBe(2);
    });

    test('should return null when no tasks are available', () => {
      const tasks = [
        { id: 1, status: 'done', dependencies: [] },
        { id: 2, status: 'done', dependencies: [1] }
      ];

      const result = taskManager.findNextTask(tasks);
      expect(result).toBeNull();
    });

    test('should handle circular dependencies', () => {
      const tasks = [
        { id: 1, status: 'pending', dependencies: [2] },
        { id: 2, status: 'pending', dependencies: [1] }
      ];

      const result = taskManager.findNextTask(tasks);
      expect(result).toBeNull();
    });
  });

  describe('validateTask', () => {
    test('should validate a well-formed task', () => {
      const task = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        dependencies: [],
        details: 'Test Details',
        testStrategy: 'Test Strategy'
      };

      expect(() => taskManager.validateTask(task)).not.toThrow();
    });

    test('should throw error for missing required fields', () => {
      const task = {
        id: 1,
        status: 'pending'
      };

      expect(() => taskManager.validateTask(task)).toThrow();
    });

    test('should validate task with subtasks', () => {
      const task = {
        id: 1,
        title: 'Parent Task',
        description: 'Parent Description',
        status: 'pending',
        dependencies: [],
        details: 'Parent Details',
        testStrategy: 'Parent Test Strategy',
        subtasks: [
          {
            id: 1,
            title: 'Subtask 1',
            description: 'Subtask Description',
            status: 'pending',
            dependencies: [],
            details: 'Subtask Details',
            testStrategy: 'Subtask Test Strategy'
          }
        ]
      };

      expect(() => taskManager.validateTask(task)).not.toThrow();
    });
  });

  describe('updateTaskStatus', () => {
    test('should update task status', () => {
      const tasks = [
        { id: 1, status: 'pending', dependencies: [] }
      ];

      const updatedTasks = taskManager.updateTaskStatus(tasks, 1, 'done');
      expect(updatedTasks[0].status).toBe('done');
    });

    test('should update subtask status', () => {
      const tasks = [
        {
          id: 1,
          status: 'pending',
          dependencies: [],
          subtasks: [
            { id: 1, status: 'pending', dependencies: [] }
          ]
        }
      ];

      const updatedTasks = taskManager.updateTaskStatus(tasks, '1.1', 'done');
      expect(updatedTasks[0].subtasks[0].status).toBe('done');
    });

    test('should throw error for invalid task ID', () => {
      const tasks = [
        { id: 1, status: 'pending', dependencies: [] }
      ];

      expect(() => taskManager.updateTaskStatus(tasks, 999, 'done')).toThrow();
    });
  });

  describe('validateDependencies', () => {
    test('should validate valid dependencies', () => {
      const tasks = [
        { id: 1, status: 'done', dependencies: [] },
        { id: 2, status: 'pending', dependencies: [1] }
      ];

      expect(() => taskManager.validateDependencies(tasks)).not.toThrow();
    });

    test('should throw error for circular dependencies', () => {
      const tasks = [
        { id: 1, status: 'pending', dependencies: [2] },
        { id: 2, status: 'pending', dependencies: [1] }
      ];

      expect(() => taskManager.validateDependencies(tasks)).toThrow();
    });

    test('should throw error for non-existent dependencies', () => {
      const tasks = [
        { id: 1, status: 'pending', dependencies: [999] }
      ];

      expect(() => taskManager.validateDependencies(tasks)).toThrow();
    });
  });
}); 