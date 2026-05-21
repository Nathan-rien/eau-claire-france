UPDATE blog_articles
SET content_md = regexp_replace(content_md, '\s*\(\s*[Ss]ources?\s*\d+(\s*(,|et)\s*\d+)*\s*\)', '', 'g')
WHERE content_md ~ '\([Ss]ources?\s*\d';