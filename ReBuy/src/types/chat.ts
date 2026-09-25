export type MessageImage = {
  uri: string;
  width: number;
  height: number;
};

export type Message = {
  id: string;
  // Empty when the message is only a photo.
  text: string;
  image?: MessageImage;
  fromMe: boolean;
  // Pre-formatted until messages have real timestamps.
  time: string;
};

export type Chat = {
  id: string;
  name: string;
  productTitle: string;
  productImage: string;
  // Whether the user is buying from, or selling to, this person.
  role: 'buying' | 'selling';
  // Oldest first.
  messages: Message[];
  unread: number;
};
