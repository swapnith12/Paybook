import { Redis, type RedisOptions } from "ioredis";

class RedisClient {
  private static instance: Redis;
    private static isConnected = false;
  private constructor() {
    // Private constructor prevents direct instantiation via 'new'
  }

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      const options: RedisOptions = {
        host: "localhost",
        port: 6379,
        password: process.env.REDIS_PASSWORD,
        retryStrategy: (times: number) => {
          return Math.min(times * 50, 2000);
        },
      };

      RedisClient.instance = new Redis(options);
      RedisClient.setupEventListeners();
    }

    return RedisClient.instance;
  }
   private static setupEventListeners(): void {
    RedisClient.instance.on('connect', () => {
      RedisClient.isConnected = true;
      console.log('Connected to Redis');
    });

    RedisClient.instance.on('error', (error) => {
      RedisClient.isConnected = false;
      console.log('Redis connection error:', error);
    });

    RedisClient.instance.on('close', () => {
      RedisClient.isConnected = false;
      console.log('Redis connection closed');
    });

    RedisClient.instance.on('reconnecting', () => {
      console.log('Reconnecting to Redis...');
    });
  }

  public static isReady(): boolean {
    return RedisClient.isConnected;
  }
}

export default RedisClient.getInstance();