import BucketList from "@/components/buckets/bucket-list";

export default function BucketPage() {
  return (
    <div className="py-8 px-2 md:px-6 w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 font-mono">Your S3 Buckets</h1>
        <p className="text-muted-foreground text-lg font-mono">
          Manage your AWS S3 buckets securely
        </p>
      </div>
      <BucketList />
    </div>
  );
}
