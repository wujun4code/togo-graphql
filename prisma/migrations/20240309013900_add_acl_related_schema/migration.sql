-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleUser" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "RoleUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ACLRule" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "readPermission" BOOLEAN NOT NULL,
    "writePermission" BOOLEAN NOT NULL,

    CONSTRAINT "ACLRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "unique_user_role" ON "RoleUser"("roleId", "userId");

-- AddForeignKey
ALTER TABLE "RoleUser" ADD CONSTRAINT "RoleUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleUser" ADD CONSTRAINT "RoleUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ACLRule" ADD CONSTRAINT "ACLRule_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ACLRule" ADD CONSTRAINT "ACLRule_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
