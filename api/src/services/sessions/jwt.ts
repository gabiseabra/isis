import { UUID } from "@isis/common/dto/uuid";
import { never } from "@isis/common/utils/error";
import { ID } from "@isis/common/utils/id";
import { sign, verify } from "jsonwebtoken";
import z from "zod";

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
            expiresIn: "7d",
          },
        ),
      };
    },

    parseToken(token: string) {
      const payload = verify(
        token,
        process.env.JWT_SECRET ?? never("JWT_SECRET not defined"),
        {
          algorithms: ["HS256"],
        },
      );
      return JWT.parse(payload);
    },
  },
);
