import type { SelectUserType } from "@medinfo/backend-db/schema/auth";
import type { DoctorUserSchemaType } from "@medinfo/shared/validation/backendApiSchema";
import { getTopDoctors } from "@/app/appointments/services/matchDoctorAlgorithm";

// Comprehensive list of doctors across specialties
const mockDoctors = [
	{ firstName: "Alice", id: "1", lastName: "Neuro", specialty: "Neurology" },
	{ firstName: "Bob", id: "2", lastName: "Cardio", specialty: "Cardiology" },
	{ firstName: "Charlie", id: "3", lastName: "Derma", specialty: "Dermatology" },
	{ firstName: "Diana", id: "4", lastName: "Psych", specialty: "Psychiatry" },
	{ firstName: "Eve", id: "5", lastName: "General", specialty: "General Practice" },
	{ firstName: "Frank", id: "6", lastName: "Ortho", specialty: "Orthopedics" },
	{ firstName: "Grace", id: "7", lastName: "Gastro", specialty: "Gastroenterology" },
	{ firstName: "Henry", id: "8", lastName: "Pulmo", specialty: "Pulmonology" },
	{ firstName: "Ivy", id: "9", lastName: "Endo", specialty: "Endocrinology" },
	{ firstName: "Jack", id: "10", lastName: "Ophthal", specialty: "Ophthalmology" },
] satisfies Array<Partial<SelectUserType>>;

// Test cases with expected top specialty
const testCases = [
	{
		expectedTop: "Neurology",
		reason: "I have been having severe headaches and migraines for a long while now",
	},
	{
		expectedTop: "Cardiology",
		reason: "I feel chest pain and my heart beats irregularly",
	},
	{
		expectedTop: "Dermatology",
		reason: "I have a rash on my skin that won't go away and is very itchy",
	},
	{
		expectedTop: "Psychiatry",
		reason: "I've been feeling very anxious and depressed lately, can't sleep",
	},
	{
		expectedTop: "Orthopedics",
		reason: "My knee hurts badly after I fell, I think it might be broken",
	},
	{
		expectedTop: "Gastroenterology",
		reason: "I have stomach pain, bloating, and acid reflux after eating",
	},
	{
		expectedTop: "Pulmonology",
		reason: "I have difficulty breathing and a persistent cough",
	},
	{
		expectedTop: "Endocrinology",
		reason: "I'm always thirsty, urinating frequently, and my blood sugar is high",
	},
	{
		expectedTop: "Ophthalmology",
		reason: "My vision is getting blurry and my eyes hurt",
	},
];

console.info("🧪 Testing Doctor Matching Algorithm\n");
console.info(`${"=".repeat(60)}\n`);

let passed = 0;
let failed = 0;
const startTime = Date.now();

for (const testCase of testCases) {
	// eslint-disable-next-line no-await-in-loop
	const topDoctors = await getTopDoctors({
		doctors: mockDoctors as DoctorUserSchemaType[],
		limit: 3,
		reason: testCase.reason,
	});

	const topMatch = topDoctors[0];
	const isCorrect = topMatch?.specialty === testCase.expectedTop;

	if (isCorrect) {
		passed++;
		console.info(`✅ PASS`);
	} else {
		failed++;
		console.info(`❌ FAIL`);
	}

	console.info(`   Reason: "${testCase.reason.slice(0, 50)}..."`);
	console.info(`   Expected: ${testCase.expectedTop}`);
	console.info(
		`   Got: ${topMatch?.specialty ?? "None"} (${topMatch?.similarityScore.toFixed(4) ?? "N/A"})`
	);
	console.info("");
}

const endTime = Date.now();

console.info("=".repeat(60));
console.info(`\n📊 Results: ${passed}/${testCases.length} tests passed`);
console.info(`   ✅ Passed: ${passed}`);
console.info(`   ❌ Failed: ${failed}`);
console.info(`   Accuracy: ${((passed / testCases.length) * 100).toFixed(1)}%`);
console.info(`\n⏱️  Total Execution Time: ${endTime - startTime}ms`);
console.info(`   Average per test: ${((endTime - startTime) / testCases.length).toFixed(0)}ms`);
