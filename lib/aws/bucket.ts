export interface BucketData {
  name: string;
  creationDate: string;
  region: string;
  totalFiles: number;
  totalSizeBytes: number;
  files: Array<{
    key: string;
    size: number;
    lastModified: string;
    storageClass: string;
  }>;
}

export async function getBucketDetails(
  userId: string,
  bucketName: string
): Promise<BucketData> {
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

export async function getBucketContents(
  userId: string,
  bucketName: string,
  prefix: string = "",
  delimiter: string = "/"
): Promise<{
  folders: string[];
  files: Array<{
    key: string;
    size: number;
    lastModified: string;
    storageClass: string;
  }>;
}> {
  const res = await fetch(
    `/api/aws/get-bucket-contents?userId=${encodeURIComponent(
      userId
    )}&bucketName=${encodeURIComponent(bucketName)}&prefix=${encodeURIComponent(
      prefix
    )}&delimiter=${encodeURIComponent(delimiter)}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch bucket contents: ${res.statusText}`);
  }

  return await res.json();
}
