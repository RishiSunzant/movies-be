import { pool } from "../src/shared/db";
import { PoolClient } from "pg";

async function addSeats(
  client: PoolClient,
  screenId: string,
  opts: {
    rows: number;
    cols: number;
    aisleAfter?: number;
    premiumFromRow?: number;
  },
) {
  await client.query(
    `INSERT INTO seats (screen_id, row_label, seat_number, seat_type, grid_row, grid_col)
     SELECT $1, chr(64 + r), n,
            CASE WHEN $4::int IS NOT NULL AND r >= $4::int THEN 'RECLINER' ELSE 'REGULAR' END,
            r - 1,
            CASE WHEN $3::int IS NOT NULL AND n > $3::int THEN n ELSE n - 1 END
     FROM generate_series(1, $2::int) AS r, generate_series(1, $5::int) AS n`,
    [
      screenId,
      opts.rows,
      opts.aisleAfter ?? null,
      opts.premiumFromRow ?? null,
      opts.cols,
    ],
  );
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // wipe the catalog (children first is handled by CASCADE)
    await client.query(
      "TRUNCATE shows, seats, screens, theatres, movies CASCADE",
    );

    // ---- movies ----
    const movieData = [
      [
        "Midnight Local",
        "A thriller aboard the last train to Virar.",
        128,
        "Hindi",
        "Thriller",
      ],
      [
        "Monsoon Heist",
        "A crew plans a robbery during the Mumbai floods.",
        142,
        "Hindi",
        "Action",
      ],
      [
        "The Last Chai Stall",
        "A drama about a neighbourhood icon.",
        115,
        "English",
        "Drama",
      ],
      [
        "Kala Ghoda Nights",
        "A romance set in South Mumbai.",
        124,
        "Hindi",
        "Romance",
      ],
    ];
    const movies: { id: string; duration: number }[] = [];
    for (const [title, description, duration, language, genre] of movieData) {
      const slug = String(title).toLowerCase().replace(/\s+/g, "-");
      const { rows } = await client.query(
        `INSERT INTO movies (title, description, duration_minutes, language, genre, poster_url, release_date)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE) RETURNING id`,
        [
          title,
          description,
          duration,
          language,
          genre,
          `https://picsum.photos/seed/${slug}/300/450`,
        ],
      );
      movies.push({ id: rows[0].id, duration: duration as number });
    }

    // ---- theatres and screens ----
    const theatreData = [
      {
        name: "Star Cinemas Andheri",
        address: "Andheri West, Mumbai",
        screens: ["Screen 1", "Screen 2"],
      },
      {
        name: "Metro Talkies Dadar",
        address: "Dadar East, Mumbai",
        screens: ["Screen 1"],
      },
    ];
    const screens: { id: string; theatre: string; name: string }[] = [];
    for (const t of theatreData) {
      const tr = await client.query(
        `INSERT INTO theatres (name, address) VALUES ($1, $2) RETURNING id`,
        [t.name, t.address],
      );
      for (const screenName of t.screens) {
        const sr = await client.query(
          `INSERT INTO screens (theatre_id, name) VALUES ($1, $2) RETURNING id`,
          [tr.rows[0].id, screenName],
        );
        screens.push({ id: sr.rows[0].id, theatre: t.name, name: screenName });
      }
    }

    // ---- seats ----
    for (const s of screens) {
      if (s.theatre === "Star Cinemas Andheri" && s.name === "Screen 1") {
        await addSeats(client, s.id, { rows: 5, cols: 10 }); // 50 seats
      } else if (
        s.theatre === "Star Cinemas Andheri" &&
        s.name === "Screen 2"
      ) {
        await addSeats(client, s.id, {
          rows: 10,
          cols: 15,
          aisleAfter: 7,
          premiumFromRow: 9,
        }); // 150 seats
      } else {
        await addSeats(client, s.id, { rows: 10, cols: 10, premiumFromRow: 9 }); // 100 seats
      }
    }

    // ---- shows: 4 a day per screen, next 7 days ----
    const SLOTS = ["10:00", "13:30", "17:00", "20:30"];
    const CLEANING_BUFFER_MIN = 15;
    let showCount = 0;

    for (let day = 0; day < 7; day++) {
      // today + N days, as YYYY-MM-DD in Mumbai time
      const date = new Date(Date.now() + day * 86_400_000).toLocaleDateString(
        "en-CA",
        { timeZone: "Asia/Kolkata" },
      );

      for (const [screenIdx, screen] of screens.entries()) {
        for (const [slotIdx, slot] of SLOTS.entries()) {
          const movie = movies[(slotIdx + screenIdx) % movies.length];
          const startsAt = new Date(`${date}T${slot}:00+05:30`);
          const endsAt = new Date(
            startsAt.getTime() +
              (movie.duration + CLEANING_BUFFER_MIN) * 60_000,
          );

          await client.query(
            `INSERT INTO shows (movie_id, screen_id, starts_at, ends_at, price_paise)
             VALUES ($1, $2, $3, $4, $5)`,
            [movie.id, screen.id, startsAt, endsAt, 25000],
          );
          showCount++;
        }
      }
    }
    console.log(`Seeded ${showCount} shows`);

    await client.query("COMMIT");
    console.log(
      `Seeded ${movies.length} movies, ${theatreData.length} theatres, ${screens.length} screens`,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
