import "dotenv/config";
import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";
import { db } from "./index.js";
import {
  users,
  organizations,
  organizationMembers,
  properties,
  partners,
  documents,
  verifications,
  complianceRecords,
  liquidityRequests,
  listings,
  offers,
  creditApplications,
} from "./schema/index.schema.js";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => Math.random() * (max - min) + min;

const CITIES = [
  "Bangalore", "Mumbai", "Pune", "Hyderabad", "Chennai", "Delhi",
  "Gurgaon", "Noida", "Kolkata", "Ahmedabad", "Jaipur", "Kochi",
];

const PROPERTY_NAMES = [
  "Commercial Tower", "Office Space", "Retail Mall Unit", "Industrial Warehouse",
  "Business Park", "Corporate Hub", "Tech Park", "Mixed Use Complex",
];

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

/* ------------------------------------------------------------------ */
/* reset                                                               */
/* ------------------------------------------------------------------ */

async function resetDatabase() {
  console.log("Clearing existing data...");
  // Order matters — child tables first
  await db.execute(sql`TRUNCATE TABLE
    offers,
    listings,
    credit_applications,
    liquidity_requests,
    compliance_records,
    verifications,
    documents,
    partners,
    properties,
    organization_members,
    organizations,
    users
    RESTART IDENTITY CASCADE`);
  console.log("     ✓ All tables cleared");
}

/* ------------------------------------------------------------------ */
/* seed                                                                */
/* ------------------------------------------------------------------ */

