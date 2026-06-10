import Link from "next/link";

export default function PostItem({ postMetadata }) {
  return (
    <div>
      <Link href={`/posts/${postMetadata.slug}`}>
        <div className="p-1">
          <h2 className="text-base font-bold">{postMetadata.title}</h2>
          <p className="text-gray-500">{postMetadata.summary}</p>
        </div>
      </Link>
    </div>
  );
}
