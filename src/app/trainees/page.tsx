import Link from "next/link";
import { ArrowRight, Users, Search } from "lucide-react";
import { db } from "~/server/db";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { CopyButton } from "~/components/copy-button";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function TraineesListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page, q } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const query = (q ?? "").trim();

  const traineeWhere = query
    ? {
        OR: [
          { publicId: { contains: query, mode: "insensitive" as const } },
          { fullName: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [trainees, total] = await Promise.all([
    db.trainee.findMany({
      where: traineeWhere,
      orderBy: { fullName: "asc" },
      select: { id: true, publicId: true, fullName: true, district: true, consentGiven: true },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.trainee.count({ where: traineeWhere }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trainees</h1>
              <p className="text-sm text-gray-500">{total.toLocaleString()} total — lookup by Trainee ID or name</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Trainees</CardTitle>
          </CardHeader>
          <CardContent>
            <form method="GET" action="/trainees" className="mb-4 flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Search by Trainee ID or name..."
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline">Search</Button>
            </form>

            {trainees.length === 0 ? (
              <p className="text-sm text-gray-500">No trainees found{query ? ` for "${query}"` : ""}.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Trainee ID</th>
                      <th className="pb-3 font-medium">District</th>
                      <th className="pb-3 font-medium">Consent</th>
                      <th className="pb-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainees.map((trainee) => (
                      <tr key={trainee.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 font-medium">{trainee.fullName}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-primary font-medium">{trainee.publicId}</span>
                            <CopyButton value={trainee.publicId} />
                          </div>
                        </td>
                        <td className="py-3">{trainee.district}</td>
                        <td className="py-3">
                          {trainee.consentGiven ? (
                            <Badge variant="success">Given</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/trainees/${trainee.publicId}`}
                            className="text-primary hover:underline text-sm"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <Button variant="outline" size="sm" disabled={currentPage <= 1}>
                <Link href={`/trainees?page=${currentPage - 1}${query ? `&q=${encodeURIComponent(query)}` : ""}`}>Previous</Link>
              </Button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages}>
                <Link href={`/trainees?page=${currentPage + 1}${query ? `&q=${encodeURIComponent(query)}` : ""}`}>Next</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-primary hover:underline inline-flex items-center gap-1 text-sm">
            <ArrowRight className="h-4 w-4 rotate-180" /> Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
