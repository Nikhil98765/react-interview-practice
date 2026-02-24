export async function fetchPosts() {
  const posts = await fetch("https://jsonplaceholder.typicode.com/posts");
  console.log("🚀 ~ fetchPosts ~ posts:", posts);
  return new Promise((resolve) => {
    setTimeout(() => resolve(posts.json()), 3000);
  });
}

export async function fetchPost() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = await response.json();
  return posts[0];
}