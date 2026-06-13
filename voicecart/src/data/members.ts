import { Member } from '@/types';

export const defaultMembers: Member[] = [
  {
    id: 'm1',
    name: 'You',
    avatar: '👤',
    role: 'creator',
    diet: 'non-veg',
    allergies: [],
    favoriteBrands: [],
    dislikes: [],
    isOnline: true,
    isTyping: false,
  },
];

export const currentUserId = 'm1';
