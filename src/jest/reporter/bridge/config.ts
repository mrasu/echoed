import { TobikuraConfig } from "@/config/tobikuraConfig";

export function loadTobikuraConfig(filepath: string): TobikuraConfig {
  return TobikuraConfig.load(filepath);
}
