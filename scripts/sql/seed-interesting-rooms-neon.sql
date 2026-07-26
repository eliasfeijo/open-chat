-- Seed interesting public rooms for a real owner user.
-- Usage in Neon SQL Editor:
-- 1) Replace REPLACE_WITH_YOUR_AUTH_USER_ID with your auth_users.id value.
-- 2) Run the full script.
-- 3) Re-running is safe: rooms are upserted and tags are refreshed for seeded rooms.

BEGIN;

SELECT set_config(
  'app.seed_owner_user_id',
  'REPLACE_WITH_YOUR_AUTH_USER_ID',
  false
);

DO $$
DECLARE
  seed_owner_user_id text := current_setting('app.seed_owner_user_id');
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth_users WHERE id = seed_owner_user_id
  ) THEN
    RAISE EXCEPTION
      'Owner user id % was not found in auth_users. Use your real auth user id.',
      seed_owner_user_id;
  END IF;

  INSERT INTO users (id)
  VALUES (seed_owner_user_id)
  ON CONFLICT (id) DO NOTHING;
END
$$;

WITH seed_rooms AS (
  SELECT *
  FROM (
    VALUES
      (
        'golang-systems',
        'Golang Systems Club',
        'Reliable backend systems with Go',
        'Discuss production Go services, observability, and practical architecture trade-offs.'
      ),
      (
        'linux-homelab',
        'Linux Homelab',
        'Self-hosting, containers, and server tinkering',
        'From old laptops to mini racks: share setups, automation scripts, and hard-earned lessons.'
      ),
      (
        'movies-after-midnight',
        'Movies After Midnight',
        'Film club for late-night discussions',
        'A room for people who watch closely and want to talk about direction, writing, and endings.'
      ),
      (
        'photo-walks',
        'Photo Walks',
        'Street, portrait, and travel photography',
        'Share framing decisions, editing workflows, and weekly photo prompts from your city.'
      ),
      (
        'indie-makers-journal',
        'Indie Makers Journal',
        'Build in public with honest weekly updates',
        'A room for solo builders sharing progress, setbacks, launches, and growth experiments.'
      ),
      (
        'brazil-tech-radar',
        'Brazil Tech Radar',
        'Brazilian tech ecosystem and opportunities',
        'Talk startups, remote jobs, community events, and what is moving in Brazil tech this week.'
      ),
      (
        'books-and-ideas',
        'Books and Ideas',
        'Nonfiction reading and discussion',
        'Bring one idea from a book and debate how it applies to product, work, or daily life.'
      ),
      (
        'design-critiques-live',
        'Design Critiques Live',
        'UI and UX feedback with practical suggestions',
        'Post real interfaces and get clear, respectful critique on clarity, hierarchy, and flow.'
      ),
      (
        'founder-operator-hour',
        'Founder Operator Hour',
        'Execution, prioritization, and team decisions',
        'For founders and operators comparing playbooks for product bets, hiring, and focus.'
      ),
      (
        'open-source-maintainers',
        'Open Source Maintainers',
        'Sustainable OSS workflows and contributor experience',
        'Discuss triage, docs, release habits, and how to keep projects healthy for the long run.'
      )
  ) AS t(slug, name, topic, description)
),
upserted_rooms AS (
  INSERT INTO rooms (owner_user_id, slug, name, topic, description)
  SELECT
    current_setting('app.seed_owner_user_id'),
    sr.slug,
    sr.name,
    sr.topic,
    sr.description
  FROM seed_rooms sr
  ON CONFLICT (slug)
  DO UPDATE SET
    name = EXCLUDED.name,
    topic = EXCLUDED.topic,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id, slug
),
owner_memberships AS (
  INSERT INTO room_members (room_id, user_id, role)
  SELECT
    ur.id,
    current_setting('app.seed_owner_user_id'),
    'owner'::room_member_role
  FROM upserted_rooms ur
  ON CONFLICT (room_id, user_id)
  DO UPDATE SET role = EXCLUDED.role
  RETURNING room_id
),
seed_room_tag_sets AS (
  SELECT *
  FROM (
    VALUES
      ('golang-systems', ARRAY['golang', 'backend', 'architecture']::text[]),
      ('linux-homelab', ARRAY['linux', 'devops', 'docker', 'selfhosting']::text[]),
      ('movies-after-midnight', ARRAY['movies', 'culture', 'discussion']::text[]),
      ('photo-walks', ARRAY['photography', 'creative', 'community']::text[]),
      ('indie-makers-journal', ARRAY['startups', 'indiehackers', 'product']::text[]),
      ('brazil-tech-radar', ARRAY['brazil', 'startups', 'careers']::text[]),
      ('books-and-ideas', ARRAY['books', 'learning', 'discussion']::text[]),
      ('design-critiques-live', ARRAY['design', 'ux', 'feedback']::text[]),
      ('founder-operator-hour', ARRAY['founders', 'operations', 'leadership']::text[]),
      ('open-source-maintainers', ARRAY['opensource', 'engineering', 'community']::text[])
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

SELECT
  current_setting('app.seed_owner_user_id') AS owner_user_id,
  count(*) FILTER (WHERE r.slug IN (
    'golang-systems',
    'linux-homelab',
    'movies-after-midnight',
    'photo-walks',
    'indie-makers-journal',
    'brazil-tech-radar',
    'books-and-ideas',
    'design-critiques-live',
    'founder-operator-hour',
    'open-source-maintainers'
  )) AS seeded_room_count
FROM rooms r;