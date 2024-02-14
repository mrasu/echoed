import Docker from "dockerode";
import Redis from "ioredis";

const REDIS_CONTAINER_NAME = "redis-cart";
const REDIS_NETWORK_KEY = "6379/tcp";

const getRedisPortInDocker = async (): Promise<string> => {
  const docker = new Docker();

  const containers = await docker.listContainers();
  const containerId = containers.find((container) => container.Names.includes(`/${REDIS_CONTAINER_NAME}`))?.Id;
  if (!containerId) {
    throw new Error(`Container not found. container: ${REDIS_CONTAINER_NAME}`);
  }

  const container = docker.getContainer(containerId);
  const containerInfo = await container.inspect()
  const portSetting = containerInfo.NetworkSettings.Ports[REDIS_NETWORK_KEY]
  if (!portSetting) {
    throw new Error(`Port not found for container. container: ${REDIS_CONTAINER_NAME}, containerId: ${containerId}, network: ${REDIS_NETWORK_KEY}`);
  }
  if (portSetting.length === 0) {
    throw new Error(`Port not found for container. container: ${REDIS_CONTAINER_NAME}, containerId: ${containerId}, network: ${REDIS_NETWORK_KEY}`);
  }

  return portSetting[0].HostPort
}

export class CartRedis {
  static async connect(): Promise<CartRedis> {
    const redisPort = await getRedisPortInDocker();

    const redisClient = new Redis(redisPort);
    return new CartRedis(redisClient);
  }

  constructor(private readonly redisClient: Redis) {}

  async store(userId: string, productId: string, quantity: number) {
    const quantityHexBin = String.fromCharCode(quantity);

    // Because opentelemetry-demo stores cart's data as a protobuf format, convert arguments to the format.
    await this.redisClient.hset(userId, "cart", `\n$${userId}\x12\x0e\n\n${productId}\x10${quantityHexBin}`)
  }

  async quit() {
    await this.redisClient.quit();
  }

  async resetUser(userId: string) {
    await this.redisClient.del(userId)
  }
}
