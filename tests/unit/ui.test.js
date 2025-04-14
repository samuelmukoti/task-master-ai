/**
 * UI module tests
 */

import { jest } from '@jest/globals';
import { mockUtils } from '../test-utils.js';

jest.mock('../../scripts/modules/utils.js', () => mockUtils);

describe('UI Module', () => {
  let ui;
  
  beforeAll(async () => {
    ui = await import('../../scripts/modules/ui.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startLoadingIndicator', () => {
    test('should return a loading indicator instance', () => {
      const loader = ui.startLoadingIndicator('Loading...');
      expect(loader).toBeDefined();
    });
  });

  describe('stopLoadingIndicator', () => {
    test('should stop the loading indicator', () => {
      const loader = ui.startLoadingIndicator('Loading...');
      expect(() => ui.stopLoadingIndicator(loader)).not.toThrow();
    });
  });

  describe('displayTaskList', () => {
    test('should format and display task list', () => {
      const tasks = [
        {
          id: 1,
          title: 'Test Task',
          status: 'pending',
          dependencies: []
        }
      ];
      
      expect(() => ui.displayTaskList(tasks)).not.toThrow();
    });

    test('should handle empty task list', () => {
      expect(() => ui.displayTaskList([])).not.toThrow();
    });
  });

  describe('displayTask', () => {
    test('should format and display single task', () => {
      const task = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        dependencies: [],
        details: 'Test Details',
        testStrategy: 'Test Strategy'
      };
      
      expect(() => ui.displayTask(task)).not.toThrow();
    });

    test('should handle task with subtasks', () => {
      const task = {
        id: 1,
        title: 'Parent Task',
        status: 'pending',
        dependencies: [],
        subtasks: [
          {
            id: 1,
            title: 'Subtask 1',
            status: 'pending',
            dependencies: []
          }
        ]
      };
      
      expect(() => ui.displayTask(task)).not.toThrow();
    });
  });
}); 