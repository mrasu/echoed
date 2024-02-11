import { IDirectory } from "@/fs/iDirectory";
import { Eta } from "eta";

export const buildNoEscapeEta = (viewsDirectory: IDirectory): Eta => {
  return new Eta({
    views: viewsDirectory.path,
    autoEscape: false,
    cache: true,
  });
};
