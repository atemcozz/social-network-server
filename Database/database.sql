create TABLE person(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  nickname VARCHAR(255) NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  UNIQUE (nickname)
);

create TABLE post(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES person (id)
);
create TABLE comment(
  id SERIAL PRIMARY KEY,
  body TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES person (id),
  FOREIGN KEY (post_id) REFERENCES post (id),
);
create TABLE post_like(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES person (id),
  FOREIGN KEY (post_id) REFERENCES post (id)
);
create TABLE comment_like(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  comment_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES person (id),
  FOREIGN KEY (comment_id) REFERENCES comment (id)
);
create TABLE token(
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES person (id)
);
