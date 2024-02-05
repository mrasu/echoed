import { Eta } from "eta";

export const buildNoEscapeEta = (views: string): Eta => {
  return new Eta({
    views: views,
    autoEscape: false,
    cache: true,
  });
};
