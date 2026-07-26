import { UUID } from "@isis/common/dto/uuid";
import { never } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { JsonWebTokenError, sign, verify } from "jsonwebtoken";
import z from "zod";

class UnauthorizedError extends Error {}

export const JWT_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export type JWT = z.infer<typeof JWT>;

export const JWT = Object.assign(
  z.object({
    userId: z.string().refine(ID.guard("User")),
    uuid: UUID,
  }),
  {
    create(userId: ID<"User">) {
      const payload = { userId, uuid: UUID.create() };

      return {
        payload,
        token: sign(
          payload,
          process.env.JWT_SECRET ?? never("JWT_SECRET not defined"),
          {
            algorithm: "HS256",
            expiresIn: JWT_MAX_AGE / 1000,
          },
        ),
      };
    },

    async parseToken(token: string) {
      try {
        const payload = verify(
          token,
          process.env.JWT_SECRET ?? never("JWT_SECRET not defined"),
          {
            algorithms: ["HS256"],
          },
        );
        return JWT.parse(payload);
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new JWT.UnauthorizedError();
        }

        throw error;
      }
    },

    UnauthorizedError,
  },
);
