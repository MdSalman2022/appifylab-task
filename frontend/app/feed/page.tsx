import { requireCurrentUser } from "../_lib/auth/auth-server";
import { Stories } from "./_components/feed-content";
import { FeedShell } from "./_components/feed-shell";
import { FeedTimeline } from "./_components/feed-timeline";
import { LeftSidebar } from "./_components/left-sidebar";
import { RightSidebar } from "./_components/right-sidebar";
import styles from "./feed.module.css";

export default async function FeedPage() {
  const user = await requireCurrentUser();

  return (
    <FeedShell user={user} constrainViewport>
      <div className={styles.columns}>
        <div
          role="region"
          aria-label="Explore and community"
          tabIndex={0}
          className={`${styles.columnScroll} ${styles.columnBottomSpace} max-lg:hidden`}
        >
          <LeftSidebar />
        </div>
        <div
          role="region"
          aria-label="Post feed"
          tabIndex={0}
          className={`${styles.columnScroll} ${styles.columnBottomSpace}`}
        >
          <Stories />
          <FeedTimeline currentUser={user} />
        </div>
        <div
          role="region"
          aria-label="Suggestions and friends"
          tabIndex={0}
          className={`${styles.columnScroll} ${styles.columnBottomSpace} max-lg:hidden`}
        >
          <RightSidebar />
        </div>
      </div>
    </FeedShell>
  );
}
