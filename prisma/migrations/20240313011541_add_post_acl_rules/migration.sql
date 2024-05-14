-- CreateTable
CREATE TABLE "Post_UserACLRule" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "readPermission" BOOLEAN NOT NULL,
    "writePermission" BOOLEAN NOT NULL,
    "postId" INTEGER NOT NULL,

    CONSTRAINT "Post_UserACLRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post_RoleACLRule" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "readPermission" BOOLEAN NOT NULL,
    "writePermission" BOOLEAN NOT NULL,
    "postId" INTEGER NOT NULL,

    CONSTRAINT "Post_RoleACLRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post_PublicACLRule" (
    "id" SERIAL NOT NULL,
    "wildcard" TEXT NOT NULL,
    "readPermission" BOOLEAN NOT NULL,
    "writePermission" BOOLEAN NOT NULL,
    "postId" INTEGER NOT NULL,

    CONSTRAINT "Post_PublicACLRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_UserACLRule_userId_postId_key" ON "Post_UserACLRule"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_RoleACLRule_roleId_postId_key" ON "Post_RoleACLRule"("roleId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_PublicACLRule_wildcard_postId_key" ON "Post_PublicACLRule"("wildcard", "postId");

-- AddForeignKey
ALTER TABLE "Post_UserACLRule" ADD CONSTRAINT "Post_UserACLRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post_UserACLRule" ADD CONSTRAINT "Post_UserACLRule_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post_RoleACLRule" ADD CONSTRAINT "Post_RoleACLRule_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post_RoleACLRule" ADD CONSTRAINT "Post_RoleACLRule_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post_PublicACLRule" ADD CONSTRAINT "Post_PublicACLRule_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
