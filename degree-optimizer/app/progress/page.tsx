import ProgressPageClient from "@/components/progress-page-client";
import { readAppState } from "@/lib/storage";

export default async function ProgressPage() {
  const initialState = await readAppState();

  return <ProgressPageClient initialState={initialState} />;
}
