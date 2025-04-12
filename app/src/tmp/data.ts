export const events = [
  {
    id: 1,
    title: "Hackathon 2025",
    date: "May 5, 2025",
    details: "Join us for a 24-hour coding marathon!",
    year: 2025,
  },
  {
    id: 2,
    title: "Science Fair",
    date: "June 5, 2025",
    details: "Showcase your innovative projects!",
    year: 2025,
  },
  {
    id: 3,
    title: "Art Exhibition",
    date: "July 20, 2025",
    details: "Experience creativity at its best.",
    year: 2025,
  },
  {
    id: 4,
    title: "Summer Workshop Series",
    date: "August 1, 2025",
    details: "Various workshops throughout the summer.",
    year: 2025,
  },
  {
    id: 5,
    title: "Back to School Bash",
    date: "September 15, 2025",
    details: "Celebrate the start of the new school year!",
    year: 2025,
  },
  {
    id: 6,
    title: "Fall Festival",
    date: "November 26, 2025",
    details: "Enjoy games, food, and fun for all ages.",
    year: 2025,
  },
  {
    id: 7,
    title: "Winter Concert",
    date: "December 18, 2025",
    details: "A musical celebration of the winter season.",
    year: 2025,
  },
  {
    id: 8,
    title: "New Year Kickoff",
    date: "January 1, 2026",
    details: "Start the year with new goals and activities",
    year: 2026,
  },
  {
    id: 9,
    title: "Spring Break Camp",
    date: "March 10, 2026",
    details: "Fun activities during the spring break",
    year: 2026,
  },
  {
    id: 10,
    title: "Robotics Competition",
    date: "April 22, 2026",
    details: "Watch the future of innovation",
    year: 2026,
  },
  {
    id: 11,
    title: "Graduation Ceremony",
    date: "May 25, 2026",
    details: "Celebrate our graduating class!",
    year: 2026,
  },
].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

export const staff = [
  { id: "1", name: "John Doe", role: "Principal" },
  { id: "2", name: "Jane Smith", role: "Assistant Principal" },
  { id: "3", name: "Alice Johnson", role: "Math Teacher" },
  { id: "4", name: "Bob Brown", role: "Science Teacher" },
  { id: "5", name: "Emily Davis", role: "English Teacher" },
  // ... Add all 117 staff members here in the same format ...
  { id: "117", name: "Chris Wilson", role: "Custodian" },
];

export const clubs = [
  { id: 'club1', name: 'Chess Club', leader: 'Alice Johnson', sponsor: 'Tech Innovations Inc.', description: 'Sharpen your strategic thinking with chess.' },
  { id: 'club2', name: 'Robotics Club', leader: 'Bob Smith', sponsor: 'Future Robotics', description: 'Build and program robots to solve real-world problems.' },
  { id: 'club3', name: 'Art Club', leader: 'Carol Davis', sponsor: 'Creative Minds Co.', description: 'Express your creativity through various art forms.' },
  { id: 'club4', name: 'Drama Club', leader: 'David Lee', sponsor: 'StageCraft Productions', description: 'Explore acting, directing, and stage production.' },
  { id: 'club5', name: 'Science Club', leader: 'Emma Wilson', sponsor: 'Innovative Labs', description: 'Dive into experiments and scientific discoveries.' },
  { id: 'club6', name: 'Music Club', leader: 'Frank Thompson', sponsor: 'Harmony Music Group', description: 'Celebrate music through performance and collaboration.' }
];
