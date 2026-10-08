-- titles.merged_into 自引用外键的索引：没有它，删除或改动一行作品时要扫整张表找引用它的合并行
--（切换前重导时删 2000 行就超出 D1 的 CPU 限制）。也用于按规范编号找并入的旧编号。
CREATE INDEX IF NOT EXISTS ix_titles_merged ON titles (merged_into) WHERE merged_into IS NOT NULL;
