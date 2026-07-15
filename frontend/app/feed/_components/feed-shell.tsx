import type { ReactNode } from "react";

import type { AuthUser } from "../../_lib/auth/auth-contract";
import { FeedHeader } from "./feed-header";
import { FeedTheme } from "./feed-theme";
import styles from "../feed.module.css";

export function FeedShell({
  user,
  children,
  constrainViewport = false,
}: {
  user: AuthUser;
  children: ReactNode;
  constrainViewport?: boolean;
}) {
  return (
    <FeedTheme>
      <div
        className={`${styles.shell} ${constrainViewport ? styles.shellFixed : ""}`}
      >
        <FeedHeader user={user} />
        <main
          className={`${styles.container} ${constrainViewport ? styles.containerFixed : ""}`}
        >
          {children}
        </main>
      </div>
    </FeedTheme>
  );
}
