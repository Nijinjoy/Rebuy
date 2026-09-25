import type { Chat } from '../types/chat';

// Temporary conversations until the chat API exists.
export const SAMPLE_CHATS: Chat[] = [
  {
    id: 'c1',
    name: 'Omar Haddad',
    productTitle: 'iPhone 13 Pro, 256 GB',
    productImage:
      'https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/1.webp',
    role: 'buying',
    messages: [
      {
        id: 'm1',
        fromMe: true,
        time: '10:15',
        text: 'Hi Omar, is the iPhone still available?',
      },
      { id: 'm2', fromMe: false, time: '10:20', text: 'Hi! Yes, it is.' },
      {
        id: 'm3',
        fromMe: true,
        time: '10:21',
        text: 'Is the battery still good?',
      },
      {
        id: 'm4',
        fromMe: false,
        time: '10:24',
        text: 'Yes, battery health is 91%.',
      },
    ],
    unread: 2,
  },
  {
    id: 'c2',
    name: 'Sara Al Mansoori',
    productTitle: 'Bedside table, African cherry',
    productImage:
      'https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/1.webp',
    role: 'selling',
    messages: [
      {
        id: 'm1',
        fromMe: false,
        time: '08:55',
        text: 'Hello, I love the bedside table. Any scratches?',
      },
      {
        id: 'm2',
        fromMe: true,
        time: '08:58',
        text: 'None on top, just a small mark on the back panel.',
      },
      {
        id: 'm3',
        fromMe: false,
        time: '09:02',
        text: 'Can you do AED 180 if I pick it up today?',
      },
    ],
    unread: 1,
  },
  {
    id: 'c3',
    name: 'James Carter',
    productTitle: 'Apple AirPods, 2nd generation',
    productImage:
      'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/1.webp',
    role: 'buying',
    messages: [
      {
        id: 'm1',
        fromMe: false,
        time: 'Yesterday',
        text: 'I can meet at Dubai Mall after work.',
      },
      {
        id: 'm2',
        fromMe: true,
        time: 'Yesterday',
        text: 'Great, see you at the mall entrance at 6.',
      },
    ],
    unread: 0,
  },
  {
    id: 'c4',
    name: 'Fatima Noor',
    productTitle: 'Apple Watch Series 4, Gold',
    productImage:
      'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/1.webp',
    role: 'selling',
    messages: [
      {
        id: 'm1',
        fromMe: false,
        time: 'Mon',
        text: 'Does it come with the original box?',
      },
    ],
    unread: 0,
  },
  {
    id: 'c5',
    name: 'Ravi Menon',
    productTitle: 'iPhone X, 64 GB',
    productImage:
      'https://cdn.dummyjson.com/product-images/smartphones/iphone-x/1.webp',
    role: 'buying',
    messages: [
      {
        id: 'm1',
        fromMe: false,
        time: '12 Sep',
        text: 'Sorry, someone else has reserved it.',
      },
      {
        id: 'm2',
        fromMe: true,
        time: '12 Sep',
        text: 'Thanks, I found one elsewhere.',
      },
    ],
    unread: 0,
  },
];
