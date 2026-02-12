import type { EmailJobOptions } from "@medinfo/transactional/emails/templates";
import { Queue, QueueEvents, Worker } from "bullmq";
import { consola } from "consola";
import { sendEmail } from "../email/send";
import { redisQueueClient } from "./utils/queueClient";

const emailQueueKey = "emailQueue";

export const emailQueue = new Queue<EmailJobOptions>(emailQueueKey, {
	connection: redisQueueClient,
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			delay: 1000,
			type: "exponential",
		},
	},
});

export const addEmailToQueue = async (options: EmailJobOptions) => {
	const { data, type } = options;

	try {
		await emailQueue.add(type, options, {
			...(data.priority !== "high" && { priority: 2 }),
		});
	} catch (error) {
		consola.error(`Failed to enqueue '${type}' email to '${data.to}'`, error);

		throw error;
	}
};

// == Lazy initialization - only create when Redis is connected
let emailWorker: Worker<EmailJobOptions> | null = null;
let emailQueueEvent: QueueEvents | null = null;

const getEmailWorker = () => {
	emailWorker ??= new Worker<EmailJobOptions>(
		emailQueueKey,
		async (job) => {
			await sendEmail(job.data);
		},
		{
			connection: redisQueueClient,
			limiter: {
				duration: 1000,
				max: 1,
			},
			lockDuration: 5000,
			removeOnComplete: {
				age: 1 * 60 * 60,
				count: 1000,
			},
			removeOnFail: {
				age: 24 * 60 * 60,
			},
		}
	);

	emailWorker.on("error", (error) => {
		consola.error(`Error processing email job: ${error.message}`, error);
	});

	emailWorker.on("stalled", (jobId) => {
		consola.warn(`Job ${jobId} stalled - will be retried by another worker`);
	});

	return emailWorker;
};

const getEmailQueueEvents = () => {
	emailQueueEvent ??= new QueueEvents(emailQueueKey, { connection: redisQueueClient });

	emailQueueEvent.on("failed", ({ failedReason, jobId }) => {
		consola.error(`Job ${jobId} failed with error ${failedReason}`, failedReason);
	});

	emailQueueEvent.on("waiting", ({ jobId }) => {
		consola.info(`A job with ID ${jobId} is waiting`);
	});

	emailQueueEvent.on("completed", ({ jobId, returnvalue }) => {
		consola.info(`Job ${jobId} completed`, returnvalue);
	});

	emailQueueEvent.on("retries-exhausted", ({ attemptsMade, jobId }) => {
		consola.error(`Job ${jobId} failed after ${attemptsMade} attempts - no more retries`);
	});

	emailQueueEvent.on("progress", ({ data, jobId }) => {
		consola.debug(`Job ${jobId} progress:`, data);
	});

	return emailQueueEvent;
};

export const startEmailQueueAndWorker = async () => {
	// == Ensure Redis is connected before creating Worker/QueueEvents
	if (redisQueueClient.status === "wait") {
		await redisQueueClient.connect();
	}

	// == Now create Worker and QueueEvents (Redis is ready)
	const worker = getEmailWorker();
	const queueEvents = getEmailQueueEvents();

	await Promise.all([emailQueue.waitUntilReady(), queueEvents.waitUntilReady(), worker.waitUntilReady()]);

	consola.info("Email queue and worker are ready!");
};

export const stopEmailQueueAndWorker = async () => {
	await Promise.all([emailWorker?.close(), emailQueueEvent?.close(), emailQueue.close()]);

	consola.info("Email queue and worker closed!");
};
