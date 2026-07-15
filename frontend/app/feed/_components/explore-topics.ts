import {
  Bookmark,
  ChartNoAxesColumn,
  Gamepad2,
  Group,
  PlayCircle,
  Save,
  Settings,
  UserRoundPlus,
  type LucideIcon,
} from "lucide-react";

export type ExploreTopic = {
  slug: string;
  label: string;
  icon: LucideIcon;
  isNew?: boolean;
  emptyTitle: string;
  emptyDescription: string;
};

export const exploreTopics: ExploreTopic[] = [
  {
    slug: "learning",
    label: "Learning",
    icon: PlayCircle,
    isNew: true,
    emptyTitle: "No courses yet",
    emptyDescription:
      "Learning content from your community will show up here once it is published.",
  },
  {
    slug: "insights",
    label: "Insights",
    icon: ChartNoAxesColumn,
    emptyTitle: "No insights yet",
    emptyDescription:
      "Analytics about your posts and engagement will show up here once there is enough activity.",
  },
  {
    slug: "find-friends",
    label: "Find friends",
    icon: UserRoundPlus,
    emptyTitle: "No suggestions yet",
    emptyDescription:
      "People you may know will show up here as your community grows.",
  },
  {
    slug: "bookmarks",
    label: "Bookmarks",
    icon: Bookmark,
    emptyTitle: "No bookmarks yet",
    emptyDescription:
      "Posts you bookmark will be saved here so you can come back to them later.",
  },
  {
    slug: "group",
    label: "Group",
    icon: Group,
    emptyTitle: "No groups yet",
    emptyDescription:
      "Groups you join or create will show up here.",
  },
  {
    slug: "gaming",
    label: "Gaming",
    icon: Gamepad2,
    isNew: true,
    emptyTitle: "No games yet",
    emptyDescription:
      "Gaming activity and communities will show up here once they are available.",
  },
  {
    slug: "settings",
    label: "Settings",
    icon: Settings,
    emptyTitle: "No settings yet",
    emptyDescription:
      "Account and privacy settings will show up here in a future update.",
  },
  {
    slug: "save-post",
    label: "Save post",
    icon: Save,
    emptyTitle: "No saved posts yet",
    emptyDescription:
      "Posts you save will show up here so you never lose track of them.",
  },
];

export function findExploreTopic(slug: string) {
  return exploreTopics.find((topic) => topic.slug === slug) ?? null;
}
