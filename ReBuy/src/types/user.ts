export type SignUpDetails = {
  name: string;
  email: string;
  password: string;
};

export type User = {
  name: string;
  email: string;
  // Average of buyers' reviews, 1–5; missing until they've been reviewed.
  rating?: number;
};
