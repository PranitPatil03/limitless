"use client";

import BucketDetail from "../../../../components/buckets/bucket-detail";

interface Props {
  params: {
    bucketId: string;
  };
}

export default function BucketPage({ params: { bucketId } }: Props) {
  return <BucketDetail bucketId={bucketId} />;
}
