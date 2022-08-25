create TABLE IF NOT EXISTS person(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  nickname VARCHAR(255) NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  avatarURL VARCHAR(255),
  UNIQUE (nickname)
);

create TABLE IF NOT EXISTS post(
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES person (id)
);
create TABLE IF NOT EXISTS comment(
  id SERIAL PRIMARY KEY,
  body TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES person (id),
  FOREIGN KEY (post_id) REFERENCES post (id),
);
create TABLE IF NOT EXISTS post_like(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES person (id),
  FOREIGN KEY (post_id) REFERENCES post (id)
);
create TABLE IF NOT EXISTS comment_like(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  comment_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES person (id),
  FOREIGN KEY (comment_id) REFERENCES comment (id)
);
create TABLE IF NOT EXISTS token(
  id SERIAL PRIMARY KEY,
  refresh_token TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES person (id)
);
create TABLE IF NOT EXISTS post_media(
  id SERIAL PRIMARY KEY,
  type VARCHAR(255) NOT NULL, 
  url VARCHAR(2048) NOT NULL, 
  post_id INTEGER NOT NULL,
  FOREIGN KEY (post_id) REFERENCES post (id)
);
