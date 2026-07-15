import { Bell } from "lucide-react";

import { requireCurrentUser } from "../../_lib/auth/auth-server";
import { EmptyState } from "../_components/empty-state";
import { FeedShell } from "../_components/feed-shell";

export const metadata = { title: "Notifications | BuddyScript" };

export default async function NotificationsPage() {
  const user = await requireCurrentUser();

  return (
    <FeedShell user={user}>
      <section
        aria-label="Notifications"
        className="_feed_inner_area mx-auto mt-4 w-full max-w-[636px] rounded-md bg-white dark:bg-[#112032] dark:text-white"
      >
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="Likes, comments, and replies on your posts will show up here as soon as they happen."
          action={{ href: "/feed", label: "Back to feed" }}
        />
      </section>
    </FeedShell>
  );
}
