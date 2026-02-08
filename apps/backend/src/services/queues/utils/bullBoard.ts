import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { emailQueue } from "../emailQueue";

export const createBullBoardSetup = () => {
	const baseQueuesPath = "/api/v1/queues";

	const queuesServerAdapter = new HonoAdapter(serveStatic).setBasePath(baseQueuesPath);

	createBullBoard({
		queues: [new BullMQAdapter(emailQueue)],
		serverAdapter: queuesServerAdapter,
	});

	return {
		baseQueuesPath,
		queuesServerAdapter,
	};
};
