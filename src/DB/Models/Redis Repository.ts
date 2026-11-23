import { InternalServerErrorException } from "../../Utils/Response/Error.Response";
import { redisClient } from "./Redis.connection";




// Interfaces
interface IRevokeTokenKey {
  userId: string;
}

interface IRevokeToken {
  userId: string;
  jti: string;
}

interface ISet {
  Key: string;
  Value: unknown;
  ttl?: number | null;
}

interface IGet {
  Key: string;
}

interface IDel {
  Key: string;
}

interface IExpire {
  Key: string;
  ttl: number;
}

interface ITtl {
  Key: string;
}

interface IKeys {
  pattern: string;
}

// Generate Keys
export const revokeTokenKeyPrefix = ({ userId }: IRevokeTokenKey): string => {
  return `user:revokeToken:${userId}`;
};


export const revokeTokenKey = ({ userId, jti }: IRevokeToken): string => {
  return `${revokeTokenKeyPrefix({ userId })}:${jti}`;
};

// Set
export const set = async ({
  Key,
  Value,
  ttl = null,
}: ISet): Promise<string | null | undefined> => {
  try {
    const data = typeof Value !== "string" ? JSON.stringify(Value) : Value;

    if (data === undefined) {
      throw new Error("Invalid Redis value");
    }

    if (ttl !== null && ttl > 0) {
      return await redisClient.set(Key, data, {
        EX: ttl,
      });
    }

    return await redisClient.set(Key, data);
  } catch (error: unknown) {
    console.error("Redis Set Error:", error);

    throw new InternalServerErrorException(
      "Failed to set Redis value",
      { cause: error }
    );
  }
};

// Get
export const get = async ({
  Key,
}: IGet): Promise<string | null | undefined> => {
  try {
    return await redisClient.get(Key);
  } catch (error: unknown) {
    console.error("Redis Get Error:", error);

    throw new InternalServerErrorException(
      "Failed to get Redis value",
      { cause: error }
    );
  }
};

// Update
// دي بتعمل تحديث لقيمة موجودة.
export const update = async ({
  Key,
  Value,
  ttl = null,
}: ISet): Promise<string | null | boolean | undefined> => {
  try {
    const isExists = await redisClient.exists(Key);

    if (!isExists) return false;

    const data = typeof Value !== "string" ? JSON.stringify(Value) : Value;

    if (data === undefined) {
      throw new Error("Invalid Redis value");
    }

    if (ttl !== null && ttl > 0) {
      return await redisClient.set(Key, data, {
        EX: ttl,
      });
    }

    return await redisClient.set(Key, data);
  } catch (error: unknown) {
    console.error("Redis Update Error:", error);

    throw new InternalServerErrorException(
      "Failed to update Redis value",
      { cause: error }
    );
  }
};

// Delete
export const del = async ({ Key }: IDel): Promise<number | undefined> => {
  try {
    return await redisClient.del(Key);
  } catch (error: unknown) {
    console.error("Redis Delete Error:", error);

    throw new InternalServerErrorException(
      "Failed to delete Redis key",
      { cause: error }
    );
  }
};

// Expire
// دي بتحدد مدة صلاحية لمفتاح موجود.
export const expire = async ({
  Key,
  ttl,
}: IExpire): Promise<number | undefined> => {
  try {
    return await redisClient.expire(Key, ttl);
  } catch (error: unknown) {
    console.error("Redis Expire Error:", error);

    throw new InternalServerErrorException(
      "Failed to set Redis expiration",
      { cause: error }
    );
  }
};

// TTL
// دي بتعرفك الوقت المتبقي قبل انتهاء صلاحية المفتاح.
export const ttl = async ({ Key }: ITtl): Promise<number | undefined> => {
  try {
    return await redisClient.ttl(Key);
  } catch (error: unknown) {
    console.error("Redis TTL Error:", error);

    throw new InternalServerErrorException(
      "Failed to get Redis TTL",
      { cause: error }
    );
  }
};

// Keys
export const Keys = async ({
  pattern,
}: IKeys): Promise<string[] | undefined> => {
  try {
    return await redisClient.keys(pattern);
  } catch (error: unknown) {
    console.error("Redis Keys Error:", error);

    throw new InternalServerErrorException(
      "Failed to retrieve Redis keys",
      { cause: error }
    );
  }
};
