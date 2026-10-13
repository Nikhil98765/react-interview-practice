import { getUser } from "../user";

const SharedDataLayout = async ({ params, children }: LayoutProps<"/routing/gotchas/shared-data/[id]">) => {
  const { id } = await params;
  const user = await getUser(id);          // ask #1

  return (
    <div className="demo-box">
      <span className="tag">layout — got {user.name} at {user.fetchedAt}</span>
      {children}
    </div>
  );
};

export default SharedDataLayout;
