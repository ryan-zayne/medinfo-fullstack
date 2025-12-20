/* eslint-disable unicorn/no-process-exit */
/* eslint-disable node/no-process-exit */

import { consola } from "consola";
import { seedDiseases } from "./seeders";

const runSeeders = async () => {
	consola.info("🌱 Seeding started...");

	try {
		// eslint-disable-next-line unicorn/no-single-promise-in-promise-methods
		await Promise.all([seedDiseases()]);

		consola.success("✅ Seeding completed!");
		process.exit(0);
	} catch (error) {
		consola.error("❌ Seeding failed:", error);
		process.exit(1);
	}
};

await runSeeders();
