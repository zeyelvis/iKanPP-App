-- 作品的题材（titles.genres 展开），带热度并按 (题材, 热度) 建索引：「同题材推荐」每次只读几行，
-- 不用扫整张 titles。由导入与入库时同步维护。
CREATE TABLE title_genres (
  genre      TEXT NOT NULL,
  title_id   INTEGER NOT NULL REFERENCES titles(id),
  kind       TEXT,
  popularity REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (genre, title_id)
);
CREATE INDEX ix_title_genres_hot ON title_genres (genre, popularity DESC);
CREATE INDEX ix_title_genres_title ON title_genres (title_id);
