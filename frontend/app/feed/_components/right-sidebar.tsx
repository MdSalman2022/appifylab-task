import { FriendsList, YouMightLike } from "./people-panels";

export function RightSidebar() {
  return (
    <aside className="space-y-4 max-lg:hidden">
      <YouMightLike />
      <FriendsList />
    </aside>
  );
}
