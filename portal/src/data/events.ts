export type EventInfo = {
  id: number;
  name: string;
  category: 'Dance' | 'Music' | 'Theatre' | 'Literary' | 'Fine Arts' | 'Diverse';
  maxEntries: string;
  participantsPerTeam: string;
  maxAccompanists: string;
  minTime: string;
  maxTime: string;
  isPrelim?: boolean;
  rulesPdfUrl?: string;
};

export const events: EventInfo[] = [
  { id: 1, name: 'Classical Dance', category: 'Dance', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '5', minTime: '8', maxTime: '10' },
  { id: 2, name: 'UTU Best Dancer', category: 'Dance', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '5', minTime: '8', maxTime: '10', isPrelim: true },
  { id: 3, name: 'Folk/Tribal Dance', category: 'Dance', maxEntries: '1', participantsPerTeam: '8-10', maxAccompanists: '3', minTime: '5', maxTime: '8' },
  { id: 4, name: 'Free Style/Contemporary/Bollywood Dance', category: 'Dance', maxEntries: '1', participantsPerTeam: '8-10', maxAccompanists: '5', minTime: '8', maxTime: '10' },
  { id: 5, name: 'Light Indian Vocal', category: 'Music', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '3', minTime: '4', maxTime: '6' },
  { id: 6, name: 'Western Vocal', category: 'Music', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '3', minTime: '4', maxTime: '6' },
  { id: 7, name: 'Bollywood/Filmy Vocal', category: 'Music', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '3', minTime: '4', maxTime: '6' },
  { id: 8, name: 'Indian Song', category: 'Music', maxEntries: '1', participantsPerTeam: '3-4', maxAccompanists: '1', minTime: '4', maxTime: '6' },
  { id: 9, name: 'Mono-Acting', category: 'Theatre', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '0', minTime: '5', maxTime: '8' },
  { id: 10, name: 'Mimicry', category: 'Theatre', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '0', minTime: '5', maxTime: '8' },
  { id: 11, name: 'Mime', category: 'Theatre', maxEntries: '1', participantsPerTeam: '6', maxAccompanists: '0', minTime: '5', maxTime: '8' },
  { id: 12, name: 'Skit', category: 'Theatre', maxEntries: '1', participantsPerTeam: '3-6', maxAccompanists: '4', minTime: '5', maxTime: '10' },
  { id: 13, name: 'One-Act-Play / Drama', category: 'Theatre', maxEntries: '1', participantsPerTeam: '3-9', maxAccompanists: '8', minTime: '10', maxTime: '30' },
  { id: 14, name: 'Short Film Making', category: 'Theatre', maxEntries: '1', participantsPerTeam: '3-6', maxAccompanists: '0', minTime: '5', maxTime: '10' },
  { id: 15, name: 'Elocution', category: 'Literary', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '0', minTime: '4', maxTime: '5' },
  { id: 16, name: 'Poem Recitation', category: 'Literary', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '0', minTime: '0', maxTime: '5' },
  { id: 17, name: 'Quiz', category: 'Literary', maxEntries: '1', participantsPerTeam: '3', maxAccompanists: '0', minTime: 'N/A', maxTime: 'N/A' },
  { id: 18, name: 'Debate', category: 'Literary', maxEntries: '1', participantsPerTeam: '2', maxAccompanists: '0', minTime: 'N/A', maxTime: 'N/A' },
  { id: 19, name: 'Poster Making', category: 'Fine Arts', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '0', minTime: '4', maxTime: '5' },
  { id: 20, name: 'On the Spot Painting', category: 'Fine Arts', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '0', minTime: '120', maxTime: '150' },
  { id: 21, name: 'Cartooning', category: 'Fine Arts', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '0', minTime: '120', maxTime: '150' },
  { id: 22, name: 'Collage', category: 'Fine Arts', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '0', minTime: '120', maxTime: '150' },
  { id: 23, name: 'Clay Modelling', category: 'Fine Arts', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '0', minTime: '120', maxTime: '150' },
  { id: 24, name: 'Rangoli', category: 'Fine Arts', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '0', minTime: '120', maxTime: '150' },
  { id: 25, name: 'Mehndi', category: 'Fine Arts', maxEntries: '2', participantsPerTeam: '1', maxAccompanists: '1', minTime: '120', maxTime: '150' },
  { id: 26, name: 'Fashion Show', category: 'Diverse', maxEntries: '1', participantsPerTeam: '12-16', maxAccompanists: '—', minTime: '120', maxTime: '150' },
  { id: 27, name: 'Uth Icon [1 Male and 1 Female]', category: 'Diverse', maxEntries: '2', participantsPerTeam: '1 each', maxAccompanists: '8', minTime: '10', maxTime: 'N/A' },
  { id: 28, name: 'Show Reels', category: 'Diverse', maxEntries: '2', participantsPerTeam: '2-3', maxAccompanists: '0', minTime: '1', maxTime: '3' },
];
