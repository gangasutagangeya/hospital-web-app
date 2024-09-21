-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "street" TEXT,
    "city" TEXT,
    "district" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT NOT NULL DEFAULT 'india',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Org" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "addressId" TEXT,
    CONSTRAINT "Org_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hospitalId" TEXT NOT NULL,
    "no" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Room_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "no" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bed_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Hospital_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Hospital_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Password" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "digits" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "charSet" TEXT NOT NULL,
    "expiresAt" DATETIME
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expirationDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Session_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actionId" TEXT NOT NULL,
    "actionName" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Permission_actionId_actionName_fkey" FOREIGN KEY ("actionId", "actionName") REFERENCES "Action" ("id", "name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Permission_entityId_entityName_fkey" FOREIGN KEY ("entityId", "entityName") REFERENCES "Entity" ("id", "name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hospitalId" TEXT,
    "addressId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "aadhar" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "salary" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "addressId" TEXT,
    "umr" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fatherName" TEXT,
    "dob" TEXT,
    "gender" TEXT NOT NULL,
    "aadhar" TEXT,
    "bloodGroup" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Patient_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DrugStrength" (
    "strength" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "DrugDuration" (
    "duration" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "DrugFrequency" (
    "frequency" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "DrugTime" (
    "time" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Drug" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "SummaryDrugInstruction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "drugId" TEXT NOT NULL,
    "strengthId" TEXT NOT NULL,
    "frequencyId" TEXT NOT NULL,
    "durationId" TEXT NOT NULL,
    "drugTimeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dischargeSummaryId" TEXT,
    "dischargeSummaryTemplateId" TEXT,
    CONSTRAINT "SummaryDrugInstruction_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SummaryDrugInstruction_strengthId_fkey" FOREIGN KEY ("strengthId") REFERENCES "DrugStrength" ("strength") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SummaryDrugInstruction_frequencyId_fkey" FOREIGN KEY ("frequencyId") REFERENCES "DrugFrequency" ("frequency") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SummaryDrugInstruction_durationId_fkey" FOREIGN KEY ("durationId") REFERENCES "DrugDuration" ("duration") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SummaryDrugInstruction_drugTimeId_fkey" FOREIGN KEY ("drugTimeId") REFERENCES "DrugTime" ("time") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SummaryDrugInstruction_dischargeSummaryId_fkey" FOREIGN KEY ("dischargeSummaryId") REFERENCES "DischargeSummary" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SummaryDrugInstruction_dischargeSummaryTemplateId_fkey" FOREIGN KEY ("dischargeSummaryTemplateId") REFERENCES "DischargeSummaryTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DischargeSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "docterId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "inPatientId" TEXT,
    "dischargeDate" DATETIME,
    "diagnosis" TEXT,
    "finalDiagnosis" TEXT,
    "complaintsOnReporting" TEXT,
    "pastHistory" TEXT,
    "historyOfPresentingIllness" TEXT,
    "physicalFindingsOfExamination" TEXT,
    "laboratoryData" TEXT,
    "investigationProcedure" TEXT,
    "therapeuticProcedure" TEXT,
    "coursesOfTreatmentInHospital" TEXT,
    "summaryOfICUStay" TEXT,
    "futureAdviceOnDischarge" TEXT,
    "preparedById" TEXT NOT NULL,
    "checkedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DischargeSummary_docterId_fkey" FOREIGN KEY ("docterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DischargeSummary_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DischargeSummary_inPatientId_fkey" FOREIGN KEY ("inPatientId") REFERENCES "InPatient" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DischargeSummary_preparedById_fkey" FOREIGN KEY ("preparedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DischargeSummary_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InPatient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "roomId" TEXT,
    "bedId" TEXT,
    "docterId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "admitDate" DATETIME,
    "dischargeDate" DATETIME,
    "paymentType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InPatient_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InPatient_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InPatient_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InPatient_docterId_fkey" FOREIGN KEY ("docterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InPatient_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutPatient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "docterId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "appointmentDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OutPatient_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OutPatient_docterId_fkey" FOREIGN KEY ("docterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OutPatient_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DischargeSummaryTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "docterId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "diagnosis" TEXT,
    "finalDiagnosis" TEXT,
    "complaintsOnReporting" TEXT,
    "historyOfPresentingIllness" TEXT,
    "physicalFindingsOfExamination" TEXT,
    "laboratoryData" TEXT,
    "investigationProcedure" TEXT,
    "therapeuticProcedure" TEXT,
    "coursesOfTreatmentInHospital" TEXT,
    "summaryOfICUStay" TEXT,
    "futureAdviceOnDischarge" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DischargeSummaryTemplate_docterId_fkey" FOREIGN KEY ("docterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DischargeSummaryTemplate_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_street_city_state_zip_country_key" ON "Address"("street", "city", "state", "zip", "country");

-- CreateIndex
CREATE UNIQUE INDEX "Org_name_key" ON "Org"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_registrationNo_key" ON "Hospital"("registrationNo");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_name_key" ON "Hospital"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_phone_key" ON "Hospital"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_email_key" ON "Hospital"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "Password"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_target_type_key" ON "Verification"("target", "type");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_id_name_key" ON "Entity"("id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Action_id_name_key" ON "Action"("id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_actionId_entityId_key" ON "Permission"("actionId", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_aadhar_key" ON "User"("aadhar");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_umr_key" ON "Patient"("umr");

-- CreateIndex
CREATE INDEX "Patient_umr_idx" ON "Patient"("umr");

-- CreateIndex
CREATE INDEX "Patient_name_idx" ON "Patient"("name");

-- CreateIndex
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");

-- CreateIndex
CREATE INDEX "Patient_aadhar_idx" ON "Patient"("aadhar");

-- CreateIndex
CREATE UNIQUE INDEX "DrugStrength_strength_key" ON "DrugStrength"("strength");

-- CreateIndex
CREATE UNIQUE INDEX "DrugDuration_duration_key" ON "DrugDuration"("duration");

-- CreateIndex
CREATE UNIQUE INDEX "DrugFrequency_frequency_key" ON "DrugFrequency"("frequency");

-- CreateIndex
CREATE UNIQUE INDEX "DrugTime_time_key" ON "DrugTime"("time");

-- CreateIndex
CREATE UNIQUE INDEX "Drug_name_key" ON "Drug"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DischargeSummary_inPatientId_key" ON "DischargeSummary"("inPatientId");

-- CreateIndex
CREATE UNIQUE INDEX "InPatient_roomId_key" ON "InPatient"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "InPatient_bedId_key" ON "InPatient"("bedId");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");
