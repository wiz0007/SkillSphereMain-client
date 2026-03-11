export interface Skill {
  id: number;
  title: string;
  teacher: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  sessions: number;
  image: string;
}

export const skills: Skill[] = [
  {
    id: 1,
    title: "React Development",
    teacher: "John Carter",
    category: "Programming",
    level: "Intermediate",
    rating: 4.8,
    sessions: 120,
    image: "/skills/react.jpg"
  },
  {
    id: 2,
    title: "UI UX Design",
    teacher: "Sarah Lee",
    category: "Design",
    level: "Beginner",
    rating: 4.6,
    sessions: 90,
    image: "/skills/ui.jpg"
  },
  {
    id: 3,
    title: "Python Programming",
    teacher: "Mike Ross",
    category: "Programming",
    level: "Advanced",
    rating: 4.9,
    sessions: 150,
    image: "/skills/python.jpg"
  },
  {
    id: 4,
    title: "Digital Marketing",
    teacher: "Anna Smith",
    category: "Marketing",
    level: "Beginner",
    rating: 4.5,
    sessions: 80,
    image: "/skills/marketing.jpg"
  }
];