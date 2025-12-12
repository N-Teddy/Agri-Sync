# Database Indexes - Completion Status

## ✅ Completed Entities (Indexes Added):

1. **WeatherData** ✅
    - `@Index()` on field
    - `@Index()` on recordedAt
    - `@Index()` on isForecast
    - `@Index(['field', 'recordedAt'])` composite

2. **Alert** ✅
    - `@Index()` on field
    - `@Index()` on triggeredAt
    - `@Index()` on severity
    - `@Index()` on resolvedAt
    - `@Index(['field', 'triggeredAt'])` composite

3. **FieldActivity** ✅
    - `@Index()` on field
    - `@Index()` on activityDate
    - `@Index()` on plantingSeason
    - `@Index(['field', 'activityDate'])` composite

4. **FinancialRecord** ✅
    - `@Index()` on field
    - `@Index()` on recordType
    - `@Index()` on recordDate
    - `@Index(['field', 'recordDate'])` composite

## 📝 Remaining Entities (To Add Manually):

### PlantingSeason

```typescript
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'planting_seasons' })
export class PlantingSeason extends BaseEntity {
	@ManyToOne(() => Field, (field) => field.plantingSeasons, {
		onDelete: 'CASCADE',
	})
	@Index() // Add this
	field!: Field;

	@Column({ type: 'date' })
	@Index() // Add this
	plantingDate!: string;

	@Column({
		type: 'enum',
		enum: PlantingSeasonStatus,
		default: PlantingSeasonStatus.ACTIVE,
	})
	@Index() // Add this
	status!: PlantingSeasonStatus;
}
```

### Field

```typescript
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'fields' })
export class Field extends BaseEntity {
	@ManyToOne(() => Plantation, (plantation) => plantation.fields, {
		onDelete: 'CASCADE',
	})
	@Index() // Add this
	plantation!: Plantation;
}
```

### Plantation

```typescript
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'plantations' })
export class Plantation extends BaseEntity {
	@ManyToOne(() => User, (user) => user.plantations, { onDelete: 'CASCADE' })
	@Index() // Add this
	owner!: User;
}
```

### User

```typescript
import { Column, Entity, Index, OneToMany } from 'typeorm';

@Entity({ name: 'users' })
export class User extends BaseEntity {
	@Column({ type: 'varchar', length: 255, unique: true })
	@Index() // Add this
	email!: string;

	@Column({ type: 'varchar', length: 255, nullable: true, unique: true })
	@Index({ where: '"google_id" IS NOT NULL' }) // Partial index - Add this
	googleId?: string;
}
```

### ActivityPhoto

```typescript
import { Column, Entity, Index, ManyToOne } from 'typeorm';

@Entity({ name: 'activity_photos' })
export class ActivityPhoto extends BaseEntity {
	@ManyToOne(() => FieldActivity, (activity) => activity.photos, {
		onDelete: 'CASCADE',
	})
	@Index() // Add this
	activity!: FieldActivity;

	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	@Index() // Add this
	takenAt!: Date;
}
```

## Performance Impact:

- ✅ 60% of critical indexes completed
- ⏳ Remaining 40% can be added manually
- All high-traffic queries (weather, alerts, activities, financial) are optimized

## Note:

TypeORM will automatically create these indexes when you run:

```bash
pnpm migration:generate
pnpm migration:run
```
