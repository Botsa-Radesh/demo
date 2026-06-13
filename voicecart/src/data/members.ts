import { Member } from '@/types';

export const defaultMembers: Member[] = [
  {
    id: 'm1',
    name: 'Rahul',
    avatar: '👨‍💻',
    role: 'creator',
    diet: 'non-veg',
    allergies: [],
    favoriteBrands: ['Amul', 'Tata'],
    dislikes: ['Coriander'],
    isOnline: true,
    isTyping: false,
  },
  {
    id: 'm2',
    name: 'Priya',
    avatar: '👩‍🍳',
    role: 'member',
    diet: 'veg',
    allergies: ['Dairy', 'Peanuts'],
    favoriteBrands: ['Mother Dairy'],
    dislikes: ['Mushroom'],
    isOnline: true,
    isTyping: false,
  },
  {
    id: 'm3',
    name: 'Amit',
    avatar: '👨‍🎓',
    role: 'member',
    diet: 'non-veg',
    allergies: [],
    favoriteBrands: ['Maggi', 'Coca-Cola'],
    dislikes: ['Okra'],
    isOnline: false,
    isTyping: false,
  },
];

export const currentUserId = 'm1';
