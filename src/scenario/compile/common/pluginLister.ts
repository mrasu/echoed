export interface PluginLister {
  getUsedRunners(): Set<string>;
  getUsedAsserters(): Set<string>;
}
