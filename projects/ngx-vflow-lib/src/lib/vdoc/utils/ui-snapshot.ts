import { UISnapshot } from "../interfaces/ui-snapshot.interface";

export function hasClasses(snapshot: UISnapshot, ...classList: string[]) {
  return classList.every((c) => snapshot.classes.has(c))
}
