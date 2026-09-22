import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
})

const PHONE_HASH_PEPPER = process.env.PHONE_HASH_PEPPER || "outcometrack-phone-hash-pepper-2024-change-me"
const PHONE_ENCRYPTION_KEY = process.env.PHONE_ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex")
const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function getKey(): Buffer {
  return Buffer.from(PHONE_ENCRYPTION_KEY, "hex")
}

function encryptPhone(phoneE164: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
  const normalized = phoneE164.replace(/\D/g, "")
  const encrypted = Buffer.concat([cipher.update(normalized, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, encrypted, authTag]).toString("base64")
}

function hashPhone(phoneE164: string): string {
  const normalized = phoneE164.replace(/\D/g, "");
  return crypto.createHmac("sha256", PHONE_HASH_PEPPER).update(normalized).digest("hex");
}

const DISTRICTS = [
  'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad',
  'Solapur', 'Amravati', 'Kolhapur', 'Sangli', 'Satara',
  'Ahmednagar', 'Jalgaon', 'Latur', 'Dhule', 'Akola',
  'Wardha', 'Chandrapur', 'Yavatmal', 'Buldhana', 'Hingoli'
]

const PROGRAMMES = [
  { name: 'PMKVY - IT/ITeS', code: 'PMKVY-IT' },
  { name: 'PMKVY - Healthcare', code: 'PMKVY-HC' },
  { name: 'PMKVY - Manufacturing', code: 'PMKVY-MFG' },
  { name: 'DDU-GKY - Retail', code: 'DDUGKY-RTL' },
  { name: 'State Skill Mission - Construction', code: 'SSM-CONST' },
]

const SALARY_BANDS = ['LT_10K', 'B_10_20K', 'B_20_35K', 'B_35_50K', 'GT_50K']
const OUTCOME_STATUSES = ['EMPLOYED', 'SELF_EMPLOYED', 'APPRENTICE', 'LOOKING', 'NOT_WORKING', 'UNKNOWN']
const EMPLOYED_STATUSES = ['EMPLOYED', 'SELF_EMPLOYED', 'APPRENTICE']
const NOT_EMPLOYED_STATUSES = ['LOOKING', 'NOT_WORKING']
const NON_PLACEMENT_REASONS = ['NO_JOBS', 'SKILLS_MISMATCH', 'FAMILY', 'HEALTH', 'OTHER']
const FOLLOWUP_STATUSES = ['SCHEDULED', 'SENT', 'RESPONDED', 'FAILED', 'EXPIRED']
const CHANNELS = ['WHATSAPP', 'SMS', 'EMAIL']
const BOT_STATES = [
  'AWAITING_CONSENT', 'AWAITING_STATUS', 'AWAITING_EMPLOYER_NAME',
  'AWAITING_ROLE', 'AWAITING_SALARY_BAND', 'AWAITING_NON_PLACEMENT_REASON',
  'AWAITING_RETENTION_STATUS', 'AWAITING_RETENTION_SALARY_BAND', 'DONE'
]
const VERIFICATION_STATUSES = [
  'UNKNOWN', 'SELF_REPORTED', 'PROVIDER_CONFIRMED',
  'EMPLOYER_CONFIRMED', 'DOCUMENT_VERIFIED', 'SYSTEM_VERIFIED', 'CONFLICT'
]
const ACTOR_TYPES = ['ADMIN', 'TRAINEE', 'EMPLOYER', 'SYSTEM']

function randomPhone(): string {
  return `+91${Math.floor(Math.random() * 3000000000) + 7000000000}`
}

function randomEmail(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z]/g, '')
  return `${clean}${Math.floor(Math.random() * 9900) + 100}@example.com`
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomElement<T>(arr: T[]): T {
  const idx = Math.floor(Math.random() * arr.length)
  return arr[idx] as T
}

