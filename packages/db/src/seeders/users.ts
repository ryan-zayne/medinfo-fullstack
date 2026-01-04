import { faker } from "@faker-js/faker";
import { hash } from "@node-rs/argon2";
import { consola } from "consola";
import { ENVIRONMENT } from "@/config/env";
import { db } from "../db";
import { users, type InsertUserType } from "../schema";

const MEDICAL_SPECIALTIES = [
	"Cardiology",
	"Dermatology",
	"Endocrinology",
	"Gastroenterology",
	"Neurology",
	"Oncology",
	"Ophthalmology",
	"Orthopedics",
	"Pediatrics",
	"Psychiatry",
	"Pulmonology",
	"Radiology",
	"Rheumatology",
	"Urology",
] as const;

const hashPassword = (password: string) => {
	return hash(password, {
		memoryCost: 19456,
		outputLen: 32,
		parallelism: 1,
		timeCost: 2,
	});
};

const generateFakeUser = (role: InsertUserType["role"], passwordHash: string) => {
	const gender = faker.helpers.arrayElement(["male", "female"]);
	const firstName = faker.person.firstName(gender);
	const lastName = faker.person.lastName();
	const avatar = `https://avatar.iran.liara.run/public/${gender === "male" ? "boy" : "girl"}`;

	const baseUser = {
		avatar,
		country: faker.location.country(),
		dob: faker.date.birthdate({ max: 65, min: 25, mode: "age" }).toISOString(),
		email: faker.internet.email({ firstName, lastName, provider: "seeded.com" }).toLowerCase(),
		firstName,
		fullName: `${firstName} ${lastName}`,
		gender,
		lastName,
		passwordHash,
		role,
	} satisfies InsertUserType;

	if (role === "doctor") {
		return {
			...baseUser,
			medicalLicense: faker.internet.url(),
			specialty: faker.helpers.arrayElement(MEDICAL_SPECIALTIES),
		} satisfies InsertUserType;
	}

	return baseUser;
};

export const seedUsers = async (totalCount = 20) => {
	const halfCount = Math.floor(totalCount / 2);

	const passwordHash = await hashPassword(ENVIRONMENT.SEED_PASSWORD);

	const doctors = Array.from({ length: halfCount }, () => generateFakeUser("doctor", passwordHash));
	const patients = Array.from({ length: halfCount }, () => generateFakeUser("patient", passwordHash));

	const allUsers = [...doctors, ...patients];

	consola.info(`Seeding ${allUsers.length} users (${halfCount} doctors, ${halfCount} patients)...`);
	consola.info(`All users have password: "${ENVIRONMENT.SEED_PASSWORD}"`);

	await db.insert(users).values(allUsers).onConflictDoNothing();

	consola.success(`Successfully seeded ${allUsers.length} users.`);
};
