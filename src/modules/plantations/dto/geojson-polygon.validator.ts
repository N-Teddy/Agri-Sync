import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

import { FieldBoundary } from '../types/field-boundary.type';

@ValidatorConstraint({ name: 'GeoJsonPolygon', async: false })
export class GeoJsonPolygonConstraint implements ValidatorConstraintInterface {
	validate(value: FieldBoundary) {
		if (
			!value ||
			value.type !== 'Polygon' ||
			!Array.isArray(value.coordinates)
		) {
			return false;
		}

		const [outerRing] = value.coordinates;
		if (!Array.isArray(outerRing) || outerRing.length < 4) {
			return false;
		}

		for (const coord of outerRing) {
			if (
				!Array.isArray(coord) ||
				coord.length !== 2 ||
				coord.some((point) => typeof point !== 'number')
			) {
				return false;
			}
			const [lng, lat] = coord;
			if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
				return false;
			}
		}

		const [firstLon, firstLat] = outerRing[0];
		const [lastLon, lastLat] = outerRing[outerRing.length - 1];
		return firstLon === lastLon && firstLat === lastLat;
	}

	defaultMessage(_args?: ValidationArguments) {
		void _args;
		return 'Boundary must be a valid GeoJSON Polygon with closed coordinates';
	}
}
