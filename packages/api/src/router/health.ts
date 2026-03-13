import { publicProcedure } from "../lib/procedures";

export default publicProcedure.health.handler(async () => {
  return {
    status: "healthy",
    timestamp: new Date(),
  };
});
