import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { never } from "@isis/common/utils/error";
import crypto from "node:crypto";

function hmac(key: crypto.BinaryLike, value: string) {
  return crypto.createHmac("sha256", key).update(value).digest();
}

function sha256(value: crypto.BinaryLike) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function amzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function encodeKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

export async function createUploadUrl(file: { name: string; type: string }) {
  const accessKey =
    process.env.HETZNER_OBJECT_STORAGE_ACCESS_KEY ??
    never("HETZNER_OBJECT_STORAGE_ACCESS_KEY not defined");
  const secretKey =
    process.env.HETZNER_OBJECT_STORAGE_SECRET_KEY ??
    never("HETZNER_OBJECT_STORAGE_SECRET_KEY not defined");
  const bucket =
    process.env.HETZNER_OBJECT_STORAGE_BUCKET ??
    never("HETZNER_OBJECT_STORAGE_BUCKET not defined");
  const region = process.env.HETZNER_OBJECT_STORAGE_REGION ?? "fsn1";
  const endpoint = (
    process.env.HETZNER_OBJECT_STORAGE_ENDPOINT ??
    `${region}.your-objectstorage.com`
  ).replace(/^https?:\/\//, "");
  const key = `${process.env.HETZNER_OBJECT_STORAGE_PREFIX ?? "media"}/${crypto.randomUUID()}-${file.name}`;

  const url = await getSignedUrl(
    new S3Client({
      region,
      endpoint: `https://${endpoint}`,
      requestChecksumCalculation: "WHEN_REQUIRED",
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    }),
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: file.type,
    }),
    { expiresIn: 600 },
  );

  return { key, url };
}

export async function uploadHetznerFile(file: File, key: string) {
  const accessKey =
    process.env.HETZNER_OBJECT_STORAGE_ACCESS_KEY ??
    never("HETZNER_OBJECT_STORAGE_ACCESS_KEY not defined");
  const secretKey =
    process.env.HETZNER_OBJECT_STORAGE_SECRET_KEY ??
    never("HETZNER_OBJECT_STORAGE_SECRET_KEY not defined");
  const bucket =
    process.env.HETZNER_OBJECT_STORAGE_BUCKET ??
    never("HETZNER_OBJECT_STORAGE_BUCKET not defined");
  const region = process.env.HETZNER_OBJECT_STORAGE_REGION ?? "fsn1";
  const endpoint = (
    process.env.HETZNER_OBJECT_STORAGE_ENDPOINT ??
    `${region}.your-objectstorage.com`
  ).replace(/^https?:\/\//, "");
  const body = Buffer.from(await file.arrayBuffer());
  const payloadHash = sha256(body);
  const now = new Date();
  const date = amzDate(now);
  const day = date.slice(0, 8);
  const host = `${bucket}.${endpoint}`;
  const contentType = file.type || "application/octet-stream";
  const headers = {
    "content-type": contentType,
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": date,
  };
  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.entries(headers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${name}:${value}\n`)
    .join("");
  const scope = `${day}/${region}/s3/aws4_request`;
  const canonicalRequest = [
    "PUT",
    `/${encodeKey(key)}`,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const signature = crypto
    .createHmac(
      "sha256",
      hmac(
        hmac(hmac(hmac(`AWS4${secretKey}`, day), region), "s3"),
        "aws4_request",
      ),
    )
    .update(
      ["AWS4-HMAC-SHA256", date, scope, sha256(canonicalRequest)].join("\n"),
    )
    .digest("hex");
  const response = await fetch(`https://${host}/${encodeKey(key)}`, {
    method: "PUT",
    headers: {
      ...headers,
      authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    body,
  });

  if (!response.ok) throw new Error(await response.text());

  return key;
}
