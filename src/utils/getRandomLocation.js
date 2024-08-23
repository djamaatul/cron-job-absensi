import _ from 'lodash';

const getRandomLocation = () => {
	const locations = []

	const locationsFromEnvironment = process.env.LOCATIONS;
	if(locationsFromEnvironment){
		locations.push(...locationsFromEnvironment.split(';'))
	}

	return _.sample(locations);
};

export default getRandomLocation;