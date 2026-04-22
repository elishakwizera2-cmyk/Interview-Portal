export type Role = 'Finance Officer' | 'Content Creator';
export type Language = 'English' | 'French';

export interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: number;
}

export interface InterviewState {
  step: 'welcome' | 'language_selection' | 'role_selection' | 'interviewing' | 'feedback';
  selectedRole: Role | null;
  selectedLanguage: Language | null;
  messages: Message[];
  isThinking: boolean;
}
