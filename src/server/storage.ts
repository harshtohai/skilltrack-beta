import { env } from "~/env";

const BUCKET = "certificates";
const SIGNED_URL_TTL_SECONDS = 900; // 15 minutes (grilling Q14)

export function isStorageConfigured(): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

function storageHeaders(contentType?: string): HeadersInit {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    apikey: env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}

/** Upload a certificate file to the private bucket. Throws on failure. */
export async function uploadCertificateFile(key: string, bytes: Buffer, mimeType: string): Promise<void> {
  const res = await fetch(`${env.SUPABASE_URL}/storage/v1/object/${BUCKET}/${key}`, {
    method: "POST",
    headers: storageHeaders(mimeType),
    body: new Uint8Array(bytes),
  });
  if (!res.ok) throw new Error(`Storage upload failed (${res.status}): ${await res.text()}`);
}

/** Short-lived signed URL for viewing a private certificate (session-gated routes call this). */
export async function signCertificateUrl(key: string, ttlSeconds = SIGNED_URL_TTL_SECONDS): Promise<string> {
  const res = await fetch(`${env.SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/${key}`, {
    method: "POST",
    headers: storageHeaders("application/json"),
    body: JSON.stringify({ expiresIn: ttlSeconds }),
  });
  if (!res.ok) throw new Error(`Storage sign failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { signedURL?: string };
  if (!data.signedURL) throw new Error("Storage sign returned no signedURL");
  return `${env.SUPABASE_URL}/storage/v1${data.signedURL}`;
}

/** Remove a certificate file from the private bucket. Throws on failure. */
export async function deleteCertificateObject(key: string): Promise<void> {
  const res = await fetch(`${env.SUPABASE_URL}/storage/v1/object/${BUCKET}/${key}`, {
    method: "DELETE",
    headers: storageHeaders(),
  });
  if (!res.ok && res.status !== 404) throw new Error(`Storage delete failed (${res.status}): ${await res.text()}`);
}
