import { MouseEvent } from "react";

export function isRelatedTargetDescendent(e: MouseEvent) {
  return (
    e.relatedTarget &&
    e.relatedTarget instanceof HTMLElement &&
    e.currentTarget.contains(e.relatedTarget)
  );
}
