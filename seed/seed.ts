import { Logger } from '@nestjs/common';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

enum CropType {
  COFFEE_ARABICA = 'coffee_arabica',
  COFFEE_ROBUSTA = 'coffee_robusta',
  COCOA = 'cocoa',
  PLANTAIN = 'plantain',
  BANANA = 'banana',
  MAIZE = 'maize',
}

enum ActivityType {
  LAND_PREPARATION = 'land_preparation',
  PLANTING = 'planting',
  FERTILIZER_APPLICATION = 'fertilizer_application',
  SPRAYING = 'spraying',
  WEEDING = 'weeding',
  HARVESTING = 'harvesting',
}

// Helper to generate a random polygon
const generatePolygon = () => {
  // Generate a random center point roughly within Cameroon (lat 2-13, lng 8-16)
  const centerLat = 4 + Math.random() * 2; // South West region roughly
  const centerLng = 9 + Math.random() * 1;
  const size = 0.001 + Math.random() * 0.005;

  return {
    type: 'Polygon',
    coordinates: [
      [
        [centerLng, centerLat],
        [centerLng + size, centerLat],
        [centerLng + size, centerLat + size],
        [centerLng, centerLat + size],
        [centerLng, centerLat],
      ],
    ],
  };
};

const generateRandomUser = (index: number) => ({
  email: `user${index}.${Math.random().toString(36).substring(7)}@example.com`,
  password: 'Password123!',
  fullName: `User ${index} ${Math.random().toString(36).substring(7)}`,
  phoneNumber: `+2376${Math.floor(10000000 + Math.random() * 90000000)}`,
});

const staticUsers = [
  {
    email: 'john.doe@example.com',
    password: 'Password123!',
    fullName: 'John Doe',
    phoneNumber: '+237670000001',
  },
  {
    email: 'jane.smith@example.com',
    password: 'Password123!',
    fullName: 'Jane Smith',
    phoneNumber: '+237670000002',
  },
  {
    email: 'bob.jones@example.com',
    password: 'Password123!',
    fullName: 'Bob Jones',
    phoneNumber: '+237670000003',
  },
  {
    email: 'alice.williams@example.com',
    password: 'Password123!',
    fullName: 'Alice Williams',
    phoneNumber: '+237670000004',
  },
  {
    email: 'charlie.brown@example.com',
    password: 'Password123!',
    fullName: 'Charlie Brown',
    phoneNumber: '+237670000005',
  },
];

// Generate 10 more random users
const randomUsers = Array.from({ length: 10 }, (_, i) =>
  generateRandomUser(i + 1),
);
const users = [...staticUsers, ...randomUsers];

