import { createClient } from "redis";
import { env } from "../../config/config.service";
import chalk from "chalk";
//   redis server المسئول عن الاتصال ب  client بتنشاء 
export const redisClient = createClient({
  url: env.REDIS_URL,
});


export const redisConnection = async (): Promise<void> => {
  try {
    await redisClient.connect();

    console.log(chalk.blue("Redis Connected Successfully"));
  } catch (error: unknown) {
    console.error("Redis connection error:", error);
    throw error
  }
};


/**
 * sudo service redis-server start

# 3) اختبار
redis-cli ping
 */