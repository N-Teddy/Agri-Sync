import type { FieldBoundary } from '../types/field-boundary.type';

const EARTH_RADIUS_METERS = 6378137;

const degToRad = (value: number) => (value * Math.PI) / 180;

const projectToMeters = (lon: number, lat: number): [number, number] => {
	const x = EARTH_RADIUS_METERS * degToRad(lon);
	const clampedLat = Math.min(Math.max(lat, -89.9999), 89.9999);
	const y =
		EARTH_RADIUS_METERS *
		Math.log(Math.tan(Math.PI / 4 + degToRad(clampedLat) / 2));
	return [x, y];
};

export const calculateFieldAreaHectares = (boundary: FieldBoundary): number => {
	const [outerRing] = boundary.coordinates;
	let area = 0;

	for (let i = 0; i < outerRing.length - 1; i += 1) {
		const [x1, y1] = projectToMeters(outerRing[i][0], outerRing[i][1]);
		const [x2, y2] = projectToMeters(
			outerRing[i + 1][0],
			outerRing[i + 1][1]
		);
		area += x1 * y2 - x2 * y1;
	}

	const areaInSquareMeters = Math.abs(area) / 2;
	const areaInHectares = areaInSquareMeters / 10000;

	return Number(areaInHectares.toFixed(2));
};

export const calculateFieldCentroid = (
	boundary: FieldBoundary
): { lat: number; lng: number } => {
	const [outerRing] = boundary.coordinates;
	if (!outerRing || outerRing.length < 3) {
		throw new Error('Field boundary must include at least three points');
	}

	// Ignore final coordinate if it repeats the first point for a closed polygon
	const points =
		outerRing[0][0] === outerRing[outerRing.length - 1][0] &&
		outerRing[0][1] === outerRing[outerRing.length - 1][1]
			? outerRing.slice(0, -1)
			: outerRing;

	let sumLat = 0;
	let sumLng = 0;

	for (const [lng, lat] of points) {
		sumLat += lat;
		sumLng += lng;
	}

	const count = points.length || 1;

	return {
		lat: sumLat / count,
		lng: sumLng / count,
	};
};
