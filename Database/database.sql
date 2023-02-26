create TABLE IF NOT EXISTS person(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  nickname VARCHAR(255) NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(2048),
  UNIQUE (nickname)
);

create TABLE IF NOT EXISTS post(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  preview VARCHAR(255) NOT NULL,
  content TEXT,
  user_id INTEGER NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES person (id) ON DELETE CASCADE
);
create TABLE IF NOT EXISTS comment(
  id SERIAL PRIMARY KEY,
  body TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  belonging INTEGER,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES person (id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE,
  FOREIGN KEY (belonging) REFERENCES comment(id) ON DELETE CASCADE
);
create TABLE IF NOT EXISTS post_like(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES person (id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE
);
create TABLE IF NOT EXISTS comment_like(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  comment_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES person (id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comment (id) ON DELETE CASCADE
);
create TABLE IF NOT EXISTS token(
  id SERIAL PRIMARY KEY,
  refresh_token TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES person (id) ON DELETE CASCADE
);
-- create TABLE IF NOT EXISTS post_media(
--   id SERIAL PRIMARY KEY,
--   type VARCHAR(255) NOT NULL, 
--   url VARCHAR(2048) NOT NULL, 
--   post_id INTEGER NOT NULL,
--   FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE
-- );
create table if not exists post_tag(
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  tag VARCHAR(255) NOT NULL,
  FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE
);
-- create table if not exists post_geo(
--   id SERIAL PRIMARY KEY,
--   post_id INTEGER NOT NULL,
--   lat double precision not null,
--   lng double precision not null,
--   FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE
-- );

create TABLE IF NOT EXISTS bookmark(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES person (id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE
);