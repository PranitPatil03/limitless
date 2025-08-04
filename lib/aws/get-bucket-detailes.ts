export async function getBucketDetails(userId: string, bucketName: string) {
  const res = await fetch(
    `/api/aws/get-bucket-details?userId=${encodeURIComponent(
      userId
    )}&bucketName=${encodeURIComponent(bucketName)}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch bucket details: ${res.statusText}`);
  }

  return await res.json();
}
