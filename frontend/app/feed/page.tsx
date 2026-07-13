import { FeedPost, PostComposer, Stories } from "./_components/feed-content";
import { FeedHeader } from "./_components/feed-header";
import { FeedTheme } from "./_components/feed-theme";
import { LeftSidebar } from "./_components/left-sidebar";
import { RightSidebar } from "./_components/right-sidebar";
import styles from "./feed.module.css";
export default function FeedPage() {
  return (
    <FeedTheme>
      <div>
        <FeedHeader />
        <main className={styles.container}>
          <div className={styles.columns}>
            <LeftSidebar />
            <div>
              <Stories />
              <PostComposer />
              <FeedPost />
            </div>
            <RightSidebar />
          </div>
        </main>
      </div>
    </FeedTheme>
  );
}
