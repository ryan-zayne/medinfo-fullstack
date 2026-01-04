/* eslint-disable unicorn/no-process-exit */
/* eslint-disable node/no-process-exit */

import { consola } from "consola";
import { seedDiseases, seedUsers } from "./seeders";

const runSeeders = async () => {
	consola.info("🌱 Seeding started...");

	try {
		await Promise.all([seedDiseases(), seedUsers()]);

		consola.success("✅ Seeding completed!");
		process.exit(0);
	} catch (error) {
		consola.error("❌ Seeding failed:", error);
		process.exit(1);
	}
};

await runSeeders();
