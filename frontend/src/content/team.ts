// The SolarSkin team, shown in the "Team" section (TeamSection.tsx).
// Photos live in frontend/public/team/. To add or change someone, edit this list:
//   title – their position in the team (shown on a tag in their colour)
//   credential – programme · university (one short line under the name)
//   details – their full role, 2 sentences (slides down when you hover the position tag)
//   color – their colour (no blue: it clashes with the green/yellow site)
//   photo – optional; without one the card shows their initials
//   focus – where the face is in the photo (CSS object-position), e.g. '50% 30%'
//   zoom  – optional, makes a small face bigger (1.3 = 30% bigger)

export type TeamMember = {
  name: string;
  title: string;
  credential: string;
  details: string;
  color: string;
  photo?: string;
  focus?: string;
  zoom?: number;
};

export const TEAM: TeamMember[] = [
  {
    name: 'Zafarjon Obidjonov',
    title: 'Project Lead',
    credential: 'PhD, solar energy in buildings · Fergana State Technical University',
    details:
      'Leads SolarSkin end to end and runs the Fergana pilot, from field work to talks with local partners. Models façade output in PV and PVsyst, builds the ESP32 prototype and develops the AR app.',
    color: '#f5b82e', // solar yellow
    photo: '/team/zafarjon.jpg',
    focus: '50% 22%',
    zoom: 1.3,
  },
  {
    name: 'Sherif Sumaila',
    title: 'Frontend & Impact Lead',
    credential: 'BSc (Hons) Computer Science · African Leadership College of Higher Education',
    details:
      "Designed and built this website and the live monitoring dashboard for the sensor data. Works out the emission factors and energy statistics behind SolarSkin's CO₂ and sustainability impact.",
    color: '#4cc27a', // leaf green
    photo: '/team/sherif.jpg',
    focus: '50% 35%',
  },
  {
    name: 'Opeyemi Afuwape',
    title: 'Creative Director',
    credential:
      'BSc (Hons) Entrepreneurial Leadership · African Leadership College of Higher Education',
    details:
      'Leads our visual identity and storytelling. Produces the project video and the visual design that explain SolarSkin, turning engineering into a story people can see and feel.',
    color: '#ef6f5e', // coral
    photo: '/team/opeyemi.jpg',
    focus: '50% 45%',
  },
  {
    name: 'Chaldo Carlos Victorino',
    title: 'Electronics Engineer',
    credential: 'Electronic and Telecommunications Engineering · Universidade Rovuma',
    details:
      'Builds the sensor electronics and data transmission for the ESP32 logger that measures power, sunlight and wall temperature. Adds the renewable-energy view from Mozambique.',
    color: '#22b5a0', // teal
    photo: '/team/chaldo.jpg',
    focus: '50% 20%',
  },
  {
    name: 'Tamim Hossain',
    title: 'Researcher',
    credential: 'Higher Secondary (Science) · Notre Dame College',
    details:
      'Researches the economic factors and the prices of solar modules, frames and sensors, so every SolarSkin module stays low-cost and affordable to build.',
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
