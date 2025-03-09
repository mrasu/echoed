import Redis from "ioredis";

export class CartRedis {
  static async connect(): Promise<CartRedis> {
    const redisPort = "6379"

    const redisClient = new Redis(redisPort);
    return new CartRedis(redisClient);
  }

  constructor(private readonly redisClient: Redis) {}

  async store(userId: string, productId: string, quantity: number) {
    const quantityHexBin = String.fromCharCode(quantity);

    // Because opentelemetry-demo stores cart's data as a protobuf format, convert arguments to the format.
    await this.redisClient.hset(
      userId,
      "cart",
      `\n$${userId}\x12\x0e\n\n${productId}\x10${quantityHexBin}`,
    );
  }

  async quit() {
    await this.redisClient.quit();
  }

  async resetUser(userId: string) {
    await this.redisClient.del(userId);
  }
}
