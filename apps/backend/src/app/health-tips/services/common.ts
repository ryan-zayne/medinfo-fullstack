type RandomNumberOptions = {
	count: number;
	max: number;
	min?: number;
};

const generateRandomNumbers = (options: RandomNumberOptions) => {
	const { count, max, min = 0 } = options;

	const uniqueNumbers = new Set<number>();

	const range = max + 1 - min;

	while (uniqueNumbers.size < count) {
		const randomNumber = Math.floor(Math.random() * range) + min;

		uniqueNumbers.add(randomNumber);
	}

	return [...uniqueNumbers];
};

const healthTipIds = [
	25, 327, 329, 350, 510, 512, 514, 527, 528, 529, 530, 531, 532, 533, 534, 536, 537, 538, 539, 540, 541,
	542, 543, 544, 546, 547, 549, 551, 552, 553, 30530, 30531, 30532, 30533, 30534,
];

export const getRandomHealthTipIds = (count: number) => {
	const randomNumbers = generateRandomNumbers({ count, max: healthTipIds.length });

	const randomHealthTipIds = randomNumbers.map((number) => healthTipIds[number] as number);

	return randomHealthTipIds;
};
