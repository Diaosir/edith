export default async function logTime(func, after) {
  const now = Date.now();
  await func();
  await after(Date.now() - now);
}