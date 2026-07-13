export const people = [
  {
    name: "Steve Jobs",
    role: "CEO of Apple",
    image: "people1.png",
    recent: true,
  },
  { name: "Ryan Roslansky", role: "CEO of Linkedin", image: "people2.png" },
  { name: "Dylan Field", role: "CEO of Figma", image: "people3.png" },
];

export const friends = [...people, ...people, people[0]];

export const menuItems = [
  "Learning",
  "Insights",
  "Find friends",
  "Bookmarks",
  "Group",
  "Gaming",
  "Settings",
  "Save post",
];