function randomBool(probability = 0.5): boolean {
  return Math.random() < probability
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data (in order of dependencies)
  await prisma.auditEvent.deleteMany()
  await prisma.verificationRequest.deleteMany()
  await prisma.outcomeEvent.deleteMany()
  await prisma.employmentClaim.deleteMany()
  await prisma.botSession.deleteMany()
  await prisma.followupEvent.deleteMany()
  await prisma.enrolment.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.employmentHistory.deleteMany()
  await prisma.traineeLoginToken.deleteMany()
  await prisma.trainee.deleteMany()
  await prisma.cohort.deleteMany()
  await prisma.programme.deleteMany()

  console.log('🧹 Cleaned existing data')

  // Create programmes
  const programmes = await Promise.all(
    PROGRAMMES.map(p => prisma.programme.create({ data: p }))
  )
  console.log(`✅ Created ${programmes.length} programmes`)

  // Create cohorts (15 total, 3 per programme)
  const cohorts: Array<{ id: string; programmeId: string; name: string; startDate: Date; endDate: Date; createdAt: Date; updatedAt: Date }> = []
  const baseStart = new Date('2023-01-01')
  for (const prog of programmes) {
    for (let i = 0; i < 3; i++) {
      const startDate = randomDate(
        new Date(baseStart.getTime() + i * 90 * 24 * 60 * 60 * 1000),
        new Date(baseStart.getTime() + (i + 1) * 90 * 24 * 60 * 60 * 1000)
      )
      const endDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000)
      const cohort = await prisma.cohort.create({
        data: {
          programmeId: prog.id,
          name: `${prog.code} Batch ${i + 1}`,
          startDate,
          endDate,
        }
      })
      cohorts.push(cohort)
    }
  }
  console.log(`✅ Created ${cohorts.length} cohorts`)

  // Create 500 trainees
  const trainees: Array<{ id: string; fullName: string; phoneE164: string; email: string | null; district: string; language: string; consentGiven: boolean; consentGivenAt: Date | null; consentMethod: string | null; consentRevokedAt: Date | null; createdAt: Date; updatedAt: Date; publicId: string }> = []
  for (let i = 0; i < 500; i++) {
    const name = `Trainee ${i + 1} ${randomElement(['Kumar', 'Sharma', 'Patel', 'Singh', 'Gupta', 'Desai', 'Joshi', 'Mehta', 'Reddy', 'Nair'])}`
    const phone = randomPhone()
    const email = randomEmail(name)
    const district = randomElement(DISTRICTS)
    const language = randomElement(['EN', 'HI'])
    const consentGiven = randomBool(0.85)

    const trainee = await prisma.trainee.create({
      data: {
        fullName: name,
        phoneE164: phone,
        phoneEncrypted: encryptPhone(phone),
        phoneHash: hashPhone(phone),
        email,
        district,
        language,
        consentGiven,
        consentGivenAt: consentGiven ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000) : null,
        consentMethod: consentGiven ? 'WHATSAPP' : null,
      }
    })
    trainees.push(trainee)
  }
  console.log(`✅ Created ${trainees.length} trainees`)

  // Enroll trainees in cohorts (each trainee in 1 cohort)
  const enrolments: Array<{ id: string; traineeId: string; cohortId: string; certificationDate: Date; createdAt: Date; updatedAt: Date }> = []
  for (const trainee of trainees) {
    const cohort = randomElement(cohorts)
    const certDate = randomDate(
      new Date(cohort.startDate.getTime() + 60 * 24 * 60 * 60 * 1000),
      new Date(cohort.endDate.getTime())
    )
    const enrolment = await prisma.enrolment.create({
      data: {
        traineeId: trainee.id,
        cohortId: cohort.id,
        certificationDate: certDate,
      }
    })
    enrolments.push(enrolment)
  }
  console.log(`✅ Created ${enrolments.length} enrolments`)

  // Create follow-up events (30-day and 90-day for each enrolment)
  const followupEvents: Array<{ id: string; traineeId: string; cohortId: string; checkpointDays: number; status: any; channel: any; sentAt: Date | null; respondedAt: Date | null; createdAt: Date; updatedAt: Date }> = []
  for (const enrolment of enrolments) {
    for (const checkpoint of [30, 90]) {
      const status = randomElement(FOLLOWUP_STATUSES.filter(s => s !== 'SCHEDULED'))
      const sentAt = status !== 'SCHEDULED'
        ? new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000)
        : null
      const respondedAt = status === 'RESPONDED'
        ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
        : null

      const fe = await prisma.followupEvent.create({
        data: {
          traineeId: enrolment.traineeId,
          cohortId: enrolment.cohortId,
          checkpointDays: checkpoint,
          status: status as any,
          channel: randomElement(CHANNELS) as any,
          sentAt,
          respondedAt,
        }
      })
      followupEvents.push(fe)
    }
  }
  console.log(`✅ Created ${followupEvents.length} follow-up events`)

  // Create bot sessions, employment claims, outcome events
  let claimsCount = 0
  let outcomesCount = 0
  let certsCount = 0
  let empHistCount = 0

  const CERT_NAMES = [
    'AWS Cloud Practitioner', 'Google Data Analytics', 'Microsoft Azure Fundamentals',
    'Certified Nursing Assistant', 'Medical Coding Specialist', 'Phlebotomy Technician',
    'CNC Machine Operator', 'Welding Certification', 'Quality Control Inspector',
    'Retail Sales Associate', 'Customer Service Excellence', 'Inventory Management',
    'Masonry Level 2', 'Electrical Wiring', 'Plumbing Certification',
  ]
  const CERT_ISSUERS = [
    'NSDC', 'SSC', 'NASSCOM', 'Healthcare SSC', 'Capital Goods SSC',
    'Retailers Association', 'Construction SSC', 'Maharashtra State Skill Mission',
  ]

  for (const fe of followupEvents) {
    if (fe.status === 'SCHEDULED') continue

    // Bot session
    const state = fe.respondedAt ? 'DONE' : randomElement(BOT_STATES.filter(s => s !== 'DONE'))
    await prisma.botSession.create({
      data: {
        traineeId: fe.traineeId,
        followupEventId: fe.id,
        state: state as any,
        currentQuestion: state !== 'DONE' ? 'What is your employment status?' : null,
        collectedData: {},
        expiresAt: new Date(fe.sentAt!.getTime() + 7 * 24 * 60 * 60 * 1000),
      }
    })

    // Employment claim (70% chance)
    if (randomBool(0.7)) {
      const isEmployed = randomBool(0.75)
      const claim = await prisma.employmentClaim.create({
        data: {
          traineeId: fe.traineeId,
          followupEventId: fe.id,
          employerName: isEmployed ? `Company ${Math.floor(Math.random() * 1000)}` : null,
          role: isEmployed ? `Role ${Math.floor(Math.random() * 100)}` : null,
          salaryBand: isEmployed ? randomElement(SALARY_BANDS) as any : null,
          nonPlacementReason: !isEmployed ? randomElement(NON_PLACEMENT_REASONS) as any : null,
          verificationStatus: isEmployed
            ? randomElement(['SELF_REPORTED', 'EMPLOYER_CONFIRMED', 'DOCUMENT_VERIFIED'])
            : 'SELF_REPORTED',
          evidenceLevel: isEmployed ? Math.floor(Math.random() * 4) + 1 : 1,
        }
      })
      claimsCount++

      // Outcome event
      const outcomeStatus = isEmployed
        ? randomElement(EMPLOYED_STATUSES)
        : randomElement(NOT_EMPLOYED_STATUSES)
      await prisma.outcomeEvent.create({
        data: {
          traineeId: fe.traineeId,
          employmentClaimId: claim.id,
          checkpointDays: fe.checkpointDays,
          outcomeStatus: outcomeStatus as any,
          verificationStatus: isEmployed
            ? randomElement(['SELF_REPORTED', 'EMPLOYER_CONFIRMED', 'DOCUMENT_VERIFIED'])
            : 'SELF_REPORTED',
          source: 'TRAINEE',
          evidenceLevel: isEmployed ? Math.floor(Math.random() * 4) + 1 : 1,
        }
      })
      outcomesCount++

      // Verification request (if employed and not self-reported only)
      if (isEmployed && claim.verificationStatus !== 'SELF_REPORTED') {
        await prisma.verificationRequest.create({
          data: {
            employmentClaimId: claim.id,
            tokenHash: Array(32).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            action: 'CONFIRMED',
            usedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          }
        })
      }
    }

    // Certificates (80% chance, 1-3 per trainee)
    if (randomBool(0.8)) {
      const certCount = Math.floor(Math.random() * 3) + 1
      for (let c = 0; c < certCount; c++) {
        await prisma.certificate.create({
          data: {
            traineeId: fe.traineeId,
            name: randomElement(CERT_NAMES),
            issuer: randomElement(CERT_ISSUERS),
            issueDate: new Date(2022 + Math.random() * 3, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            expiryDate: randomBool(0.3)
              ? new Date(2025 + Math.random() * 3, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
              : null,
            fileUrl: randomBool(0.4)
              ? `https://storage.example.com/certs/${Array(36).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}.pdf`
              : null,
          }
        })
        certsCount++
      }
    }

    // Employment history (0-3 entries per trainee)
    const histCount = Math.floor(Math.random() * 4)
    for (let h = 0; h < histCount; h++) {
      const startYear = 2018 + Math.floor(Math.random() * 6)
      const startDate = new Date(startYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      const isCurrent = randomBool(0.3)
      await prisma.employmentHistory.create({
        data: {
          traineeId: fe.traineeId,
          employer: `Company ${Math.floor(Math.random() * 1000)}`,
          role: `Role ${Math.floor(Math.random() * 100)}`,
          salaryBand: randomElement(SALARY_BANDS) as any,
          startDate,
          endDate: isCurrent ? null : new Date(2020 + Math.random() * 5, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          isCurrent,
        }
      })
      empHistCount++
    }
  }

  console.log(`✅ Created ${claimsCount} employment claims`)
  console.log(`✅ Created ${outcomesCount} outcome events`)
  console.log(`✅ Created ${certsCount} certificates`)
  console.log(`✅ Created ${empHistCount} employment history records`)

  // Audit events (sample)
  const auditCount = 200
  for (let i = 0; i < auditCount; i++) {
    await prisma.auditEvent.create({
      data: {
        entityType: randomElement(['trainee', 'followup_event', 'employment_claim', 'verification_request', 'certificate', 'employment_history', 'bot_session']),
        entityId: Array(36).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        action: randomElement(['CREATED', 'UPDATED', 'DELETED', 'SENT', 'RECEIVED', 'CONFIRMED', 'REJECTED', 'EXPIRED', 'LOGIN_SENT', 'LOGIN_USED']),
        actorType: randomElement(ACTOR_TYPES) as any,
        actorId: randomBool(0.5) ? Array(36).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('') : null,
        metadata: { seeded: true, index: i },
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      }
    })
  }
  console.log(`✅ Created ${auditCount} audit events`)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })