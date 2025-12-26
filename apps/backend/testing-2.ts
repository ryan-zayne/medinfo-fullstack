import type { SelectUserType } from "@medinfo/backend-db/schema/auth";
import type { DoctorUserSchemaType } from "@medinfo/shared/validation/backendApiSchema";
import { getTopDoctors } from "@/app/appointments/services/matchDoctorAlgorithm";

// Extended list of doctors with more specialties
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
	{ firstName: "Kate", id: "11", lastName: "Uro", specialty: "Urology" },
	{ firstName: "Leo", id: "12", lastName: "Onco", specialty: "Oncology" },
	{ firstName: "Mia", id: "13", lastName: "Gyn", specialty: "Gynecology" },
	{ firstName: "Noah", id: "14", lastName: "Pedia", specialty: "Pediatrics" },
	{ firstName: "Olivia", id: "15", lastName: "Rheum", specialty: "Rheumatology" },
] satisfies Array<Partial<SelectUserType>>;

// V2 Test cases - more varied and challenging
const testCases = [
	// === Neurology Tests ===
	{
		expectedTop: "Neurology",
		reason: "I have been having severe headaches and migraines for a long while now",
	},
	{ expectedTop: "Neurology", reason: "I'm experiencing numbness in my hands and feet" },
	{ expectedTop: "Neurology", reason: "I had a seizure yesterday and feel confused" },

	// === Cardiology Tests ===
	{ expectedTop: "Cardiology", reason: "I feel chest pain and my heart beats irregularly" },
	{
		expectedTop: "Cardiology",
		reason: "I get short of breath when climbing stairs and my legs are swollen",
	},

	// === Dermatology Tests ===
	{ expectedTop: "Dermatology", reason: "I have a rash on my skin that won't go away and is very itchy" },
	{ expectedTop: "Dermatology", reason: "There's a suspicious mole on my back that has changed color" },

	// === Psychiatry Tests ===
	{
		expectedTop: "Psychiatry",
		reason: "I've been feeling very anxious and depressed lately, can't sleep",
	},
	{ expectedTop: "Psychiatry", reason: "I'm hearing voices and have paranoid thoughts" },

	// === Orthopedics Tests ===
	{ expectedTop: "Orthopedics", reason: "My knee hurts badly after I fell, I think it might be broken" },
	{ expectedTop: "Orthopedics", reason: "I have chronic back pain that radiates down my leg" },

	// === Gastroenterology Tests ===
	{
		expectedTop: "Gastroenterology",
		reason: "I have stomach pain, bloating, and acid reflux after eating",
	},
	{ expectedTop: "Gastroenterology", reason: "I've been having bloody stools and abdominal cramps" },

	// === Pulmonology Tests ===
	{ expectedTop: "Pulmonology", reason: "I have difficulty breathing and a persistent cough" },
	{ expectedTop: "Pulmonology", reason: "I wheeze at night and have been coughing up mucus" },

	// === Endocrinology Tests ===
	{
		expectedTop: "Endocrinology",
		reason: "I'm always thirsty, urinating frequently, and my blood sugar is high",
	},
	{
		expectedTop: "Endocrinology",
		reason: "I'm gaining weight rapidly and feeling extremely tired, thyroid issues",
	},

	// === Ophthalmology Tests ===
	{ expectedTop: "Ophthalmology", reason: "My vision is getting blurry and my eyes hurt" },
	{ expectedTop: "Ophthalmology", reason: "I see floaters and flashing lights in my vision" },

	// === Urology Tests ===
	{ expectedTop: "Urology", reason: "I have pain when urinating and need to go frequently" },
	{ expectedTop: "Urology", reason: "There's blood in my urine and I have kidney pain" },

	// === Oncology Tests ===
	{ expectedTop: "Oncology", reason: "I found a lump in my body and I'm worried about cancer" },
	{ expectedTop: "Oncology", reason: "I've been losing weight unexpectedly and have night sweats" },

	// === Gynecology Tests ===
	{ expectedTop: "Gynecology", reason: "I have irregular periods and pelvic pain" },
	{ expectedTop: "Gynecology", reason: "I'm pregnant and need prenatal care" },

	// === Pediatrics Tests ===
	{ expectedTop: "Pediatrics", reason: "My child has a fever and is not eating well" },
	{ expectedTop: "Pediatrics", reason: "My baby has a rash and is crying constantly" },

	// === Rheumatology Tests ===
	{ expectedTop: "Rheumatology", reason: "My joints are swollen and painful, especially in the morning" },
	{ expectedTop: "Rheumatology", reason: "I have lupus symptoms with joint pain and fatigue" },
];

console.info("🧪 Testing Doctor Matching Algorithm (V2 - Extended)\n");
console.info(`${"=".repeat(70)}\n`);

let passed = 0;
let failed = 0;
const failures: Array<{ expected: string; got: string; reason: string }> = [];
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
		console.info(
			`✅ PASS | ${testCase.expectedTop.padEnd(18)} | Score: ${topMatch.similarityScore.toFixed(4)}`
		);
	} else {
		failed++;
		failures.push({
			expected: testCase.expectedTop,
			got: topMatch?.specialty ?? "None",
			reason: testCase.reason,
		});
		console.info(
			`❌ FAIL | Expected: ${testCase.expectedTop.padEnd(18)} | Got: ${topMatch?.specialty ?? "None"}`
		);
	}
}

const endTime = Date.now();

console.info(`\n${"=".repeat(70)}`);
console.info(`\n📊 Results: ${passed}/${testCases.length} tests passed`);
console.info(`   ✅ Passed: ${passed}`);
console.info(`   ❌ Failed: ${failed}`);
console.info(`   Accuracy: ${((passed / testCases.length) * 100).toFixed(1)}%`);

if (failures.length > 0) {
	console.info("\n🔍 Failed Cases:");
	for (const f of failures) {
		console.info(`   - Expected ${f.expected}, Got ${f.got}`);
		console.info(`     Reason: "${f.reason.slice(0, 60)}..."`);
	}
}

console.info(`\n⏱️  Total Execution Time: ${endTime - startTime}ms`);
console.info(`   Average per test: ${((endTime - startTime) / testCases.length).toFixed(0)}ms`);
