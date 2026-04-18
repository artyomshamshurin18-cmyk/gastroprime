CREATE TABLE "CompanyCategoryPrice" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyCategoryPrice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CompanyCategoryPrice_companyId_categoryId_key" ON "CompanyCategoryPrice"("companyId", "categoryId");
CREATE INDEX "CompanyCategoryPrice_companyId_idx" ON "CompanyCategoryPrice"("companyId");
CREATE INDEX "CompanyCategoryPrice_categoryId_idx" ON "CompanyCategoryPrice"("categoryId");

ALTER TABLE "CompanyCategoryPrice" ADD CONSTRAINT "CompanyCategoryPrice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyCategoryPrice" ADD CONSTRAINT "CompanyCategoryPrice_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
