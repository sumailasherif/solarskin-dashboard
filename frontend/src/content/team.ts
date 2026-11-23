// The SolarSkin team, shown in the "Team" section (TeamSection.tsx).
// Photos live in frontend/public/team/. To add or change someone, edit this list:
//   title – their position in the team (shown on a tag in their colour)
//   about – what they do, one very short sentence
//   color – their colour (no blue: it clashes with the green/yellow site)
//   photo – optional; without one the card shows their initials
//   focus – where the face is in the photo (CSS object-position), e.g. '50% 30%'
//   zoom  – optional, makes a small face bigger (1.3 = 30% bigger)

export type TeamMember = {
  name: string;
  title: string;
  about: string;
  color: string;
  lead?: boolean;
  photo?: string;
  focus?: string;
  zoom?: number;
};

export const TEAM: TeamMember[] = [
  {
    name: 'Zafarjon Obidjonov',
    lead: true,
    title: 'Project Lead',
    about: 'Leads the team, models the wall and runs the field work in Fergana.',
    color: '#f5b82e', // solar yellow
    photo: '/team/zafarjon.jpg',
    focus: '50% 22%',
    zoom: 1.3,
  },
  {
    name: 'Sherif Sumaila',
    title: 'Frontend & Impact Lead',
    about: 'Builds the front-end interface and does the impact research.',
    color: '#4cc27a', // leaf green
    photo: '/team/sherif.jpg',
    focus: '50% 35%',
  },
  {
    name: 'Opeyemi Afuwape',
    title: 'Creative Director',
    about: 'Creates the project video, the visuals and the story.',
    color: '#ef6f5e', // coral
    photo: '/team/opeyemi.jpg',
    focus: '50% 45%',
  },
  {
    name: 'Chaldo Carlos Victorino',
    title: 'Electronics Engineer',
    about: 'Builds the sensor electronics and sends the data from the wall.',
    color: '#22b5a0', // teal
    photo: '/team/chaldo.jpg',
    focus: '50% 20%',
  },
  {
    name: 'Tamim Hossain',
    title: 'Cost Researcher',
    about: 'Researches the prices of panels, frames and sensors.',
    color: '#f0913a', // amber
    photo: '/team/tamim.jpg',
    focus: '50% 55%',
    zoom: 1.35,
  },
];

/** "Zafarjon Obidjonov" → "ZO" (shown when there is no photo yet). */
export function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
