import { Method as protobufMethod } from "protobufjs";

export class Method {
  constructor(
    public protobufMethod: protobufMethod,
    public visited: boolean = false,
  ) {}
}
