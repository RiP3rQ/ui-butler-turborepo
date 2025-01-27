import { registerAs } from "@nestjs/config";
import * as Joi from "joi";

export const redisConfigSchema = Joi.object({
  REDIS_URL: Joi.string().required(),
  REDIS_TOKEN: Joi.string().required(),
});

export const redisConfig = registerAs("redis", () => ({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
}));
