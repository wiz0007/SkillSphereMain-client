export interface SidebarItem {
  id: number;
  title: string;
  icon: string;
  route: string;
}

export const sidebarItems: SidebarItem[] = [
  {
    id: 1,
    title: "Dashboard",
    icon: "ri-home-5-line",
    route: "/dashboard",
  },
  {
    id: 2,
    title: "Skill Discovery",
    icon: "ri-search-line",
    route: "/discover",
  },
  {
    id: 3,
    title: "My Skills",
    icon: "ri-lightbulb-line",
    route: "/skills",
  },
  {
    id: 4,
    title: "Sessions",
    icon: "ri-calendar-line",
    route: "/sessions",
  },
  {
    id: 5,
    title: "Messages",
    icon: "ri-chat-3-line",
    route: "/messages",
  },
  {
    id: 6,
    title: "Profile",
    icon: "ri-user-line",
    route: "/profile",
  },
  {
    id: 7,
    title: "Settings",
    icon: "ri-settings-3-line",
    route: "/settings",
  },
];