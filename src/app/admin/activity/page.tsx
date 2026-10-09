import { getRecentActivity } from "@/lib/db/admin-stats";

export default async function AdminActivityPage() {
  const activity = await getRecentActivity(50);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Activity log</h2>
        <p className="text-sm text-gray-500 mt-1">
          Buying, selling, subscriptions, approvals, and review replies.
        </p>
      </div>

      {activity.length === 0 ? (
        <p className="text-sm text-gray-500 rounded-xl border p-8 text-center dark:border-gray-800">
          No events yet. Connect Supabase and use the app to generate activity.
        </p>
      ) : (
        <ul className="rounded-xl border divide-y dark:border-gray-800 dark:divide-gray-800">
          {activity.map((a) => (
            <li key={a.id} className="p-4 text-sm flex flex-wrap gap-x-4 gap-y-1">
              <span className="font-mono text-xs text-gray-400 w-40">
                {new Date(a.createdAt).toLocaleString()}
              </span>
              <span className="font-medium">{a.action}</span>
              {a.actorRole && (
                <span className="text-gray-500">role: {a.actorRole}</span>
              )}
              {a.entityType && (
                <span className="text-gray-400">
                  {a.entityType}
                  {a.entityId ? ` · ${a.entityId.slice(0, 8)}…` : ""}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
