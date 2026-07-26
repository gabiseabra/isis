import { Path } from "@isis/common/dto/path";
import { never } from "@isis/common/utils/error";
import { Router } from "express";
import { getHetznerFileUrl } from "../hetzner/file-url";
import { DOWNLOADABLE_FILE_TYPE_REGEXP } from "./download";
import { MediaNotFound } from "./errors";
import { getMedia } from "./get";

export function downloadMediaMiddleware() {
  const router = Router();

  router.get("/*path", async (req, res) => {
    const path = await Path.parseAsync(req.params.path.join("/")).catch(() =>
      never(new MediaNotFound()),
    );

    const media = (await getMedia({ path })) ?? never(new MediaNotFound());

    if (
      media.metadata.type !== "file" ||
      !DOWNLOADABLE_FILE_TYPE_REGEXP.test(media.metadata.fileType)
    )
      return res.sendStatus(415);

    return res.redirect(getHetznerFileUrl(media.metadata.storageKey));
  });

  return router;
}
