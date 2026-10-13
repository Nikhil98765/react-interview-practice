import { getUser } from "../user";

const SharedDataPage = async ({ params }: PageProps<"/routing/gotchas/shared-data/[id]">) => {
  const { id } = await params;
  const user = await getUser(id);          // ask #2 — same request, same argument

  return (
    <p>
      page — got {user.name} at {user.fetchedAt}. Same timestamp as the layout means ONE call.
      The server log shows how many times getUser really ran.
    </p>
  );
};

export default SharedDataPage;
