// Server component — only exports generateStaticParams to satisfy static export.
// The real rendering is delegated to the client component below.
import BoardPageClient from "./BoardPageClient";

// These seed IDs ensure static HTML shells exist for the demo boards.
// Boards created by users at runtime are handled by client-side navigation.
export function generateStaticParams() {
  return [
    { boardId: "board-001" },
    { boardId: "board-002" },
    { boardId: "board-003" },
  ];
}

interface PageProps {
  params: { boardId: string };
}

export default function Page({ params }: PageProps) {
  return <BoardPageClient boardId={params.boardId} />;
}
