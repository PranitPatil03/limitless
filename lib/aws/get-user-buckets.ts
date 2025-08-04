export async function fetchUserBuckets(userId: string) {
  if (!userId) return [];
  try {
    const resp = await fetch(`/api/aws/get-user-buckets?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!resp.ok) throw new Error("Failed to fetch buckets");
    const data = await resp.json();
    return data.buckets || [];
  } catch (err) {
    console.error("Error fetching user buckets:", err);
    return [];
  }
}
