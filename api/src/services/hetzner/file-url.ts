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

export function getHetznerFileUrl(key: string, expiresInSeconds = 60) {
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
  const date = amzDate(new Date());
  const day = date.slice(0, 8);
  const host = `${bucket}.${endpoint}`;
  const scope = `${day}/${region}/s3/aws4_request`;
  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKey}/${scope}`,
    "X-Amz-Date": date,
    "X-Amz-Expires": String(expiresInSeconds),
    "X-Amz-SignedHeaders": "host",
  });
  const canonicalRequest = [
    "GET",
    `/${encodeKey(key)}`,
    query.toString(),
    `host:${host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
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

  query.set("X-Amz-Signature", signature);

  return `https://${host}/${encodeKey(key)}?${query}`;
}
