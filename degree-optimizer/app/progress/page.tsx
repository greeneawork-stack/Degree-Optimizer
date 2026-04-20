import ProgressForm from "@/components/progress-form";
import { readAppState } from "@/lib/storage";

export default async function ProgressPage() {
  const initialState = await readAppState();

  return <ProgressForm initialState={initialState} />;
}
