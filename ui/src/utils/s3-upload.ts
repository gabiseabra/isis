export function s3Upload(
  url: string,
  file: File,
  options?: {
    signal?: AbortSignal;
    onProgress?: (progress: {
      loaded: number;
      total: number;
      percent: number;
    }) => void;
  },
) {
  return new Promise<void>((resolve, reject) => {
    if (options?.signal?.aborted) {
      reject(
        options.signal.reason ??
          new DOMException("Upload cancelled", "AbortError"),
      );
      return;
    }

    const xhr = new XMLHttpRequest();

    options?.signal?.addEventListener("abort", () => xhr.abort(), {
      once: true,
    });

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;

      options?.onProgress?.({
        loaded: event.loaded,
        total: event.total,
        percent: (event.loaded / event.total) * 100,
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.onabort = () =>
      reject(
        options?.signal?.reason ??
          new DOMException("Upload cancelled", "AbortError"),
      );

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}
