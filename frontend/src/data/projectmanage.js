import { projects as baseProjects } from './projects';

export const projectTypes = [
  'Feature Film',
  'Short Film',
  'Documentary',
  'Series',
  'Commercial',
  'Music Video',
  'Corporate Film',
  'Animation',
  'BTS / Making-of',
  'Trailer/Teaser',
  'Event Coverage',
  'Advertisement',
  'Drone & Aerial Cinematography',
  'Other',
];

const typeById = {
  'proj-1': 'Feature Film',
  'proj-2': 'Documentary',
  'proj-3': 'Short Film',
  'proj-4': 'Music Video',
  'proj-5': 'Short Film',
  'proj-6': 'Documentary',
  'proj-7': 'Feature Film',
  'proj-8': 'Short Film',
};

export const projects = baseProjects.map((p) => ({
  ...p,
  type: p.type || typeById[p.id] || 'Other',
}));

export const sectionsConfig = projectTypes.map((t) => ({ title: t, types: [t] }));

export const sections = sectionsConfig.map(({ title, types }) => ({
  id: title
    .toLowerCase()
    .replace(/\s+\/(\s+)?/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, ''),
  title,
  types,
}));
