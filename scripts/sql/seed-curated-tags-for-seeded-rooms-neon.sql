-- Curated tags for previously seeded rooms.
-- Usage in Neon SQL Editor:
-- 1) Replace REPLACE_WITH_YOUR_AUTH_USER_ID with your auth_users.id.
-- 2) Run the full script.
-- 3) Re-running is safe: this script refreshes tags for the target rooms.

BEGIN;

SELECT set_config(
  'app.seed_owner_user_id',
  'REPLACE_WITH_YOUR_AUTH_USER_ID',
  false
);

DO $$
DECLARE
  seed_owner_user_id text := current_setting('app.seed_owner_user_id');
  missing_or_not_owned_count integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth_users WHERE id = seed_owner_user_id
  ) THEN
    RAISE EXCEPTION
      'Owner user id % was not found in auth_users. Use your real auth user id.',
      seed_owner_user_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = seed_owner_user_id
  ) THEN
    RAISE EXCEPTION
      'Owner user id % does not exist in users. Run the room seed script first.',
      seed_owner_user_id;
  END IF;

  WITH target_rooms AS (
    SELECT *
    FROM (
      VALUES
        ('golang-systems'),
        ('linux-homelab'),
        ('movies-after-midnight'),
        ('photo-walks'),
        ('indie-makers-journal'),
        ('brazil-tech-radar'),
        ('books-and-ideas'),
        ('design-critiques-live'),
        ('founder-operator-hour'),
        ('open-source-maintainers')
    ) AS t(slug)
  )
  SELECT count(*)
  INTO missing_or_not_owned_count
  FROM target_rooms tr
  LEFT JOIN rooms r ON r.slug = tr.slug
  WHERE r.id IS NULL OR r.owner_user_id <> seed_owner_user_id;

  IF missing_or_not_owned_count > 0 THEN
    RAISE EXCEPTION
      'One or more target rooms are missing or not owned by user id %. Check room seed and owner id.',
      seed_owner_user_id;
  END IF;
END
$$;

WITH seed_room_tag_sets AS (
  SELECT *
  FROM (
    VALUES
      ('golang-systems', ARRAY['golang', 'backend', 'distributed-systems', 'observability', 'performance']::text[]),
      ('linux-homelab', ARRAY['linux', 'self-hosting', 'docker', 'networking', 'automation']::text[]),
      ('movies-after-midnight', ARRAY['cinema', 'film-analysis', 'screenwriting', 'directing', 'soundtrack']::text[]),
      ('photo-walks', ARRAY['photography', 'street-photo', 'composition', 'editing', 'light']::text[]),
      ('indie-makers-journal', ARRAY['build-in-public', 'indiehackers', 'product', 'launches', 'growth']::text[]),
      ('brazil-tech-radar', ARRAY['brazil', 'startups', 'remote-work', 'engineering', 'careers']::text[]),
      ('books-and-ideas', ARRAY['books', 'nonfiction', 'learning', 'critical-thinking', 'discussion']::text[]),
      ('design-critiques-live', ARRAY['design', 'ux', 'ui', 'feedback', 'product-design']::text[]),
      ('founder-operator-hour', ARRAY['founders', 'operations', 'leadership', 'execution', 'strategy']::text[]),
      ('open-source-maintainers', ARRAY['opensource', 'maintainers', 'developer-experience', 'documentation', 'releases']::text[])
  ) AS t(room_slug, tag_slugs)
),
seed_room_tags AS (
  SELECT
    srt.room_slug,
    unnest(srt.tag_slugs) AS tag_slug
  FROM seed_room_tag_sets srt
),
upserted_tags AS (
  INSERT INTO tags (slug, name)
  SELECT DISTINCT
    srt.tag_slug,
    srt.tag_slug
  FROM seed_room_tags srt
  ON CONFLICT (slug)
  DO UPDATE SET name = EXCLUDED.name
  RETURNING id, slug
),
resolved_tags AS (
  SELECT
    t.id,
    t.slug
  FROM tags t
  INNER JOIN (
    SELECT DISTINCT tag_slug FROM seed_room_tags
  ) seeded ON seeded.tag_slug = t.slug
),
cleared_room_tags AS (
  DELETE FROM room_tags rt
  USING rooms r
  INNER JOIN seed_room_tag_sets srt ON srt.room_slug = r.slug
  WHERE rt.room_id = r.id
  RETURNING rt.room_id
)
INSERT INTO room_tags (room_id, tag_id)
SELECT
  r.id,
  rt.id
FROM seed_room_tags srt
INNER JOIN rooms r ON r.slug = srt.room_slug
INNER JOIN resolved_tags rt ON rt.slug = srt.tag_slug
ON CONFLICT (room_id, tag_id) DO NOTHING;

COMMIT;

WITH target_rooms AS (
  SELECT *
  FROM (
    VALUES
      ('golang-systems'),
      ('linux-homelab'),
      ('movies-after-midnight'),
      ('photo-walks'),
      ('indie-makers-journal'),
      ('brazil-tech-radar'),
      ('books-and-ideas'),
      ('design-critiques-live'),
      ('founder-operator-hour'),
      ('open-source-maintainers')
  ) AS t(slug)
)
SELECT
  r.slug,
  r.name,
  array_agg(t.slug ORDER BY t.slug) AS tags
FROM rooms r
INNER JOIN target_rooms tr ON tr.slug = r.slug
LEFT JOIN room_tags rt ON rt.room_id = r.id
LEFT JOIN tags t ON t.id = rt.tag_id
GROUP BY r.slug, r.name
ORDER BY r.slug;