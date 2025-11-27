import { Button } from "@/components/ui/button";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { syncWithSupabase } from "@/lib/supabase/sync";
import { useState } from "react";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const { supabase } = useSupabase();

  async function handleSync() {
    setLoading(true);
    await syncWithSupabase(supabase!);
    setLoading(false);
  }

  return (
    <Button variant={"secondary"} onClick={handleSync} disabled={loading}>
      {loading ? "Syncing..." : "Sync Now"}
    </Button>
  );
}
