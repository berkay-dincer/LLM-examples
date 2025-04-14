import { UserContext, ContextRequest, ContextResponse } from './types';

class ContextManager {
  private contexts: Map<string, UserContext>;

  constructor() {
    this.contexts = new Map();
  }

  private createDefaultContext(userId: string): UserContext {
    return {
      userId,
      preferences: {
        language: 'en',
        tone: 'professional',
        interests: []
      },
      conversationHistory: []
    };
  }

  public handleRequest(request: ContextRequest): ContextResponse {
    try {
      switch (request.action) {
        case 'get':
          return this.getContext(request.userId);
        case 'update':
          return this.updateContext(request.userId, request.data);
        case 'clear':
          return this.clearContext(request.userId);
        default:
          return {
            success: false,
            message: 'Invalid action'
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private getContext(userId: string): ContextResponse {
    const context = this.contexts.get(userId) || this.createDefaultContext(userId);
    return {
      success: true,
      message: 'Context retrieved successfully',
      data: context
    };
  }

  private updateContext(userId: string, data?: Partial<UserContext>): ContextResponse {
    const existingContext = this.contexts.get(userId) || this.createDefaultContext(userId);
    const updatedContext = {
      ...existingContext,
      ...data,
      preferences: {
        ...existingContext.preferences,
        ...data?.preferences
      }
    };
    
    this.contexts.set(userId, updatedContext);
    
    return {
      success: true,
      message: 'Context updated successfully',
      data: updatedContext
    };
  }

  private clearContext(userId: string): ContextResponse {
    this.contexts.delete(userId);
    return {
      success: true,
      message: 'Context cleared successfully'
    };
  }
}

export const contextManager = new ContextManager(); 