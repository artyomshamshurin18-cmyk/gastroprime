-- CreateTable
CREATE TABLE "DailyMenu" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMenuItem" (
    "id" TEXT NOT NULL,
    "dailyMenuId" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "maxQuantity" INTEGER NOT NULL DEFAULT 100,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyMenu" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DaySelection" (
    "id" TEXT NOT NULL,
    "weeklyMenuId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "utensils" INTEGER NOT NULL DEFAULT 1,
    "needBread" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "DaySelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectedDish" (
    "id" TEXT NOT NULL,
    "daySelectionId" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SelectedDish_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyMenu_date_key" ON "DailyMenu"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyMenuItem_dailyMenuId_dishId_key" ON "DailyMenuItem"("dailyMenuId", "dishId");

-- CreateIndex
CREATE INDEX "WeeklyMenu_userId_idx" ON "WeeklyMenu"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DaySelection_weeklyMenuId_date_key" ON "DaySelection"("weeklyMenuId", "date");

-- AddForeignKey
ALTER TABLE "DailyMenuItem" ADD CONSTRAINT "DailyMenuItem_dailyMenuId_fkey" FOREIGN KEY ("dailyMenuId") REFERENCES "DailyMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMenuItem" ADD CONSTRAINT "DailyMenuItem_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyMenu" ADD CONSTRAINT "WeeklyMenu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DaySelection" ADD CONSTRAINT "DaySelection_weeklyMenuId_fkey" FOREIGN KEY ("weeklyMenuId") REFERENCES "WeeklyMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedDish" ADD CONSTRAINT "SelectedDish_daySelectionId_fkey" FOREIGN KEY ("daySelectionId") REFERENCES "DaySelection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedDish" ADD CONSTRAINT "SelectedDish_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
