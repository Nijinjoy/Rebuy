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
  // Server path of the profile photo, e.g. /uploads/avatars/<file>.
  avatar_url?: string | null;
  // ISO timestamp from the backend's users.created_at.
  created_at?: string;
};
