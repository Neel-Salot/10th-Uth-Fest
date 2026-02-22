import { supabase } from './supabase';
import { eventsToSeed } from './seedEvents';

type ExistingEventRow = {
  id: string;
  name: string;
};

const normalizeEventName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\bsolo\b|\bgroup\b/g, ' ')
    .replace(/[+()]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const aliasToCanonicalName: Record<string, string> = {
  'classical dance': 'Classical Dance',
  'utu best dancer': 'UTU Best Dancer',
  'folk tribal dance': 'Folk/Tribal Dance',
  'free style contemporary bollywood dance': 'Free Style/Contemporary/Bollywood Dance',
  'light indian vocal': 'Light Indian Vocal',
  'western vocal': 'Western Vocal',
  'bollywood filmy vocal': 'Bollywood/Filmy Vocal',
  'indian song': 'Indian Song',
  'mono acting': 'Mono-Acting',
  mimicry: 'Mimicry',
  mime: 'Mime',
  skit: 'Skit',
  'one act play drama': 'One-Act-Play / Drama',
  'short film making': 'Short Film Making',
  elocution: 'Elocution',
  'poem recitation': 'Poem Recitation',
  quiz: 'Quiz',
  debate: 'Debate',
  'poster making': 'Poster Making',
  'on the spot painting': 'On the Spot Painting',
  cartooning: 'Cartooning',
  collage: 'Collage',
  'clay modelling': 'Clay Modelling',
  rangoli: 'Rangoli',
  mehndi: 'Mehndi',
  'fashion show': 'Fashion Show',
  'uth icon 1 male and 1 female': 'Uth Icon [1 Male and 1 Female]',
  'show reels': 'Show Reels',
};

const canonicalByName = new Map(eventsToSeed.map((event) => [event.name, event]));

const findCanonicalRule = (rawName: string) => {
  const normalized = normalizeEventName(rawName);
  const aliasMatch = aliasToCanonicalName[normalized];
  if (aliasMatch) return canonicalByName.get(aliasMatch) || null;

  for (const event of eventsToSeed) {
    if (normalizeEventName(event.name) === normalized) return event;
  }

  return null;
};

export const syncOfficialEventRules = async () => {
  const { data: existingRows, error: fetchError } = await supabase
    .from('events')
    .select('id,name')
    .order('name', { ascending: true });

  if (fetchError) throw fetchError;

  const existingEvents = (existingRows || []) as ExistingEventRow[];
  const report = {
    updated: 0,
    skipped: 0,
    unmatched: [] as string[],
  };

  for (const existing of existingEvents) {
    const canonical = findCanonicalRule(existing.name);

    if (!canonical) {
      report.skipped += 1;
      report.unmatched.push(existing.name);
      continue;
    }

    const { error } = await supabase
      .from('events')
      .update({
        category: canonical.category,
        is_team: canonical.is_team,
        min_team_size: canonical.min_team_size,
        max_team_size: canonical.max_team_size,
        max_entries_per_institute: canonical.max_entries_per_institute,
        max_accompanists: canonical.max_accompanists,
        min_time_minutes: canonical.min_time_minutes,
        max_time_minutes: canonical.max_time_minutes,
      })
      .eq('id', existing.id);

    if (error) throw error;
    report.updated += 1;
  }

  return report;
};
