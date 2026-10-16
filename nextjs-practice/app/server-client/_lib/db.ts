import 'server-only'; // any client import of this file that the compiler keeps fails the build (Gotcha 4)

export async function getUsers() {
  console.log("🚀 ~ getUsers ~ process.env.DB_VAR:", process.env.DB_VAR);
  console.log(
    "🚀 ~ getUsers ~ process.env.NEXT_PUBLIC_TEST1:",
    process.env.NEXT_PUBLIC_TEST1,
  );
}