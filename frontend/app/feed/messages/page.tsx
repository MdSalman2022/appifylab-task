import { MessageCircle } from "lucide-react";

import { requireCurrentUser } from "../../_lib/auth/auth-server";
import { EmptyState } from "../_components/empty-state";
import { FeedShell } from "../_components/feed-shell";

export const metadata = { title: "Messages | BuddyScript" };

export default async function MessagesPage() {
  const user = await requireCurrentUser();

  return (
    <FeedShell user={user}>
      <section
        aria-label="Messages"
        className="_feed_inner_area mx-auto mt-4 w-full max-w-[636px] rounded-md bg-white dark:bg-[#112032] dark:text-white"
      >
        <EmptyState
          icon={MessageCircle}
          title="No messages yet"
          description="Conversations with your friends will show up here once messaging is available."
          action={{ href: "/feed", label: "Back to feed" }}
        />
      </section>
    </FeedShell>
  );
}
