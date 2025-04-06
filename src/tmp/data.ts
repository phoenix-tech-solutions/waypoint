export const events = [
  {
    id: 1,
    title: "Hackathon 2024",
    date: "2024-04-10",
    details: "Join us for a 24-hour coding marathon!",
    year: 2024,
  },
  {
    id: 2,
    title: "Science Fair",
    date: "2024-05-05",
    details: "Showcase your innovative projects!",
    year: 2024,
  },
  {
    id: 3,
    title: "Art Exhibition",
    date: "2024-06-20",
    details: "Experience creativity at its best.",
    year: 2024,
  },
  {
    id: 4,
    title: "Summer Workshop Series",
    date: "2024-07-01",
    details: "Various workshops throughout the summer.",
    year: 2024,
  },
  {
    id: 5,
    title: "Back to School Bash",
    date: "2024-08-15",
    details: "Celebrate the start of the new school year!",
    year: 2024,
  },
  {
    id: 6,
    title: "Fall Festival",
    date: "2024-10-26",
    details: "Enjoy games, food, and fun for all ages.",
    year: 2024,
  },
  {
    id: 7,
    title: "Winter Concert",
    date: "2024-12-18",
    details: "A musical celebration of the winter season.",
    year: 2024,
  },
  {
    id: 8,
    title: "New Year Kickoff",
    date: "2025-01-01",
    details: "Start the year with new goals and activities",
    year: 2025,
  },
  {
    id: 9,
    title: "Spring Break Camp",
    date: "2025-03-10",
    details: "Fun activities during the spring break",
    year: 2025,
  },
  {
    id: 10,
    title: "Robotics Competition",
    date: "2025-04-22",
    details: "Watch the future of innovation",
    year: 2025,
  },
  {
    id: 11,
    title: "Graduation Ceremony",
    date: "2025-05-25",
    details: "Celebrate our graduating class!",
    year: 2025,
  },
].sort((a, b) => a.date.localeCompare(b.date)); // Sort events by date

// Sample data for Staff Directory
export const staff = [
  { id: 'staff1', name: 'Alice Johnson', role: 'Chief Executive Officer' },
  { id: 'staff2', name: 'Bob Smith', role: 'Chief Technology Officer' },
  { id: 'staff3', name: 'Carol Davis', role: 'Chief Financial Officer' },
  { id: 'staff4', name: 'David Lee', role: 'Lead Developer' },
  { id: 'staff5', name: 'Emma Wilson', role: 'Product Manager' },
  { id: 'staff6', name: 'Frank Thompson', role: 'UX Designer' }
];

// Sample data for Clubs Info
export const clubs = [
  { id: 'club1', name: 'Chess Club', leader: 'Alice Johnson', sponsor: 'Tech Innovations Inc.', description: 'Sharpen your strategic thinking with chess.' },
  { id: 'club2', name: 'Robotics Club', leader: 'Bob Smith', sponsor: 'Future Robotics', description: 'Build and program robots to solve real-world problems.' },
  { id: 'club3', name: 'Art Club', leader: 'Carol Davis', sponsor: 'Creative Minds Co.', description: 'Express your creativity through various art forms.' },
  { id: 'club4', name: 'Drama Club', leader: 'David Lee', sponsor: 'StageCraft Productions', description: 'Explore acting, directing, and stage production.' },
  { id: 'club5', name: 'Science Club', leader: 'Emma Wilson', sponsor: 'Innovative Labs', description: 'Dive into experiments and scientific discoveries.' },
  { id: 'club6', name: 'Music Club', leader: 'Frank Thompson', sponsor: 'Harmony Music Group', description: 'Celebrate music through performance and collaboration.' }
];
