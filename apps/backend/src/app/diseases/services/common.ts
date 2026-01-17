export const shuffleArray = <TArray extends unknown[]>(array: TArray) => {
	const shuffledArray = [...array] as TArray;

	// == Using Fisher-Yates algorithm
	for (let lastIndex = shuffledArray.length - 1; lastIndex > 0; lastIndex--) {
		const randomIndex = Math.floor(Math.random() * (lastIndex + 1));

		[shuffledArray[lastIndex], shuffledArray[randomIndex]] = [
			shuffledArray[randomIndex],
			shuffledArray[lastIndex],
		];
	}

	return shuffledArray;
};