async function seed() {
  console.log("🌱  Seeding database...");
  const t0 = Date.now();

  await resetDatabase();

  // Hash once — bcrypt at 12 rounds is slow, don't repeat 250 times
  const passwordHash = await bcrypt.hash("Password123", 12);
  console.log("     Password hash ready");

  /* ---------------- USERS (250) ---------------- */
  console.log("  → users");
  const userRows = [];
  userRows.push({
    name: "PROFITAS Admin",
    email: "admin@profitas.dev",
    passwordHash,
    role: "admin",
  });
  
  for (let i = 1; i <= 249; i++) {
    userRows.push({
      name: `User ${i}`,
      email: `user${i}@profitas.dev`,
      passwordHash,
      role: "user",
    });
  }
  const insertedUsers = await db
    .insert(users)
    .values(userRows)
    .returning({ id: users.id, email: users.email, role: users.role });
  console.log(`     ✓ ${insertedUsers.length} users`);

  /* ---------------- ORGANIZATIONS (60) ---------------- */
  console.log("  → organizations");
  const orgRows = [];
  for (let i = 1; i <= 30; i++) {
    orgRows.push({
      name: `Owner Org ${i}`,
      type: "property_owner",
      email: `owner${i}@profitas.dev`,
      phone: `+9198${String(10000000 + i).slice(-8)}`,
      address: `${i} Main Road, ${rand(CITIES)}`,
    });
  }
  for (let i = 1; i <= 10; i++) {
    orgRows.push({
      name: `Developer Org ${i}`,
      type: "property_developer",
      email: `dev${i}@profitas.dev`,
      phone: `+9197${String(10000000 + i).slice(-8)}`,
      address: `${i} Tech Park, ${rand(CITIES)}`,
    });
  }
  for (let i = 1; i <= 20; i++) {
    orgRows.push({
      name: `Partner Org ${i}`,
      type: "partner",
      email: `partner${i}@profitas.dev`,
      phone: `+9196${String(10000000 + i).slice(-8)}`,
      address: `${i} Financial District, ${rand(CITIES)}`,
    });
  }
  const insertedOrgs = await db
    .insert(organizations)
    .values(orgRows)
    .returning({ id: organizations.id, type: organizations.type });
  console.log(`     ✓ ${insertedOrgs.length} organizations`);

  /* ---------------- ORGANIZATION MEMBERS (120) ---------------- */
  console.log("  → organization members");
  const memberRows = [];
  const ownerOrgIds = insertedOrgs
    .filter((o) => o.type === "property_owner" || o.type === "property_developer")
    .map((o) => o.id);

  const normalUsers = insertedUsers.filter((u) => u.role === "user");

  for (const orgId of ownerOrgIds) {
    const picked = new Set();
    while (picked.size < 3) picked.add(randInt(0, normalUsers.length - 1));
    const arr = [...picked];
    memberRows.push({
      organizationId: orgId,
      userId: normalUsers[arr[0]].id,
      roleInOrg: "owner",
    });
    memberRows.push({
      organizationId: orgId,
      userId: normalUsers[arr[1]].id,
      roleInOrg: "admin",
    });
    memberRows.push({
      organizationId: orgId,
      userId: normalUsers[arr[2]].id,
      roleInOrg: "member",
    });
  }
  await db.insert(organizationMembers).values(memberRows);
  console.log(`     ✓ ${memberRows.length} memberships`);

  /* ---------------- PROPERTIES (200) ---------------- */
  console.log("  → properties");
  const propertyRows = [];
  const statuses = [
    "draft", "pending_verification",
    "verified", "verified", "verified",
    "rejected",
  ];
  const types = ["commercial", "office", "retail", "industrial", "residential", "mixed_use"];
  const ownerOrgs = insertedOrgs.filter(
    (o) => o.type === "property_owner" || o.type === "property_developer"
  );

  for (let i = 1; i <= 200; i++) {
    const org = rand(ownerOrgs);
    const value = randInt(20000000, 150000000); // ₹2 Cr – ₹15 Cr
    const yieldPct = randFloat(5.5, 12.0);
    propertyRows.push({
      organizationId: org.id,
      name: `${rand(PROPERTY_NAMES)} ${i}`,
      location: rand(CITIES),
      address: `${i}, ${rand(CITIES)}`,
      propertyType: rand(types),
      value: String(value),
      rentalYield: yieldPct.toFixed(2),
      status: rand(statuses),
      createdBy: rand(insertedUsers).id,
    });
  }
  const insertedProps = await db
    .insert(properties)
    .values(propertyRows)
    .returning({ id: properties.id, status: properties.status });
  console.log(`     ✓ ${insertedProps.length} properties`);

  /* ---------------- PARTNERS (20) ---------------- */
  console.log("  → partners");
  const partnerOrgs = insertedOrgs.filter((o) => o.type === "partner");
  const partnerTypes = [
    "bank", "nbfc", "institution", "property_platform",
    "legal_advocate", "property_manager",
  ];
  const partnerRows = partnerOrgs.map((o, i) => ({
    organizationId: o.id,
    partnerType: partnerTypes[i % partnerTypes.length],
    contactPerson: `Contact ${i + 1}`,
    email: `contact-partner${i + 1}@profitas.dev`,
    phone: `+91950000${String(i).padStart(4, "0")}`,
    services: "Asset-backed credit, escrow, verification",
  }));
  const insertedPartners = await db
    .insert(partners)
    .values(partnerRows)
    .returning({ id: partners.id, partnerType: partners.partnerType });
  console.log(`     ✓ ${insertedPartners.length} partners`);

  /* ---------------- DOCUMENTS (300) ---------------- */
  console.log("  → documents");
  const docTypes = [
    "title", "ownership", "encumbrance", "sale_agreement",
    "lease", "compliance", "other",
  ];
  const docStatuses = ["pending", "verified", "verified", "rejected"];
  const docRows = [];
  for (let i = 0; i < 300; i++) {
    const prop = rand(insertedProps);
    docRows.push({
      propertyId: prop.id,
      uploadedBy: rand(insertedUsers).id,
      documentType: rand(docTypes),
      fileName: `document-${i + 1}.pdf`,
      cloudinaryPublicId: `profitas/documents/${prop.id}/seed-${i + 1}`,
      cloudinaryUrl: `https://res.cloudinary.com/demo/image/upload/sample-${i + 1}.pdf`,
      cloudinaryFormat: "pdf",
      cloudinaryBytes: randInt(50000, 2000000),
      status: rand(docStatuses),
    });
  }
  await db.insert(documents).values(docRows);
  console.log(`     ✓ ${docRows.length} documents`);

  /* ---------------- VERIFICATIONS (250) ---------------- */
  console.log("  → verifications");
  const verifTypes = ["title", "ownership", "encumbrance", "dispute"];
  const verifStatuses = ["pending", "in_review", "verified", "verified", "rejected"];
  const adminUser = insertedUsers.find((u) => u.role === "admin");
  const verifRows = [];
  for (let i = 0; i < 250; i++) {
    const prop = rand(insertedProps);
    const status = rand(verifStatuses);
    verifRows.push({
      propertyId: prop.id,
      verificationType: rand(verifTypes),
      status,
      verifiedBy:
        status === "verified" || status === "rejected" ? adminUser.id : null,
      remarks: status === "rejected" ? "Documentation incomplete" : null,
    });
  }
  await db.insert(verifications).values(verifRows);
  console.log(`     ✓ ${verifRows.length} verifications`);

  /* ---------------- COMPLIANCE (150) ---------------- */
  console.log("  → compliance records");
  const compTypes = ["regulatory", "documentation", "disclosure"];
  const compStatuses = ["pending", "in_review", "compliant", "compliant", "non_compliant"];
  const compRows = [];
  for (let i = 0; i < 150; i++) {
    const prop = rand(insertedProps);
    const status = rand(compStatuses);
    compRows.push({
      propertyId: prop.id,
      complianceType: rand(compTypes),
      status,
      reviewedBy:
        status === "compliant" || status === "non_compliant" ? adminUser.id : null,
      remarks: status === "non_compliant" ? "Missing disclosure" : null,
    });
  }
  await db.insert(complianceRecords).values(compRows);
  console.log(`     ✓ ${compRows.length} compliance records`);

  /* ---------------- LIQUIDITY (100) ---------------- */
  console.log("  → liquidity requests");
  const verifiedProps = insertedProps.filter((p) => p.status === "verified");
  const liqRows = [];
  for (let i = 0; i < 100; i++) {
    const prop = rand(verifiedProps);
    const type = Math.random() > 0.5 ? "sell_match" : "get_credit";
    const status = rand(["requested", "processing", "completed", "rejected"]);
    liqRows.push({
      propertyId: prop.id,
      requestedBy: rand(normalUsers).id,
      liquidityType: type,
      status,
    });
  }
  const insertedLiq = await db
    .insert(liquidityRequests)
    .values(liqRows)
    .returning({
      id: liquidityRequests.id,
      propertyId: liquidityRequests.propertyId,
      liquidityType: liquidityRequests.liquidityType,
      requestedBy: liquidityRequests.requestedBy,
    });
  console.log(`     ✓ ${insertedLiq.length} liquidity requests`);

  /* ---------------- LISTINGS + OFFERS ---------------- */
  console.log("  → listings + offers");
  const sellRequests = insertedLiq.filter((r) => r.liquidityType === "sell_match");
  const listingRows = sellRequests.map((r) => ({
    liquidityRequestId: r.id,
    propertyId: r.propertyId,
    askingPrice: String(randInt(20000000, 150000000)),
    status: rand(["active", "active", "matched", "closed"]),
  }));
  const insertedListings = await db
    .insert(listings)
    .values(listingRows)
    .returning({ id: listings.id, liquidityRequestId: listings.liquidityRequestId });
  console.log(`     ✓ ${insertedListings.length} listings`);

  const offerRows = [];
  for (const listing of insertedListings) {
    const sellerReq = sellRequests.find((r) => r.id === listing.liquidityRequestId);
    const offerCount = randInt(0, 4);
    for (let i = 0; i < offerCount; i++) {
      // pick a random user who is NOT the seller
      let buyer = rand(normalUsers);
      let attempts = 0;
      while (sellerReq && buyer.id === sellerReq.requestedBy && attempts < 5) {
        buyer = rand(normalUsers);
        attempts++;
      }
      offerRows.push({
        listingId: listing.id,
        buyerId: buyer.id,
        amount: String(randInt(20000000, 150000000)),
        status: rand(["pending", "pending", "accepted", "rejected"]),
      });
    }
  }
  if (offerRows.length) {
    await db.insert(offers).values(offerRows);
    console.log(`     ✓ ${offerRows.length} offers`);
  } else {
    console.log(`     ✓ 0 offers`);
  }

  /* ---------------- CREDIT APPLICATIONS ---------------- */
  console.log("  → credit applications");
  const creditRequests = insertedLiq.filter((r) => r.liquidityType === "get_credit");
  const lenderPartners = insertedPartners.filter((p) =>
    ["bank", "nbfc", "institution"].includes(p.partnerType)
  );
  const creditRows = creditRequests.map((r) => {
    const status = rand(["requested", "routed", "approved", "rejected", "disbursed"]);
    return {
      liquidityRequestId: r.id,
      propertyId: r.propertyId,
      investorId: r.requestedBy,
      lenderId: status === "requested" ? null : rand(lenderPartners).id,
      requestedAmount: String(randInt(10000000, 100000000)),
      status,
    };
  });
  if (creditRows.length) {
    await db.insert(creditApplications).values(creditRows);
    console.log(`     ✓ ${creditRows.length} credit applications`);
  } else {
    console.log(`     ✓ 0 credit applications`);
  }

  /* ---------------- SUMMARY ---------------- */
  const total =
    insertedUsers.length +
    insertedOrgs.length +
    memberRows.length +
    insertedProps.length +
    insertedPartners.length +
    docRows.length +
    verifRows.length +
    compRows.length +
    insertedLiq.length +
    insertedListings.length +
    offerRows.length +
    creditRows.length;

  const t1 = Date.now();
  console.log(`\n Seed complete in ${((t1 - t0) / 1000).toFixed(2)}s`);
  console.log(`    Total rows inserted: ${total}`);
  console.log(`\n    Default credentials:`);
  console.log(`      Admin: admin@profitas.dev / Password123`);
  console.log(`      Users: user1@profitas.dev ... user249@profitas.dev / Password123`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:");
  console.error(err);
  process.exit(1);
});