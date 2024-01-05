import { Service as protobufService } from "protobufjs";
import { Method } from "@/coverage/proto/method";

export class Service {
  service: protobufService;
  methods: Map<string, Method>;

  constructor(service: protobufService) {
    this.service = service;

    this.methods = new Map<string, Method>();
    for (const method of service.methodsArray) {
      this.methods.set(method.name, new Method(method));
    }
  }

  get rpcServiceName(): string {
    // remove leading dot from `fullName`
    //
    // c.f. definition of ReflectionObject.fullName
    // > /** Full name including leading dot. */
    // > public readonly fullName: string;
    return this.service.fullName.replace(/^\./, "");
  }

  isInTargettedService(targetServices: Set<string> | undefined): boolean {
    if (!targetServices) return true;
    if (targetServices.has(this.service.name)) return true;
    if (targetServices.has(this.rpcServiceName)) return true;

    return false;
  }
}
