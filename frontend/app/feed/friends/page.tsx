import { Users } from "lucide-react";

import { requireCurrentUser } from "../../_lib/auth/auth-server";
import { EmptyState } from "../_components/empty-state";
import { FeedShell } from "../_components/feed-shell";

export const metadata = { title: "Friends | BuddyScript" };

export default async function FriendsPage() {
  const user = await requireCurrentUser();

  return (
    <FeedShell user={user}>
      <section
        aria-label="Friends"
        className="_feed_inner_area mx-auto mt-4 w-full max-w-[636px] rounded-md bg-white dark:bg-[#112032] dark:text-white"
      >
        <EmptyState
          icon={Users}
          title="No friends yet"
          description="Friend requests and the people you connect with will show up here once connections are available."
          action={{ href: "/feed", label: "Back to feed" }}
        />
      </section>
    </FeedShell>
  );
}
