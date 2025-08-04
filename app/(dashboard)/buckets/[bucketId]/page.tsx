"use client";

import { authClient } from "@/lib/auth-client";
import BucketDetail from "../../../../components/buckets/bucket-detail";

interface Props {
  params: {
    bucketId: string;
  };
}

export default function BucketPage({ params: { bucketId } }: Props) {
    const { data: session } = authClient.useSession();
    const user = session?.user;
    const userId = user?.id
  
  return <BucketDetail bucketId={bucketId} userId={userId ?? ""}/>;
}