async function seed() {
  const logger = new Logger('Seed');
  logger.log('🌱 Starting seed process...');

  for (const user of users) {
    try {
      logger.log(`Processing user: ${user.email}`);

      // 1. Register or Login
      let token = '';
      try {
        await axios.post(`${API_URL}/auth/register`, user);
        logger.log('  ✅ Registered');
      } catch (error: any) {
        if (error.response?.status === 409) {
          logger.log('  ℹ️ User already exists');
        } else {
          logger.error(
            `  ❌ Registration failed: ${error.response?.data?.message || error.message}`,
          );
        }
      }

      // Login to get token
      try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
          email: user.email,
          password: user.password,
        });
        token = loginRes.data.data.accessToken;
        logger.log('  ✅ Logged in');
      } catch (error: any) {
        logger.error(
          `  ❌ Login failed: ${error.response?.data?.message || error.message}`,
        );
        continue; // Skip to next user if login fails
      }

      const authHeaders = { Authorization: `Bearer ${token}` };

      // 2. Create Plantations (1-3 per user)
      const numPlantations = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numPlantations; i++) {
        const plantationData = {
          name: `${user.fullName.split(' ')[0]}'s Estate ${i + 1}`,
          location: ['Buea', 'Limbe', 'Tiko', 'Kumba', 'Muyuka'][
            Math.floor(Math.random() * 5)
          ],
          region: 'South-West',
        };

        let plantationId = '';
        try {
          const res = await axios.post(
            `${API_URL}/plantations`,
            plantationData,
            { headers: authHeaders },
          );
          plantationId = res.data.data.id;
          logger.log(`    ✅ Created Plantation: ${plantationData.name}`);
        } catch (error: any) {
          logger.error(
            `    ❌ Failed to create plantation: ${error.response?.data?.message || error.message}`,
          );
          continue;
        }

        // 3. Create Fields (2-5 per plantation)
        const numFields = Math.floor(Math.random() * 4) + 2;
        for (let j = 0; j < numFields; j++) {
          const fieldData = {
            name: `Block ${String.fromCharCode(65 + j)}`,
            soilType: ['Loamy', 'Clay', 'Sandy', 'Volcanic'][
              Math.floor(Math.random() * 4)
            ],
            boundary: generatePolygon(),
          };

          let fieldId = '';
          try {
            const res = await axios.post(
              `${API_URL}/plantations/${plantationId}/fields`,
              fieldData,
              { headers: authHeaders },
            );
            fieldId = res.data.data.id;
            logger.log(`      ✅ Created Field: ${fieldData.name}`);
          } catch (error: any) {
            logger.error(
              `      ❌ Failed to create field: ${error.response?.data?.message || error.message}`,
            );
            continue;
          }

          // 4. Create Planting Seasons (1 per field to avoid conflicts)
          // Reduced to 1 season per field to prevent "active or planned season" conflicts
          const numSeasons = 1;
          for (let k = 0; k < numSeasons; k++) {
            const cropType =
              Object.values(CropType)[
              Math.floor(Math.random() * Object.values(CropType).length)
              ];
            const plantingDate = new Date(
              Date.now() - Math.random() * 10000000000,
            )
              .toISOString()
              .split('T')[0]; // Random date in past

            const seasonData = {
              cropType,
              plantingDate,
              expectedHarvestDate: new Date(
                new Date(plantingDate).getTime() +
                1000 * 60 * 60 * 24 * 180,
              )
                .toISOString()
                .split('T')[0], // +6 months
            };

            let seasonId = '';
            try {
              const res = await axios.post(
                `${API_URL}/fields/${fieldId}/planting-seasons`,
                seasonData,
                { headers: authHeaders },
              );
              seasonId = res.data.data.id;
              logger.log(
                `        ✅ Created Season: ${cropType} (${plantingDate})`,
              );
            } catch (error: any) {
              if (error.response?.status === 400) {
                logger.warn(
                  `        ⚠️ Skipping season creation: ${error.response?.data?.message}`,
                );
              } else {
                logger.error(
                  `        ❌ Failed to create season: ${error.response?.data?.message || error.message}`,
                );
              }
              continue;
            }

            // 5. Create Activities (3-8 per season)
            const numActivities = Math.floor(Math.random() * 6) + 3;
            for (let l = 0; l < numActivities; l++) {
              const activityType =
                Object.values(ActivityType)[
                Math.floor(Math.random() * Object.values(ActivityType).length)
                ];
              const activityDate = new Date(
                new Date(plantingDate).getTime() +
                Math.random() * 1000 * 60 * 60 * 24 * 100,
              )
                .toISOString()
                .split('T')[0];

              const activityData = {
                activityType,
                activityDate,
                notes: `Routine ${activityType} activity`,
                inputProduct:
                  Math.random() > 0.5 ? 'Fertilizer X' : undefined,
                inputCostXaf:
                  Math.random() > 0.5
                    ? Math.floor(Math.random() * 50000)
                    : undefined,
                plantingSeasonId: seasonId,
              };

              try {
                await axios.post(
                  `${API_URL}/fields/${fieldId}/activities`,
                  activityData,
                  { headers: authHeaders },
                );
                // logger.log(`          ✅ Logged Activity: ${activityType}`);
              } catch (error: any) {
                logger.error(
                  `          ❌ Failed to log activity: ${error.response?.data?.message || error.message}`,
                );
              }
            }

            // 6. Financial Records
            // Costs
            const numCosts = Math.floor(Math.random() * 5) + 1;
            for (let m = 0; m < numCosts; m++) {
              const costData = {
                amountXaf: Math.floor(Math.random() * 100000) + 5000,
                recordDate: new Date(
                  Date.now() - Math.random() * 10000000000,
                )
                  .toISOString()
                  .split('T')[0],
                productName: 'Farming Tools',
                description: 'Purchase of equipment',
              };
              try {
                await axios.post(
                  `${API_URL}/fields/${fieldId}/financial-records/costs`,
                  costData,
                  { headers: authHeaders },
                );
              } catch (error: any) {
                logger.error(
                  `          ❌ Failed to record cost: ${error.response?.data?.message || error.message}`,
                );
              }
            }

            // Revenue (only if harvest passed, but let's add some anyway for testing)
            const numRevenue = Math.floor(Math.random() * 3);
            for (let n = 0; n < numRevenue; n++) {
              const revenueData = {
                cropType,
                quantityKg: Math.floor(Math.random() * 1000) + 100,
                pricePerKgXaf: Math.floor(Math.random() * 2000) + 500,
                recordDate: new Date().toISOString().split('T')[0],
                buyerName: 'Local Market',
              };
              try {
                await axios.post(
                  `${API_URL}/fields/${fieldId}/financial-records/revenue`,
                  revenueData,
                  { headers: authHeaders },
                );
              } catch (error: any) {
                logger.error(
                  `          ❌ Failed to record revenue: ${error.response?.data?.message || error.message}`,
                );
              }
            }
          }
        }
      }
    } catch (err) {
      logger.error(`Error processing user: ${err}`);
    }
  }

  logger.log('🌱 Seed process completed!');
}

void seed();
