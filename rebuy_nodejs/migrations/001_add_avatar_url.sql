-- Profile photo path, e.g. /uploads/avatars/<file>. NULL until one is uploaded.
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
