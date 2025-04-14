export interface UserContext {
  userId: string;
  preferences: {
    language: string;
    tone: 'formal' | 'casual' | 'professional';
    interests: string[];
  };
  conversationHistory: {
    timestamp: string;
    message: string;
    response: string;
  }[];
}

export interface ContextRequest {
  userId: string;
  action: 'get' | 'update' | 'clear';
  data?: Partial<UserContext>;
}

export interface ContextResponse {
  success: boolean;
  message: string;
  data?: UserContext;
} 