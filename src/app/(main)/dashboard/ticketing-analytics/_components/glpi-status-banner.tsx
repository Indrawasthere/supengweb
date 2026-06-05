import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface Props {
  isConnected: boolean;
  message: string;
  fetchError?: string;
}

export function GlpiStatusBanner({ isConnected, message, fetchError }: Props) {
  if (isConnected && !fetchError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-green-800 text-sm dark:border-green-900/30 dark:bg-green-500/10 dark:text-green-300">
        <CheckCircle className="size-4 shrink-0" />
        <span>GLPI terhubung — data real-time</span>
      </div>
    );
  }

  if (isConnected && fetchError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2 text-yellow-800 text-sm dark:border-yellow-900/30 dark:bg-yellow-500/10 dark:text-yellow-300">
        <AlertTriangle className="size-4 shrink-0" />
        <span>
          GLPI terhubung tapi ada error saat fetch:{" "}
          <span className="font-mono">{fetchError}</span> — menampilkan data
          dummy
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-800 text-sm dark:border-red-900/30 dark:bg-red-500/10 dark:text-red-300">
      <XCircle className="size-4 shrink-0" />
      <span>
        GLPI tidak terhubung — menampilkan data dummy.{" "}
        <span className="font-mono">{message}</span> Set{" "}
        <code className="rounded bg-red-100 px-1 dark:bg-red-900/30">
          GLPI_BASE_URL
        </code>{" "}
        dan{" "}
        <code className="rounded bg-red-100 px-1 dark:bg-red-900/30">
          GLPI_API_KEY
        </code>{" "}
        di <code>.env</code>.
      </span>
    </div>
  );
}
