import { requireCurrentUser } from "../_lib/auth/auth-server";
import { Stories } from "./_components/feed-content";
import { FeedTimeline } from "./_components/feed-timeline";
import { FeedHeader } from "./_components/feed-header";
import { FeedTheme } from "./_components/feed-theme";
import { LeftSidebar } from "./_components/left-sidebar";
import { RightSidebar } from "./_components/right-sidebar";
import styles from "./feed.module.css";
export default async function FeedPage() {
  const user = await requireCurrentUser();

  return (
    <FeedTheme>
      <div>
        <FeedHeader user={user} />
        <main className={styles.container}>
          <div className={styles.columns}>
            <LeftSidebar />
            <div>
              <Stories />
              <FeedTimeline currentUserId={user.id} />
            </div>
            <RightSidebar />
          </div>
        </main>
      </div>
    </FeedTheme>
  );
}
