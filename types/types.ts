
export enum UserRole {
  STUDENT = 'STUDENT',
  TUTOR = 'TUTOR'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  institution: string;
  major: string;
  rating: number;
  bio: string;
  subjects: string[];
  isVerified: boolean;
}

export interface Session {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  topic: string;
  notes?: string;
  summary?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  unreadCount: number;
}
