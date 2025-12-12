import type { FieldBoundary } from '../types/field-boundary.type';
import {
	calculateFieldAreaHectares,
	calculateFieldCentroid,
} from './field-geometry.util';

const buildSquarePolygon = (
	originLon: number,
	originLat: number,
	sizeDegrees = 0.001
): FieldBoundary => ({
	type: 'Polygon',
	coordinates: [
		[
			[originLon, originLat],
			[originLon + sizeDegrees, originLat],
			[originLon + sizeDegrees, originLat + sizeDegrees],
			[originLon, originLat + sizeDegrees],
			[originLon, originLat],
		],
	],
});

describe('calculateFieldAreaHectares', () => {
	it('calculates area in hectares for a simple square near the equator', () => {
		const boundary = buildSquarePolygon(9.31, 4.15);
		const area = calculateFieldAreaHectares(boundary);
		expect(area).toBeGreaterThan(1);
		expect(area).toBeLessThan(3);
	});

	it('returns higher area for larger polygons', () => {
		const small = calculateFieldAreaHectares(
			buildSquarePolygon(9.31, 4.15, 0.0005)
		);
		const large = calculateFieldAreaHectares(
			buildSquarePolygon(9.31, 4.15, 0.002)
		);
		expect(large).toBeGreaterThan(small);
	});
});

describe('calculateFieldCentroid', () => {
	it('computes centroid coordinates for a closed polygon', () => {
		const centroid = calculateFieldCentroid(buildSquarePolygon(9, 4, 0.01));
		expect(centroid.lat).toBeCloseTo(4.005, 3);
		expect(centroid.lng).toBeCloseTo(9.005, 3);
	});
});
