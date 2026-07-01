import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

const TEACHERS = [
  "KUNIN ERNI MUZAUWIDAH S.Ag",
  "ABDUL AZIZ, S.Pd",
  "ANIM BAROROH",
  "DUWI CITRA NINGSIH, S.Pd",
  "HANIK WAFIROTU NI`AM, S.Pd",
  "KHUROTUL A`YUNI S.Pd.I",
  "MAULIDA DWI MAHARDIKA, S.Pd",
  "MOHAMAD JAENURI S.Pd.I",
  "NONOT SUGIANTO",
  "SEPTI DIA PERTIWI, S.Pd.",
  "SITI NUR HAMIDAH S.Pd.I",
];

async function seed() {
  console.log("Creating auth user...");
  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: "islamiyah@myarsip.sch.id",
      password: "mistaku12345",
      email_confirm: true,
      user_metadata: { display_name: "MIS Islamiyah Tanjungrejo" },
    });

  if (authError) {
    console.error("Auth user creation error:", authError.message);
    process.exit(1);
  }
  console.log("Auth user created:", authUser.user?.email);

  console.log("Inserting teachers...");
  const { error: teachersError } = await supabaseAdmin
    .from("teachers")
    .insert(TEACHERS.map((nama) => ({ nama })));

  if (teachersError) {
    console.error("Teachers insert error:", teachersError.message);
    process.exit(1);
  }
  console.log(`Inserted ${TEACHERS.length} teachers`);

  console.log("Seed complete!");
}

seed();
