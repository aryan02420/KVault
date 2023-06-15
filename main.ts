import { Application, Context, helpers, Middleware, Router, Status } from "oak";
import {
  deleteUserById,
  getAddressByUserId,
  getAllUsers,
  getUserByEmail,
  getUserById,
  readTextSecret,
  updateUserAndAddress,
  upsertUser,
} from "./db.ts";
import {
  createTextSecretInputSchema,
  CreateTextSecretInputType,
  fetchTextSecretInputSchema,
  FetchTextSecretInputType,
} from "./schema.ts";
import { z, ZodSchema } from "zod";
import { createTextSecret, stats } from "./controller.ts";

const { getQuery } = helpers;
const apiRouter = new Router();
const demoRouter = new Router();
const router = new Router();

const logErrors: Middleware = async (_, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
  }
};

const json: Middleware = async (ctx, next) => {
  const body = ctx.request.body();
  if (body.type !== "json") {
    ctx.throw(400, "Request body must be JSON");
  }
  const value = await body.value;
  ctx.state = value;
  await next();
};

const validateState =
  <TSchema extends ZodSchema>(schema: TSchema): Middleware =>
  async (ctx, next) => {
    const result = schema.safeParse(ctx.state);
    if (!result.success) {
      ctx.response.type = "application/json";
      ctx.response.status = Status.BadRequest;
      ctx.response.body = result.error.message;
      return;
    }
    ctx.state = ctx.state as z.infer<TSchema>;
    await next();
  };

apiRouter
  .use(json)
  .post(
    "/store",
    validateState(createTextSecretInputSchema),
    async (ctx: Context<CreateTextSecretInputType>) => {
      const state = ctx.state;
      const output = await createTextSecret(state);
      if (!output.id) {
        ctx.throw(Status.InternalServerError, "Error creating text secret.");
      }
      ctx.response.body = output;
    },
  )
  .post(
    "/view",
    validateState(fetchTextSecretInputSchema),
    async (ctx: Context<FetchTextSecretInputType>) => {
      const state = ctx.state;
      const result = await readTextSecret(state);
      if (!result) {
        ctx.throw(Status.NotFound, "Secret not found or already read.");
      }
      ctx.response.body = result;
    },
  )
  .post("/stats", async (ctx: Context) => {
    ctx.response.body = await stats();
  });

demoRouter
  .get("/users", async (ctx: Context) => {
    ctx.response.body = await getAllUsers();
  })
  .get("/users/:id", async (ctx: Context) => {
    const { id } = getQuery(ctx, { mergeParams: true });
    ctx.response.body = await getUserById(id);
  })
  .get("/users/email/:email", async (ctx: Context) => {
    const { email } = getQuery(ctx, { mergeParams: true });
    ctx.response.body = await getUserByEmail(email);
  })
  .get("/users/:id/address", async (ctx: Context) => {
    const { id } = getQuery(ctx, { mergeParams: true });
    ctx.response.body = await getAddressByUserId(id);
  })
  .post("/users", async (ctx: Context) => {
    const body = ctx.request.body();
    const user = await body.value;
    await upsertUser(user);
  })
  .post("/users/:id/address", async (ctx: Context) => {
    const { id } = getQuery(ctx, { mergeParams: true });
    const body = ctx.request.body();
    const address = await body.value;
    const user = await getUserById(id);
    await updateUserAndAddress(user, address);
  })
  .delete("/users/:id", async (ctx: Context) => {
    const { id } = getQuery(ctx, { mergeParams: true });
    await deleteUserById(id);
  });

const app = new Application();

app.use(logErrors);

router.use("/api", apiRouter.routes(), apiRouter.allowedMethods());
router.use("/demo", demoRouter.routes(), demoRouter.allowedMethods());
app.use(router.routes(), router.allowedMethods());

// static file serving
app.use(async (ctx, next) => {
  const root = `${Deno.cwd()}/public`;
  try {
    await ctx.send({
      root,
      index: "index.html",
    });
  } catch {
    next();
  }
});

// catch-all
app.use((ctx) => {
  ctx.response.status = Status.NotFound
  ctx.response.body = `"${ctx.request.url}" not found`
})


await app.listen({ port: 8080 });
