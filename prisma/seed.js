const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  // Check if already seeded
  const count = await prisma.user.count()
  if (count > 0) {
    console.log('Database already seeded, skipping...')
    return
  }

  const passwordHash = await bcrypt.hash('demo1234', 10)

  // ─── Create Admin ─────────────────────────────
  const admin = await prisma.user.create({
    data: {
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@demo.com',
      password: passwordHash,
      role: 'ADMIN',
      phone: '+1-555-0100',
    },
  })
  console.log('Created admin:', admin.email)

  // ─── Create Demo Patient ─────────────────────
  const patientUser = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'patient@demo.com',
      password: passwordHash,
      role: 'PATIENT',
      phone: '+1-555-0101',
      patient: {
        create: {
          dateOfBirth: new Date('1990-05-15'),
          gender: 'MALE',
          bloodGroup: 'O+',
          address: '123 Main Street, Apt 4B',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          emergencyContact: '+1-555-0102',
          height: 178,
          weight: 75,
        },
      },
    },
  })
  console.log('Created patient:', patientUser.email)

  // ─── Create Demo Doctor ──────────────────────
  const doctorUser = await prisma.user.create({
    data: {
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'doctor@demo.com',
      password: passwordHash,
      role: 'DOCTOR',
      phone: '+1-555-0200',
      doctor: {
        create: {
          specialization: 'Cardiology',
          licenseNumber: 'MD-NY-12345',
          experience: 12,
          qualification: 'MD, FACC - Johns Hopkins School of Medicine',
          bio: 'Board-certified cardiologist with 12+ years of experience specializing in preventive cardiology, heart failure management, and interventional procedures.',
          consultationFee: 250,
          rating: 4.9,
          verified: true,
        },
      },
    },
  })
  console.log('Created doctor:', doctorUser.email)

  // ─── Create additional doctors ───────────────
  const doctors = [
    { firstName: 'Dr. Michael', lastName: 'Chen', specialization: 'Neurology', license: 'MD-NY-23456', exp: 8, fee: 200, rating: 4.7 },
    { firstName: 'Dr. Emily', lastName: 'Rodriguez', specialization: 'Pediatrics', license: 'MD-NY-34567', exp: 10, fee: 180, rating: 4.8 },
    { firstName: 'Dr. James', lastName: 'Wilson', specialization: 'Orthopedics', license: 'MD-NY-45678', exp: 15, fee: 220, rating: 4.6 },
    { firstName: 'Dr. Lisa', lastName: 'Anderson', specialization: 'Dermatology', license: 'MD-NY-56789', exp: 7, fee: 190, rating: 4.9 },
    { firstName: 'Dr. Robert', lastName: 'Taylor', specialization: 'General Medicine', license: 'MD-NY-67890', exp: 20, fee: 150, rating: 4.5 },
  ]

  for (const d of doctors) {
    const docUser = await prisma.user.create({
      data: {
        firstName: d.firstName,
        lastName: d.lastName,
        email: `${d.firstName.toLowerCase().replace('dr. ', '')}.${d.lastName.toLowerCase()}@medicore.com`,
        password: passwordHash,
        role: 'DOCTOR',
        phone: `+1-555-0${200 + doctors.indexOf(d) + 1}00`,
        doctor: {
          create: {
            specialization: d.specialization,
            licenseNumber: d.license,
            experience: d.exp,
            consultationFee: d.fee,
            rating: d.rating,
            verified: true,
            bio: `Experienced ${d.specialization.toLowerCase()} specialist dedicated to providing exceptional patient care.`,
          },
        },
      },
    })
    console.log('Created doctor:', docUser.email)
  }

  // ─── Create additional patients ──────────────
  const patients = [
    { firstName: 'Alice', lastName: 'Brown', dob: '1985-03-22', gender: 'FEMALE', blood: 'A+' },
    { firstName: 'Bob', lastName: 'Davis', dob: '1978-11-08', gender: 'MALE', blood: 'B+' },
    { firstName: 'Carol', lastName: 'Miller', dob: '1995-07-14', gender: 'FEMALE', blood: 'AB+' },
  ]

  for (const p of patients) {
    const patUser = await prisma.user.create({
      data: {
        firstName: p.firstName,
        lastName: p.lastName,
        email: `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase()}@patient.com`,
        password: passwordHash,
        role: 'PATIENT',
        patient: {
          create: {
            dateOfBirth: new Date(p.dob),
            gender: p.gender,
            bloodGroup: p.blood,
          },
        },
      },
    })
    console.log('Created patient:', patUser.email)
  }

  // ─── Fetch IDs for relational data ───────────
  const mainPatient = await prisma.patient.findFirst({
    where: { userId: patientUser.id },
  })
  const mainDoctor = await prisma.doctor.findFirst({
    where: { userId: doctorUser.id },
  })
  const allDoctors = await prisma.doctor.findMany()

  // ─── Appointments ────────────────────────────
  const now = new Date()
  const appointments = [
    { patientId: mainPatient.id, doctorId: mainDoctor.id, date: new Date(now.getTime() + 86400000), time: '10:00', status: 'CONFIRMED', type: 'VIDEO', reason: 'Follow-up consultation', symptoms: 'Occasional chest discomfort during exercise' },
    { patientId: mainPatient.id, doctorId: allDoctors[1].id, date: new Date(now.getTime() + 172800000), time: '14:00', status: 'PENDING', type: 'IN_PERSON', reason: 'Headache and dizziness', symptoms: 'Frequent headaches, especially in the morning' },
    { patientId: mainPatient.id, doctorId: mainDoctor.id, date: new Date(now.getTime() - 604800000), time: '09:00', status: 'COMPLETED', type: 'IN_PERSON', reason: 'Annual check-up', notes: 'Patient in good health. ECG normal. Recommended lifestyle modifications.', diagnosis: 'Healthy, routine follow-up in 6 months' },
    { patientId: mainPatient.id, doctorId: allDoctors[3].id, date: new Date(now.getTime() - 2592000000), time: '11:30', status: 'COMPLETED', type: 'IN_PERSON', reason: 'Skin rash consultation', notes: 'Prescribed topical cream for contact dermatitis.', diagnosis: 'Contact dermatitis' },
  ]

  for (const a of appointments) {
    await prisma.appointment.create({ data: a })
  }
  console.log('Created appointments')

  // ─── Medical Records ─────────────────────────
  const records = [
    { patientId: mainPatient.id, doctorId: mainDoctor.id, type: 'CONDITION', title: 'Hypertension', description: 'Stage 1 hypertension, currently managed with lifestyle changes', severity: 'MODERATE', date: new Date('2023-06-01') },
    { patientId: mainPatient.id, doctorId: null, type: 'ALLERGY', title: 'Penicillin', description: 'Skin rash and itching', severity: 'MODERATE', date: new Date('2020-03-15') },
    { patientId: mainPatient.id, doctorId: null, type: 'ALLERGY', title: 'Pollen', description: 'Seasonal allergic rhinitis', severity: 'MILD', date: new Date('2019-05-20') },
    { patientId: mainPatient.id, doctorId: mainDoctor.id, type: 'MEDICATION', title: 'Lisinopril', description: '10mg once daily for blood pressure management', date: new Date('2023-06-01') },
    { patientId: mainPatient.id, doctorId: null, type: 'VACCINATION', title: 'Influenza Vaccine', description: 'Annual flu shot - 2025-2026 season', date: new Date('2025-10-15') },
    { patientId: mainPatient.id, doctorId: null, type: 'VACCINATION', title: 'COVID-19 Booster', description: 'Updated bivalent booster', date: new Date('2025-09-01') },
    { patientId: mainPatient.id, doctorId: mainDoctor.id, type: 'CONDITION', title: 'Mild Vitamin D Deficiency', description: 'Detected in routine blood work. Prescribed supplements.', severity: 'MILD', date: new Date('2024-01-10') },
  ]

  for (const r of records) {
    await prisma.medicalRecord.create({ data: r })
  }
  console.log('Created medical records')

  // ─── Prescriptions ───────────────────────────
  const prescriptions = [
    {
      patientId: mainPatient.id,
      doctorId: mainDoctor.id,
      medications: JSON.stringify([
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take in the morning with water' },
        { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take in the evening' },
      ]),
      notes: 'Continue lifestyle modifications. Follow up in 3 months.',
      status: 'ACTIVE',
      date: new Date('2026-01-15'),
    },
    {
      patientId: mainPatient.id,
      doctorId: allDoctors[3].id,
      medications: JSON.stringify([
        { name: 'Hydrocortisone Cream', dosage: '1%', frequency: 'Twice daily', duration: '14 days', instructions: 'Apply thin layer to affected area' },
      ]),
      notes: 'For contact dermatitis. Avoid known irritants.',
      status: 'COMPLETED',
      date: new Date('2025-06-10'),
    },
  ]

  for (const p of prescriptions) {
    await prisma.prescription.create({ data: p })
  }
  console.log('Created prescriptions')

  // ─── Lab Reports ─────────────────────────────
  const labReports = [
    {
      patientId: mainPatient.id,
      doctorId: mainDoctor.id,
      testName: 'Complete Blood Count (CBC)',
      category: 'BLOOD',
      results: JSON.stringify([
        { parameter: 'White Blood Cells', value: 6.8, unit: 'K/uL', referenceRange: '4.5-11.0', status: 'NORMAL' },
        { parameter: 'Red Blood Cells', value: 4.92, unit: 'M/uL', referenceRange: '4.5-5.9', status: 'NORMAL' },
        { parameter: 'Hemoglobin', value: 14.8, unit: 'g/dL', referenceRange: '13.5-17.5', status: 'NORMAL' },
        { parameter: 'Platelets', value: 245, unit: 'K/uL', referenceRange: '150-450', status: 'NORMAL' },
      ]),
      summary: 'All values within normal range.',
      status: 'REVIEWED',
      date: new Date('2026-01-10'),
    },
    {
      patientId: mainPatient.id,
      doctorId: mainDoctor.id,
      testName: 'Lipid Panel',
      category: 'BLOOD',
      results: JSON.stringify([
        { parameter: 'Total Cholesterol', value: 182, unit: 'mg/dL', referenceRange: '<200', status: 'NORMAL' },
        { parameter: 'LDL', value: 112, unit: 'mg/dL', referenceRange: '<100', status: 'HIGH' },
        { parameter: 'HDL', value: 45, unit: 'mg/dL', referenceRange: '>40', status: 'NORMAL' },
        { parameter: 'Triglycerides', value: 125, unit: 'mg/dL', referenceRange: '<150', status: 'NORMAL' },
      ]),
      summary: 'LDL slightly elevated. Continue statin therapy.',
      status: 'REVIEWED',
      date: new Date('2026-01-10'),
    },
    {
      patientId: mainPatient.id,
      doctorId: null,
      testName: 'Vitamin D Level',
      category: 'BLOOD',
      results: JSON.stringify([
        { parameter: '25-OH Vitamin D', value: 28, unit: 'ng/mL', referenceRange: '30-100', status: 'LOW' },
      ]),
      summary: 'Mild vitamin D deficiency.',
      status: 'REVIEWED',
      date: new Date('2024-01-10'),
    },
  ]

  for (const l of labReports) {
    await prisma.labReport.create({ data: l })
  }
  console.log('Created lab reports')

  // ─── Family Members ──────────────────────────
  const family = [
    { name: 'Jane Smith', relationship: 'Spouse', dob: '1988-08-20', gender: 'FEMALE', blood: 'A+', phone: '+1-555-0102' },
    { name: 'Emma Smith', relationship: 'Daughter', dob: '2015-04-10', gender: 'FEMALE', blood: 'O+', phone: '+1-555-0103' },
  ]
  for (const f of family) {
    await prisma.familyMember.create({
      data: {
        patientId: mainPatient.id,
        name: f.name,
        relationship: f.relationship,
        dateOfBirth: new Date(f.dob),
        gender: f.gender,
        bloodGroup: f.blood,
        phone: f.phone,
      },
    })
  }
  console.log('Created family members')

  // ─── Health Metrics ──────────────────────────
  const metricsTypes = [
    { type: 'HEART_RATE', value: 72, unit: 'bpm' },
    { type: 'STEPS', value: 8500, unit: 'steps' },
    { type: 'SLEEP', value: 7.5, unit: 'hours' },
    { type: 'WEIGHT', value: 75, unit: 'kg' },
    { type: 'TEMPERATURE', value: 98.6, unit: '°F' },
    { type: 'BLOOD_PRESSURE', value: 120, secondary: 80, unit: 'mmHg' },
    { type: 'GLUCOSE', value: 95, unit: 'mg/dL' },
  ]
  for (let i = 0; i < 30; i++) {
    const daysAgo = 29 - i
    const date = new Date(now.getTime() - daysAgo * 86400000)
    for (const m of metricsTypes) {
      await prisma.healthMetric.create({
        data: {
          userId: patientUser.id,
          type: m.type,
          value: m.value + Math.round(Math.random() * 20 - 10),
          secondaryValue: m.secondary ? m.secondary + Math.round(Math.random() * 10 - 5) : null,
          unit: m.unit,
          date,
        },
      })
    }
  }
  // Glucose less frequently
  for (let i = 0; i < 10; i++) {
    const daysAgo = (9 - i) * 3
    const date = new Date(now.getTime() - daysAgo * 86400000)
    await prisma.healthMetric.create({
      data: {
        userId: patientUser.id,
        type: 'GLUCOSE',
        value: 85 + Math.round(Math.random() * 30),
        unit: 'mg/dL',
        date,
      },
    })
  }
  console.log('Created health metrics')

  // ─── Notifications ───────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: patientUser.id, title: 'Appointment Confirmed', message: 'Your video consultation with Dr. Sarah Johnson is confirmed for tomorrow at 10:00 AM.', type: 'APPOINTMENT' },
      { userId: patientUser.id, title: 'Lab Results Available', message: 'Your Complete Blood Count results are now available for review.', type: 'LAB' },
      { userId: patientUser.id, title: 'Prescription Refill Reminder', message: 'Your Lisinopril prescription has 15 days remaining.', type: 'PRESCRIPTION' },
      { userId: patientUser.id, title: 'Health Tip', message: 'Your daily step count is below your goal. Try a 15-minute walk today!', type: 'INFO' },
      { userId: doctorUser.id, title: 'New Appointment Request', message: 'John Smith has requested a consultation for headache and dizziness.', type: 'APPOINTMENT' },
      { userId: doctorUser.id, title: 'Lab Results Ready', message: 'Lab results for John Smith are ready for review.', type: 'LAB' },
      { userId: admin.id, title: 'New User Registration', message: 'A new doctor has registered and requires verification.', type: 'SYSTEM' },
      { userId: admin.id, title: 'Platform Update', message: 'System analytics dashboard updated with latest metrics.', type: 'SYSTEM' },
    ],
  })
  console.log('Created notifications')

  // ─── Messages ────────────────────────────────
  await prisma.message.createMany({
    data: [
      { senderId: patientUser.id, receiverId: doctorUser.id, content: 'Hi Dr. Johnson, I have been taking the medication as prescribed and feeling better.', read: false },
      { senderId: doctorUser.id, receiverId: patientUser.id, content: 'That is great to hear! Keep up the good work and see you at our next appointment.', read: true },
      { senderId: patientUser.id, receiverId: doctorUser.id, content: 'Should I make any dietary changes?', read: false },
    ],
  })
  console.log('Created messages')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
