--
-- PostgreSQL database dump
--

\restrict ZTBJv4C5krSEYKgUwawEsDboGynir0Vr73Ok3vNccLqpo8soXZpRxdVevEQleVg

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: catering
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO catering;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: catering
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: BillingSettings; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."BillingSettings" (
    key text DEFAULT 'main'::text NOT NULL,
    "sellerName" text,
    "sellerAddress" text,
    "sellerDetails" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BillingSettings" OWNER TO catering;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Category" OWNER TO catering;

--
-- Name: ChatAttachment; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."ChatAttachment" (
    id text NOT NULL,
    "messageId" text NOT NULL,
    "fileName" text NOT NULL,
    "fileUrl" text NOT NULL,
    "mimeType" text NOT NULL,
    "sizeBytes" integer NOT NULL,
    kind text DEFAULT 'FILE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChatAttachment" OWNER TO catering;

--
-- Name: ChatConversation; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."ChatConversation" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    title text,
    type text DEFAULT 'COMPANY_SUPPORT'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChatConversation" OWNER TO catering;

--
-- Name: ChatInvite; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."ChatInvite" (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "companyId" text NOT NULL,
    "createdByUserId" text NOT NULL,
    token text NOT NULL,
    label text,
    "expiresAt" timestamp(3) without time zone,
    "revokedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChatInvite" OWNER TO catering;

--
-- Name: ChatInviteGuest; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."ChatInviteGuest" (
    id text NOT NULL,
    "inviteId" text NOT NULL,
    "userId" text NOT NULL,
    "accessToken" text NOT NULL,
    "guestName" text NOT NULL,
    "guestEmail" text,
    "guestPhone" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastSeenAt" timestamp(3) without time zone
);


ALTER TABLE public."ChatInviteGuest" OWNER TO catering;

--
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."ChatMessage" (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "senderId" text NOT NULL,
    text text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChatMessage" OWNER TO catering;

--
-- Name: ChatParticipant; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."ChatParticipant" (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "userId" text NOT NULL,
    "canManageParticipants" boolean DEFAULT false NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastReadAt" timestamp(3) without time zone
);


ALTER TABLE public."ChatParticipant" OWNER TO catering;

--
-- Name: Company; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."Company" (
    id text NOT NULL,
    name text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "contactPerson" text,
    address text,
    "logoUrl" text,
    "billingAddress" text,
    "billingDetails" text,
    "entryConditions" text,
    "routeName" text,
    "deliveryTime" text,
    "peopleCount" integer,
    notes text,
    "mealPlan" text,
    "workEmail" text,
    website text,
    "priceSegment" text DEFAULT 'STANDARD'::text NOT NULL,
    "defaultSetType" text DEFAULT 'FULL'::text NOT NULL,
    "accountNumber" text DEFAULT 'N/A'::text NOT NULL,
    balance integer DEFAULT 0 NOT NULL,
    "creditBalance" integer DEFAULT 0 NOT NULL,
    "limit" integer DEFAULT 50000 NOT NULL,
    "dailyLimit" integer DEFAULT 0 NOT NULL,
    "userId" text,
    phone text
);


ALTER TABLE public."Company" OWNER TO catering;

--
-- Name: CompanyCategoryPrice; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."CompanyCategoryPrice" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "categoryId" text NOT NULL,
    price integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CompanyCategoryPrice" OWNER TO catering;

--
-- Name: CompanyDocument; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."CompanyDocument" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    name text NOT NULL,
    filename text NOT NULL,
    size integer DEFAULT 0 NOT NULL,
    "mimeType" text DEFAULT 'application/octet-stream'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CompanyDocument" OWNER TO catering;

--
-- Name: CrmDeal; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."CrmDeal" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "managerId" text NOT NULL,
    stage text DEFAULT 'LEAD'::text NOT NULL,
    probability integer DEFAULT 10 NOT NULL,
    "nextContactDate" timestamp(3) without time zone,
    source text DEFAULT 'COLD'::text NOT NULL,
    notes text,
    "estimatedAmount" integer DEFAULT 0 NOT NULL,
    "minPrice" integer,
    "maxPrice" integer,
    "workDays" integer,
    "closedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CrmDeal" OWNER TO catering;

--
-- Name: CrmDealLog; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."CrmDealLog" (
    id text NOT NULL,
    "dealId" text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    "oldValue" text,
    "newValue" text,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CrmDealLog" OWNER TO catering;

--
-- Name: CrmPayment; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."CrmPayment" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    amount integer NOT NULL,
    type text DEFAULT 'PAYMENT'::text NOT NULL,
    method text DEFAULT 'BANK_TRANSFER'::text NOT NULL,
    description text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CrmPayment" OWNER TO catering;

--
-- Name: CrmRoute; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."CrmRoute" (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "driverName" text NOT NULL,
    "driverPhone" text,
    "vehicleInfo" text,
    "totalStops" integer DEFAULT 0 NOT NULL,
    "totalOrders" integer DEFAULT 0 NOT NULL,
    "totalAmount" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'PLANNED'::text NOT NULL,
    notes text,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CrmRoute" OWNER TO catering;

--
-- Name: CrmRouteStop; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."CrmRouteStop" (
    id text NOT NULL,
    "routeId" text NOT NULL,
    "companyId" text NOT NULL,
    "orderId" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "deliveredAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CrmRouteStop" OWNER TO catering;

--
-- Name: CrmTask; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."CrmTask" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "userId" text NOT NULL,
    "dealId" text,
    "companyId" text,
    type text DEFAULT 'FOLLOW_UP'::text NOT NULL,
    priority text DEFAULT 'NORMAL'::text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CrmTask" OWNER TO catering;

--
-- Name: DailyMenu; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."DailyMenu" (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DailyMenu" OWNER TO catering;

--
-- Name: DailyMenuItem; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."DailyMenuItem" (
    id text NOT NULL,
    "dailyMenuId" text NOT NULL,
    "dishId" text NOT NULL,
    "maxQuantity" integer DEFAULT 100 NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "garnishDishId" text
);


ALTER TABLE public."DailyMenuItem" OWNER TO catering;

--
-- Name: DaySelection; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."DaySelection" (
    id text NOT NULL,
    "weeklyMenuId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    utensils integer DEFAULT 1 NOT NULL,
    "needBread" boolean DEFAULT true NOT NULL,
    notes text
);


ALTER TABLE public."DaySelection" OWNER TO catering;

--
-- Name: DeliveryClosing; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."DeliveryClosing" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'DELIVERED'::text NOT NULL,
    "deviationAmount" integer DEFAULT 0 NOT NULL,
    "deviationComment" text,
    "managerComment" text,
    "createdById" text,
    "updatedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DeliveryClosing" OWNER TO catering;

--
-- Name: Dish; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."Dish" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "photoUrl" text,
    price integer NOT NULL,
    calories integer,
    weight integer,
    "measureUnit" text DEFAULT 'GRAM'::text NOT NULL,
    "containsPork" boolean DEFAULT false NOT NULL,
    "containsGarlic" boolean DEFAULT false NOT NULL,
    "containsMayonnaise" boolean DEFAULT false NOT NULL,
    "breakfastPart" text,
    "categoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Dish" OWNER TO catering;

--
-- Name: EmployeeAttendance; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."EmployeeAttendance" (
    id text NOT NULL,
    "userId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'OFFICE'::text NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EmployeeAttendance" OWNER TO catering;

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    number text NOT NULL,
    "companyId" text NOT NULL,
    type text DEFAULT 'PERIOD'::text NOT NULL,
    status text DEFAULT 'ISSUED'::text NOT NULL,
    "periodStart" timestamp(3) without time zone,
    "periodEnd" timestamp(3) without time zone,
    "issueDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone,
    currency text DEFAULT 'KZT'::text NOT NULL,
    subtotal integer DEFAULT 0 NOT NULL,
    "deviationTotal" integer DEFAULT 0 NOT NULL,
    total integer DEFAULT 0 NOT NULL,
    comment text,
    "buyerSnapshotName" text NOT NULL,
    "buyerSnapshotAddress" text,
    "buyerSnapshotDetails" text,
    "sellerSnapshotName" text NOT NULL,
    "sellerSnapshotAddress" text,
    "sellerSnapshotDetails" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Invoice" OWNER TO catering;

--
-- Name: InvoiceLine; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."InvoiceLine" (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    date timestamp(3) without time zone,
    description text NOT NULL,
    quantity integer,
    "unitPrice" integer,
    amount integer DEFAULT 0 NOT NULL,
    "deviationAmount" integer DEFAULT 0 NOT NULL,
    total integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."InvoiceLine" OWNER TO catering;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" text NOT NULL,
    "companyId" text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "totalAmount" integer NOT NULL,
    "deliveryDate" timestamp(3) without time zone NOT NULL,
    "deliveryTime" text,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Order" OWNER TO catering;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "dishId" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" integer NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO catering;

--
-- Name: SelectedDish; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."SelectedDish" (
    id text NOT NULL,
    "daySelectionId" text NOT NULL,
    "dishId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."SelectedDish" OWNER TO catering;

--
-- Name: SupportMessage; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."SupportMessage" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "userId" text NOT NULL,
    text text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SupportMessage" OWNER TO catering;

--
-- Name: User; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text,
    "lastName" text,
    "jobTitle" text,
    phone text,
    allergies text,
    "avatarUrl" text,
    role text DEFAULT 'CLIENT'::text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "companyId" text,
    "mealModeOverride" text,
    "setTypeOverride" text,
    "isHalal" boolean DEFAULT false NOT NULL,
    "isVip" boolean DEFAULT false NOT NULL,
    "avoidGarlic" boolean DEFAULT false NOT NULL,
    "avoidMayonnaise" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO catering;

--
-- Name: WeeklyMenu; Type: TABLE; Schema: public; Owner: catering
--

CREATE TABLE public."WeeklyMenu" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WeeklyMenu" OWNER TO catering;

--
-- Data for Name: BillingSettings; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."BillingSettings" (key, "sellerName", "sellerAddress", "sellerDetails", "createdAt", "updatedAt") FROM stdin;
main	\N	\N	\N	2026-05-01 12:47:05.585	2026-05-01 12:47:05.585
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."Category" (id, name, "createdAt") FROM stdin;
f31119c5-4543-5a1e-939b-b155a4ef59fd	Второе без свинины	2026-05-01 13:23:05.85
6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	Второе свинина	2026-05-01 13:23:05.853
cc6f943f-76a9-5cdd-b591-81322b474218	Гарнир картофельный	2026-05-01 13:23:05.854
bd2dc83e-50de-5b56-9fd6-a0d8542b4d7b	Гарнир крупа	2026-05-01 13:23:05.855
3b1090aa-80aa-58b4-97ef-afe93fba4610	Гарнир макароны	2026-05-01 13:23:05.856
229b4aeb-5913-5977-a0bc-06b323f15ead	Завтрак дополнительное	2026-05-01 13:23:05.857
15010c6f-6fbd-5b14-a1de-61e64aa65d48	Завтрак основное	2026-05-01 13:23:05.858
b8175c31-9e4c-5a52-be93-bc3e1ad282da	Премиум меню второе	2026-05-01 13:23:05.859
3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	Премиум меню салат	2026-05-01 13:23:05.86
db52dfdc-02cf-549c-9ede-938a89b3963e	Премиум меню суп	2026-05-01 13:23:05.861
84935dc2-5d82-56c5-969b-c5df4e41360a	Салат с майонезом	2026-05-01 13:23:05.862
184419e0-a676-5f0b-8e9e-df5333cf9fa3	Салаты без майонеза	2026-05-01 13:23:05.863
ab0d14a1-ab6a-56c2-ba03-9022a33d099f	Суп без свинины	2026-05-01 13:23:05.864
e12c64b4-a8ca-56bc-8bfc-f03007e92532	Суп со свининой	2026-05-01 13:23:05.865
\.


--
-- Data for Name: ChatAttachment; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."ChatAttachment" (id, "messageId", "fileName", "fileUrl", "mimeType", "sizeBytes", kind, "createdAt") FROM stdin;
\.


--
-- Data for Name: ChatConversation; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."ChatConversation" (id, "companyId", title, type, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChatInvite; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."ChatInvite" (id, "conversationId", "companyId", "createdByUserId", token, label, "expiresAt", "revokedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChatInviteGuest; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."ChatInviteGuest" (id, "inviteId", "userId", "accessToken", "guestName", "guestEmail", "guestPhone", "createdAt", "lastSeenAt") FROM stdin;
\.


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."ChatMessage" (id, "conversationId", "senderId", text, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChatParticipant; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."ChatParticipant" (id, "conversationId", "userId", "canManageParticipants", "joinedAt", "lastReadAt") FROM stdin;
\.


--
-- Data for Name: Company; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."Company" (id, name, status, "contactPerson", address, "logoUrl", "billingAddress", "billingDetails", "entryConditions", "routeName", "deliveryTime", "peopleCount", notes, "mealPlan", "workEmail", website, "priceSegment", "defaultSetType", "accountNumber", balance, "creditBalance", "limit", "dailyLimit", "userId", phone) FROM stdin;
d3622cc6-34ac-4c9d-9cad-036e1de0471f	Gastroprime	ACTIVE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	STANDARD	FULL	GP-32A0E19	50000	0	50000	0	\N	\N
a3258b35-9579-4d15-938b-1cb5ef8b1635	Test Lead	ACTIVE	Test		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	STANDARD	FULL	N/A	0	0	50000	0	\N	\N
69c18e7c-34fc-4759-a626-b856d83af972	ООО ПРимер	ACTIVE	Иванов Иван	Москва ленина	\N	\N	\N	\N	\N	\N	1	Телефон: 7 999 999 99 9	Обед	artyom.shamshurin18@gmail.com	\N	STANDARD	FULL	N/A	5000000	0	50000	0	\N	\N
61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	ООО ПРимер	ACTIVE	Иванов Иван	Москва ленина	\N	\N	\N	\N	\N	\N	1	Телефон: 7 999 999 99 9	Обед	artyom.shamshurin18@gmail.com	\N	STANDARD	FULL	N/A	494208	1872	50000	0	\N	\N
7b12c69e-afda-49ac-842b-b546b855be4a	Test Lead	ACTIVE	Test		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	STANDARD	FULL	N/A	0	0	50000	0	\N	\N
4a7a67d8-0391-4b28-a67e-05e9bac2f6ca	Тестовый лид	CRM_LEAD	Иван		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	STANDARD	FULL	N/A	0	0	50000	0	\N	\N
2bd7c040-34cf-499e-93a8-60d0228ae003	Клиника Люблинская	ACTIVE	Светлана Казачкова	\N	\N	\N	\N	\N	\N	\N	\N	\N	Обед	\N	\N	STANDARD	FULL	N/A	0	0	50000	0	\N	\N
9c90febc-840e-4809-859e-40bb45d0bf38	Тест Контракт	ACTIVE	Test		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	STANDARD	FULL	N/A	0	0	50000	0	\N	\N
07c5708e-ae47-40f5-a196-2f38a60a5102	Fqwert	ACTIVE	qwe	qwer	\N	\N	\N	\N	\N	\N	1	Телефон: 123	\N	qwe	\N	STANDARD	FULL	N/A	0	0	50000	0	\N	\N
ecc45c65-cf9c-4f4c-a69a-63dfe05d4cb5	1	ACTIVE	1	1	\N	\N	\N	\N	\N	\N	1	Телефон: 1	Обед	1	\N	STANDARD	FULL	N/A	0	0	50000	0	\N	\N
\.


--
-- Data for Name: CompanyCategoryPrice; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."CompanyCategoryPrice" (id, "companyId", "categoryId", price, "createdAt", "updatedAt") FROM stdin;
e91b69dc-89f3-40e9-8d32-a4d7232f4b5a	2bd7c040-34cf-499e-93a8-60d0228ae003	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	170	2026-05-01 13:47:34.266	2026-05-01 13:47:34.266
b40b6d40-54e8-4fee-bb31-e4c1e94c6a83	2bd7c040-34cf-499e-93a8-60d0228ae003	cc6f943f-76a9-5cdd-b591-81322b474218	40	2026-05-01 13:47:34.266	2026-05-01 13:47:34.266
efd5a492-f2f8-405c-aa01-e66c8f21bda1	2bd7c040-34cf-499e-93a8-60d0228ae003	bd2dc83e-50de-5b56-9fd6-a0d8542b4d7b	40	2026-05-01 13:47:34.266	2026-05-01 13:47:34.266
f1714efc-9ece-4d32-9251-e5ff8bf8e207	2bd7c040-34cf-499e-93a8-60d0228ae003	3b1090aa-80aa-58b4-97ef-afe93fba4610	40	2026-05-01 13:47:34.266	2026-05-01 13:47:34.266
f7efa9be-e9e9-4a5b-a133-d13c585434ef	2bd7c040-34cf-499e-93a8-60d0228ae003	15010c6f-6fbd-5b14-a1de-61e64aa65d48	180	2026-05-01 13:47:34.266	2026-05-01 13:47:34.266
4f30d619-d735-4a85-92d9-3176de19e3c0	2bd7c040-34cf-499e-93a8-60d0228ae003	84935dc2-5d82-56c5-969b-c5df4e41360a	70	2026-05-01 13:47:34.266	2026-05-01 13:47:34.266
b98a15ea-596b-492b-a402-ff4b94859e48	2bd7c040-34cf-499e-93a8-60d0228ae003	184419e0-a676-5f0b-8e9e-df5333cf9fa3	70	2026-05-01 13:47:34.266	2026-05-01 13:47:34.266
bbf08f74-b2f1-4d33-b2e9-e693b0283793	2bd7c040-34cf-499e-93a8-60d0228ae003	ab0d14a1-ab6a-56c2-ba03-9022a33d099f	110	2026-05-01 13:47:34.266	2026-05-01 13:47:34.266
c22bbecd-acc4-4695-a9ea-7ef4f661258a	2bd7c040-34cf-499e-93a8-60d0228ae003	e12c64b4-a8ca-56bc-8bfc-f03007e92532	110	2026-05-01 13:47:34.266	2026-05-01 13:47:34.266
db51707a-a0aa-4133-b94e-843dbfab865b	ecc45c65-cf9c-4f4c-a69a-63dfe05d4cb5	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	115	2026-05-01 14:11:32.785	2026-05-01 14:11:32.785
91751e62-a8c9-4591-a078-cddea14906bd	ecc45c65-cf9c-4f4c-a69a-63dfe05d4cb5	ab0d14a1-ab6a-56c2-ba03-9022a33d099f	123	2026-05-01 14:11:32.785	2026-05-01 14:11:32.785
a2ac0ae9-c9f9-4f6a-8311-cb3e9212b43d	ecc45c65-cf9c-4f4c-a69a-63dfe05d4cb5	f31119c5-4543-5a1e-939b-b155a4ef59fd	120	2026-05-01 14:11:32.785	2026-05-01 14:11:32.785
3bef743f-1d2f-438f-8be3-1ec3e54a81a8	ecc45c65-cf9c-4f4c-a69a-63dfe05d4cb5	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	111	2026-05-01 14:11:32.785	2026-05-01 14:11:32.785
f5cc11e8-52c4-494a-8b9e-71c860876ebb	ecc45c65-cf9c-4f4c-a69a-63dfe05d4cb5	cc6f943f-76a9-5cdd-b591-81322b474218	123	2026-05-01 14:11:32.785	2026-05-01 14:11:32.785
d82a0fd6-6634-411a-bdbb-8eb2ddc7113f	ecc45c65-cf9c-4f4c-a69a-63dfe05d4cb5	bd2dc83e-50de-5b56-9fd6-a0d8542b4d7b	123	2026-05-01 14:11:32.785	2026-05-01 14:11:32.785
50586c84-da67-4785-979e-4e71cec3851a	ecc45c65-cf9c-4f4c-a69a-63dfe05d4cb5	3b1090aa-80aa-58b4-97ef-afe93fba4610	123	2026-05-01 14:11:32.785	2026-05-01 14:11:32.785
a35fae40-8186-4e08-8091-ccd6138cafeb	ecc45c65-cf9c-4f4c-a69a-63dfe05d4cb5	229b4aeb-5913-5977-a0bc-06b323f15ead	123	2026-05-01 14:11:32.785	2026-05-01 14:11:32.785
4f782b39-0d64-4376-855c-8f4a487b1d3e	ecc45c65-cf9c-4f4c-a69a-63dfe05d4cb5	15010c6f-6fbd-5b14-a1de-61e64aa65d48	123	2026-05-01 14:11:32.785	2026-05-01 14:11:32.785
bac5ece8-2361-4f69-b163-3eb46e916bad	ecc45c65-cf9c-4f4c-a69a-63dfe05d4cb5	b8175c31-9e4c-5a52-be93-bc3e1ad282da	124	2026-05-01 14:11:32.785	2026-05-01 14:11:32.785
b87229f3-462d-4fb0-af9d-68aa8437c981	ecc45c65-cf9c-4f4c-a69a-63dfe05d4cb5	db52dfdc-02cf-549c-9ede-938a89b3963e	63	2026-05-01 14:11:32.785	2026-05-01 14:11:32.785
4986a3bb-af61-44dd-b1b0-41f51b365594	ecc45c65-cf9c-4f4c-a69a-63dfe05d4cb5	84935dc2-5d82-56c5-969b-c5df4e41360a	234	2026-05-01 14:11:32.785	2026-05-01 14:11:32.785
d97ec17d-bea7-481b-b79b-23086f27b188	ecc45c65-cf9c-4f4c-a69a-63dfe05d4cb5	184419e0-a676-5f0b-8e9e-df5333cf9fa3	123	2026-05-01 14:11:32.785	2026-05-01 14:11:32.785
036c1591-fca1-4bcb-bf66-b5203e24125a	ecc45c65-cf9c-4f4c-a69a-63dfe05d4cb5	e12c64b4-a8ca-56bc-8bfc-f03007e92532	123	2026-05-01 14:11:32.785	2026-05-01 14:11:32.785
49c9ad9d-2b63-4dd8-8b40-f53c001240c3	69c18e7c-34fc-4759-a626-b856d83af972	f31119c5-4543-5a1e-939b-b155a4ef59fd	123	2026-05-01 14:18:36.725	2026-05-01 14:18:36.725
2003bf34-7154-44a7-9460-025eba621488	69c18e7c-34fc-4759-a626-b856d83af972	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	12	2026-05-01 14:18:36.725	2026-05-01 14:18:36.725
01202db0-69af-4ed2-a0d6-6e8229bd83b3	69c18e7c-34fc-4759-a626-b856d83af972	cc6f943f-76a9-5cdd-b591-81322b474218	34	2026-05-01 14:18:36.725	2026-05-01 14:18:36.725
60776a91-e529-48ba-8e8f-b48e155fea29	69c18e7c-34fc-4759-a626-b856d83af972	bd2dc83e-50de-5b56-9fd6-a0d8542b4d7b	124	2026-05-01 14:18:36.725	2026-05-01 14:18:36.725
ea837145-59c4-4354-99f7-d99a9f804c3e	69c18e7c-34fc-4759-a626-b856d83af972	3b1090aa-80aa-58b4-97ef-afe93fba4610	51	2026-05-01 14:18:36.725	2026-05-01 14:18:36.725
54ca73ab-ab4b-43ed-8e89-3ff764ef2bfb	69c18e7c-34fc-4759-a626-b856d83af972	229b4aeb-5913-5977-a0bc-06b323f15ead	512	2026-05-01 14:18:36.725	2026-05-01 14:18:36.725
aa4ecfc1-7e63-464b-8e5c-4df21d749c1e	69c18e7c-34fc-4759-a626-b856d83af972	15010c6f-6fbd-5b14-a1de-61e64aa65d48	31	2026-05-01 14:18:36.725	2026-05-01 14:18:36.725
1c7c81fc-41ee-4f83-8877-7ff97f073de1	69c18e7c-34fc-4759-a626-b856d83af972	b8175c31-9e4c-5a52-be93-bc3e1ad282da	234	2026-05-01 14:18:36.725	2026-05-01 14:18:36.725
00be81d5-979c-46a3-ae79-526ee9b73625	69c18e7c-34fc-4759-a626-b856d83af972	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	123	2026-05-01 14:18:36.725	2026-05-01 14:18:36.725
9311ca5e-4833-422a-9300-2d03935ed812	69c18e7c-34fc-4759-a626-b856d83af972	db52dfdc-02cf-549c-9ede-938a89b3963e	1241	2026-05-01 14:18:36.725	2026-05-01 14:18:36.725
9d3b3bca-ed66-433f-86e2-b51076b362b0	69c18e7c-34fc-4759-a626-b856d83af972	84935dc2-5d82-56c5-969b-c5df4e41360a	23	2026-05-01 14:18:36.725	2026-05-01 14:18:36.725
0869443a-f178-445a-9872-6b04a9a3855c	69c18e7c-34fc-4759-a626-b856d83af972	184419e0-a676-5f0b-8e9e-df5333cf9fa3	1231	2026-05-01 14:18:36.725	2026-05-01 14:18:36.725
7622ffd5-8099-455d-b721-edc362e2a4e1	69c18e7c-34fc-4759-a626-b856d83af972	ab0d14a1-ab6a-56c2-ba03-9022a33d099f	241	2026-05-01 14:18:36.725	2026-05-01 14:18:36.725
9a9e5b58-66cc-417d-953f-ff8aba6a4561	69c18e7c-34fc-4759-a626-b856d83af972	e12c64b4-a8ca-56bc-8bfc-f03007e92532	24	2026-05-01 14:18:36.725	2026-05-01 14:18:36.725
83c62cb4-de06-4ab4-b93c-1ddae1167abe	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	f31119c5-4543-5a1e-939b-b155a4ef59fd	312	2026-05-01 14:18:42.562	2026-05-01 14:18:42.562
94f84ff4-528a-4ed0-857b-0e18082e492f	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	412	2026-05-01 14:18:42.562	2026-05-01 14:18:42.562
959959a6-1e14-4a9b-971a-3ffb60c7e4e9	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	cc6f943f-76a9-5cdd-b591-81322b474218	4123	2026-05-01 14:18:42.562	2026-05-01 14:18:42.562
b5814a58-882b-4841-981c-4462f15981d4	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	bd2dc83e-50de-5b56-9fd6-a0d8542b4d7b	51	2026-05-01 14:18:42.562	2026-05-01 14:18:42.562
a291fdc8-89dd-473a-989d-3504edf582c2	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	3b1090aa-80aa-58b4-97ef-afe93fba4610	2312	2026-05-01 14:18:42.562	2026-05-01 14:18:42.562
c5c07e0a-07bb-4943-b9ab-b951e750d6e0	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	229b4aeb-5913-5977-a0bc-06b323f15ead	31	2026-05-01 14:18:42.562	2026-05-01 14:18:42.562
ae845bdc-2147-4fe4-8a7b-33a7108e47cf	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	15010c6f-6fbd-5b14-a1de-61e64aa65d48	231	2026-05-01 14:18:42.562	2026-05-01 14:18:42.562
0a26fb8b-3688-4c3a-a269-0b9e59b08f6c	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	b8175c31-9e4c-5a52-be93-bc3e1ad282da	23	2026-05-01 14:18:42.562	2026-05-01 14:18:42.562
e8506c74-61dd-44a2-8cd3-790906b7a04d	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	3123	2026-05-01 14:18:42.562	2026-05-01 14:18:42.562
408c0740-d07e-43aa-8cd8-d8da57cbe34b	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	db52dfdc-02cf-549c-9ede-938a89b3963e	12	2026-05-01 14:18:42.562	2026-05-01 14:18:42.562
4ba2eadc-d775-4ff5-a136-9304680e1f50	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	84935dc2-5d82-56c5-969b-c5df4e41360a	123	2026-05-01 14:18:42.562	2026-05-01 14:18:42.562
d22eca15-f5bf-439a-9eb5-c02eb0002a14	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	184419e0-a676-5f0b-8e9e-df5333cf9fa3	1231	2026-05-01 14:18:42.562	2026-05-01 14:18:42.562
4810e5b3-f132-4b7d-a1d3-7dac2a202964	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	ab0d14a1-ab6a-56c2-ba03-9022a33d099f	231	2026-05-01 14:18:42.562	2026-05-01 14:18:42.562
ff936765-3f91-4300-89ba-dc24f27adc83	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	e12c64b4-a8ca-56bc-8bfc-f03007e92532	231	2026-05-01 14:18:42.562	2026-05-01 14:18:42.562
\.


--
-- Data for Name: CompanyDocument; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."CompanyDocument" (id, "companyId", name, filename, size, "mimeType", "createdAt") FROM stdin;
\.


--
-- Data for Name: CrmDeal; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."CrmDeal" (id, "companyId", "managerId", stage, probability, "nextContactDate", source, notes, "estimatedAmount", "minPrice", "maxPrice", "workDays", "closedAt", "createdAt", "updatedAt") FROM stdin;
5e555781-19b4-4853-b05c-bb0dd8de5d3f	7b12c69e-afda-49ac-842b-b546b855be4a	c67decbf-fb6b-44db-a24d-4f5949f7f205	CONTRACT	90	\N	COLD	\N	0	\N	\N	\N	\N	2026-05-01 13:37:40.828	2026-05-01 13:45:48.186
f7236988-2a8e-4444-bbc6-f4f4c19849d2	9c90febc-840e-4809-859e-40bb45d0bf38	c67decbf-fb6b-44db-a24d-4f5949f7f205	CONTRACT_SIGNED	100	\N	COLD	\N	0	\N	\N	\N	2026-05-01 13:47:48.977	2026-05-01 13:47:48.867	2026-05-01 13:47:48.98
7c83b152-64e0-406f-8fd1-f6119343a752	4a7a67d8-0391-4b28-a67e-05e9bac2f6ca	c67decbf-fb6b-44db-a24d-4f5949f7f205	CONTRACT	90	\N	COLD	\N	0	\N	\N	\N	\N	2026-05-01 13:43:40.483	2026-05-01 13:48:51.496
91d7b279-5151-4cb5-8354-add19dc04cd4	07c5708e-ae47-40f5-a196-2f38a60a5102	c67decbf-fb6b-44db-a24d-4f5949f7f205	CONTRACT	90	\N	COLD	\N	1	1	1	51	2026-05-01 14:07:02.777	2026-05-01 13:45:11.589	2026-05-01 14:07:21.388
\.


--
-- Data for Name: CrmDealLog; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."CrmDealLog" (id, "dealId", "userId", action, "oldValue", "newValue", comment, "createdAt") FROM stdin;
a004ce8a-5cf0-430e-a021-a0e21cbdfa24	5e555781-19b4-4853-b05c-bb0dd8de5d3f	c67decbf-fb6b-44db-a24d-4f5949f7f205	OTHER	\N	\N	Лид создан через форму создания	2026-05-01 13:37:40.832
e8d560cd-17c1-49ae-a131-ac9297f25b53	7c83b152-64e0-406f-8fd1-f6119343a752	c67decbf-fb6b-44db-a24d-4f5949f7f205	OTHER	\N	\N	Лид создан через форму создания	2026-05-01 13:43:40.487
f3ec8f7a-778d-4c69-8e4e-8dc7226889b8	91d7b279-5151-4cb5-8354-add19dc04cd4	c67decbf-fb6b-44db-a24d-4f5949f7f205	OTHER	\N	\N	Лид создан через форму создания	2026-05-01 13:45:11.592
b6f04eb1-387c-43e0-820f-a2cefa072524	f7236988-2a8e-4444-bbc6-f4f4c19849d2	c67decbf-fb6b-44db-a24d-4f5949f7f205	OTHER	\N	\N	Лид создан через форму создания	2026-05-01 13:47:48.87
\.


--
-- Data for Name: CrmPayment; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."CrmPayment" (id, "companyId", amount, type, method, description, date, "createdById", "createdAt") FROM stdin;
\.


--
-- Data for Name: CrmRoute; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."CrmRoute" (id, date, "driverName", "driverPhone", "vehicleInfo", "totalStops", "totalOrders", "totalAmount", status, notes, "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CrmRouteStop; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."CrmRouteStop" (id, "routeId", "companyId", "orderId", "sortOrder", status, "deliveredAt", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CrmTask; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."CrmTask" (id, title, description, "userId", "dealId", "companyId", type, priority, status, "dueDate", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DailyMenu; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."DailyMenu" (id, date, "createdAt", "updatedAt") FROM stdin;
da428c7b-e281-47da-ae73-3e16416652f3	2026-05-02 00:00:00	2026-05-01 13:29:23.715	2026-05-01 13:29:23.715
\.


--
-- Data for Name: DailyMenuItem; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."DailyMenuItem" (id, "dailyMenuId", "dishId", "maxQuantity", "sortOrder", "garnishDishId") FROM stdin;
61d12f1f-244b-4324-b8a1-ac957f50f43c	da428c7b-e281-47da-ae73-3e16416652f3	c8eaa235-5c31-5077-858c-b7900950b3e8	100	0	5f5a36e9-202c-541e-944c-887af2399684
6ee1c0c6-6aff-4050-a123-16668789ccc4	da428c7b-e281-47da-ae73-3e16416652f3	85725fb9-eca2-54e6-aee4-1815d6cffe71	100	1	a8109a6e-c45f-5e88-bcfc-179957e22ba5
\.


--
-- Data for Name: DaySelection; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."DaySelection" (id, "weeklyMenuId", date, utensils, "needBread", notes) FROM stdin;
\.


--
-- Data for Name: DeliveryClosing; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."DeliveryClosing" (id, "companyId", date, status, "deviationAmount", "deviationComment", "managerComment", "createdById", "updatedById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Dish; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."Dish" (id, name, description, "photoUrl", price, calories, weight, "measureUnit", "containsPork", "containsGarlic", "containsMayonnaise", "breakfastPart", "categoryId", "createdAt", "updatedAt") FROM stdin;
aba2781f-1c21-5e74-9483-d13f005d480a	Гречотто с курицей и грибами	крупа гречневая, филе куриное, шампиньоны, лук репчатый, сливки, сыр твердый, масло сливочное, масло растительное, соль, перец черный	\N	0	350	300	GRAM	t	f	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.866	2026-05-01 13:23:05.866
7c8121e0-f463-587d-b1d5-e497b367a52d	Гуляш из курицы	филе куриное, лук репчатый, морковь, томатная паста, мука пшеничная, масло растительное, вода/бульон, соль, паприка, перец черный, лавровый лист	\N	0	350	120	GRAM	t	f	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.868	2026-05-01 13:26:08.32
57e5d358-4e1c-5b09-93d1-9a2725eb8fa0	Жаркое куриное с перцем	курица, картофель, перец болгарский, морковь, лук репчатый, чеснок, масло растительное, соль, перец черный, зелень	\N	0	350	120	GRAM	t	f	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.87	2026-05-01 13:26:08.448
0a3b2964-4140-587b-8165-ad6918263d0e	Зразы куриные с сыром	фарш куриный, сыр твердый, лук репчатый, яйцо, хлеб пшеничный, молоко, сухари панировочные, масло растительное, соль, перец черный	\N	0	350	120	GRAM	t	f	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.871	2026-05-01 13:26:08.578
c8eaa235-5c31-5077-858c-b7900950b3e8	Кексы курино-чесночные	фарш куриный, яйцо, сыр, чеснок, сметана/сливки, мука пшеничная, зелень, масло растительное, соль, перец черный	\N	0	350	120	GRAM	t	t	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.872	2026-05-01 13:26:08.706
82d2ec72-14b9-58ec-add5-2b32bc4d5368	Котлета куриная	фарш куриный, лук репчатый, хлеб пшеничный, молоко, яйцо, сухари панировочные, масло растительное, соль, перец черный	\N	0	350	120	GRAM	t	f	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.873	2026-05-01 13:26:08.833
cc4f54fe-5c72-5bb8-9ede-a2ee7285c597	Курица Альфредо	филе куриное, сливки, сыр пармезан/твердый, чеснок, масло сливочное, масло растительное, соль, перец черный, зелень	\N	0	350	120	GRAM	t	f	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.874	2026-05-01 13:26:08.959
69859139-c9ef-52e9-82db-19fb6af3c6b3	Плов из курицы	рис, курица, морковь, лук репчатый, чеснок, масло растительное, соль, зира, куркума, перец черный	\N	0	350	300	GRAM	t	f	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.881	2026-05-01 13:23:05.881
04f188c4-c7b4-5700-8581-4bdf7a0682d8	Курица по-тайски в кисло-сладком соусе	филе куриное, соус кисло-сладкий, перец болгарский, морковь, лук репчатый, ананас, чеснок, имбирь, соевый соус, масло растительное, соль	\N	0	350	120	GRAM	t	f	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.877	2026-05-01 13:26:09.216
afd9855f-b669-5d8e-b8ae-d974690a452f	Курица с грибами в сливочном соусе	филе куриное, шампиньоны, сливки, лук репчатый, чеснок, масло растительное, масло сливочное, соль, перец черный	\N	0	350	120	GRAM	t	f	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.878	2026-05-01 13:26:09.346
b0c4273d-3897-5bf3-9a1b-3e29e542905c	Минтай в томатом соусе	минтай филе, лук репчатый, морковь, томатная паста, мука пшеничная, масло растительное, вода, соль, сахар, перец черный, лавровый лист	\N	0	350	120	GRAM	t	f	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.879	2026-05-01 13:26:09.475
3a7003b8-05a5-534d-bf8b-9f541afdb575	Печень куриная в сметанном соусе	печень куриная, сметана, лук репчатый, морковь, мука пшеничная, масло растительное, вода/бульон, соль, перец черный	\N	0	350	120	GRAM	t	f	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.88	2026-05-01 13:26:09.603
ac3671b1-f80d-51f6-964c-3ccce7cdcf9e	Рыба по-ленинградски	пангасиус, картофель, лук репчатый, яйцо, мука пшеничная, масло растительное, соль, перец черный, зелень	\N	0	350	120	GRAM	t	f	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.882	2026-05-01 13:26:09.731
591b45d7-6086-53bf-a72b-5c5778c4fefe	Тефтели куриные	фарш куриный, рис, лук репчатый, яйцо, томатная паста, сметана, мука пшеничная, масло растительное, соль, перец черный	\N	0	350	120	GRAM	t	f	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.883	2026-05-01 13:26:09.861
fb15811b-09f8-5aa9-81b9-c5fab5c4da2e	Чахохбили курица	курица, томаты, лук репчатый, чеснок, кинза/зелень, томатная паста, масло растительное, соль, хмели-сунели, перец черный	\N	0	350	120	GRAM	t	f	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.884	2026-05-01 13:26:09.991
a04a7aca-a53e-548b-b06a-9e3b93795511	Гуляш из свинины	свинина, лук репчатый, морковь, томатная паста, мука пшеничная, масло растительное, вода/бульон, соль, паприка, перец черный	\N	0	350	120	GRAM	t	f	f	\N	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	2026-05-01 13:23:05.889	2026-05-01 13:26:30.225
37ff1bee-876c-5a0e-a496-f9c0f0f6a14e	Гуляш свинина	свинина, лук репчатый, морковь, томатная паста, мука пшеничная, масло растительное, вода/бульон, соль, паприка, перец черный	\N	0	350	120	GRAM	t	f	f	\N	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	2026-05-01 13:23:05.89	2026-05-01 13:26:30.35
85725fb9-eca2-54e6-aee4-1815d6cffe71	Мясо по боярски	свинина, картофель, лук репчатый, шампиньоны, сыр твердый, майонез/сметана, масло растительное, соль, перец черный	\N	0	350	120	GRAM	t	f	f	\N	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	2026-05-01 13:23:05.891	2026-05-01 13:26:30.48
970ccecb-fc8d-5074-94a9-c4b160f564c7	Печень свиная в сметанном соусе	печень свиная, сметана, лук репчатый, морковь, мука пшеничная, масло растительное, вода/бульон, соль, перец черный	\N	0	350	120	GRAM	t	f	f	\N	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	2026-05-01 13:23:05.892	2026-05-01 13:26:30.606
e844789f-269a-5e92-a30d-cbcc1c49f590	Свинина с грибами  в сметане	свинина, шампиньоны, сметана, лук репчатый, чеснок, мука пшеничная, масло растительное, соль, перец черный	\N	0	350	120	GRAM	t	f	f	\N	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	2026-05-01 13:23:05.893	2026-05-01 13:26:30.73
abdcb211-51c6-511f-9b70-d6f59df2005f	Свинина с зеленой фасолью	свинина, фасоль стручковая, лук репчатый, морковь, чеснок, соевый соус, масло растительное, соль, перец черный	\N	0	350	120	GRAM	t	f	f	\N	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	2026-05-01 13:23:05.894	2026-05-01 13:26:30.853
d30dfad0-cbf7-5ec5-a19a-9b403e01e8fb	Соус болоньезе свинина-говядина	фарш свинина-говядина, томаты, томатная паста, лук репчатый, морковь, сельдерей, чеснок, масло растительное, соль, базилик, орегано, перец черный	\N	0	350	120	GRAM	t	f	f	\N	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	2026-05-01 13:23:05.895	2026-05-01 13:26:30.978
dfd93506-85ba-5a10-9cbe-2f8955935d06	Бигус (свинина)	свинина, капуста свежая, капуста квашеная, лук репчатый, морковь, томатная паста, масло растительное, соль, сахар, перец черный, лавровый лист	\N	0	350	300	GRAM	t	f	f	\N	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	2026-05-01 13:23:05.885	2026-05-01 13:26:41.656
2e40aa55-d0fc-5aab-89d1-19a16617d73d	Голубцы свинина	капуста белокочанная, фарш свиной, рис, лук репчатый, морковь, томатная паста, сметана, масло растительное, соль, перец черный	\N	0	350	300	GRAM	t	f	f	\N	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	2026-05-01 13:23:05.886	2026-05-01 13:26:41.778
ed335c4d-208b-5ab1-bf62-69b865476165	Греча по-купечески	крупа гречневая, свинина/говядина, лук репчатый, морковь, масло растительное, соль, перец черный, лавровый лист	\N	0	350	300	GRAM	t	f	f	\N	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	2026-05-01 13:23:05.887	2026-05-01 13:26:41.904
0492d020-b7ae-570c-9847-083bf919cac2	Салат Крабовый	крабовые палочки, рис, кукуруза, яйцо, огурцы, майонез, соль	\N	0	120	120	GRAM	f	f	t	\N	84935dc2-5d82-56c5-969b-c5df4e41360a	2026-05-01 13:23:05.985	2026-05-01 13:27:26.801
5de6314b-669d-5531-a4d9-8022094b6b3f	Гротен	картофель, сливки, сыр твердый, чеснок, масло сливочное, соль, мускатный орех, перец черный	\N	0	200	180	GRAM	f	f	f	\N	cc6f943f-76a9-5cdd-b591-81322b474218	2026-05-01 13:23:05.898	2026-05-01 13:28:15.3
2f862e61-b607-51bd-805d-b08c61a16810	Картофель отварной	картофель, вода, соль, масло сливочное, зелень	\N	0	200	180	GRAM	f	f	f	\N	cc6f943f-76a9-5cdd-b591-81322b474218	2026-05-01 13:23:05.899	2026-05-01 13:28:15.426
97ea59b5-f8b5-537b-84f9-17dae80fc284	Картофель по деревенски	картофель, масло растительное, чеснок, соль, паприка, перец черный, зелень	\N	0	200	180	GRAM	f	f	f	\N	cc6f943f-76a9-5cdd-b591-81322b474218	2026-05-01 13:23:05.9	2026-05-01 13:28:15.551
957b62db-387d-52ad-af1f-f7f2e1b0a13b	Пюре картофельное	картофель, молоко, масло сливочное, соль	\N	0	200	180	GRAM	f	f	f	\N	cc6f943f-76a9-5cdd-b591-81322b474218	2026-05-01 13:23:05.901	2026-05-01 13:28:15.679
a8109a6e-c45f-5e88-bcfc-179957e22ba5	Булугур	булгур, вода, масло сливочное/растительное, соль	\N	0	200	180	GRAM	f	f	f	\N	bd2dc83e-50de-5b56-9fd6-a0d8542b4d7b	2026-05-01 13:23:05.902	2026-05-01 13:28:21.762
5f5a36e9-202c-541e-944c-887af2399684	Гречка	крупа гречневая, вода, масло сливочное, соль	\N	0	200	180	GRAM	f	f	f	\N	bd2dc83e-50de-5b56-9fd6-a0d8542b4d7b	2026-05-01 13:23:05.903	2026-05-01 13:28:21.89
9d50b837-5346-52e9-adf6-13515f6fdf69	Киноа	киноа, вода, масло растительное/сливочное, соль	\N	0	200	180	GRAM	f	f	f	\N	bd2dc83e-50de-5b56-9fd6-a0d8542b4d7b	2026-05-01 13:23:05.904	2026-05-01 13:28:22.019
70ecc0d6-3ab0-5a1b-b026-140ecec41a05	Кус-кус	кус-кус, вода/бульон, масло сливочное, соль	\N	0	200	180	GRAM	f	f	f	\N	bd2dc83e-50de-5b56-9fd6-a0d8542b4d7b	2026-05-01 13:23:05.905	2026-05-01 13:28:22.144
e92fb64d-5376-58f2-9809-b133eccdb01c	Перловка	крупа перловая, вода, масло сливочное/растительное, соль	\N	0	200	180	GRAM	f	f	f	\N	bd2dc83e-50de-5b56-9fd6-a0d8542b4d7b	2026-05-01 13:23:05.906	2026-05-01 13:28:22.275
353f6656-71e0-5c9b-87db-b5a59fcb77db	Рис	рис, вода, масло сливочное/растительное, соль	\N	0	200	180	GRAM	f	f	f	\N	bd2dc83e-50de-5b56-9fd6-a0d8542b4d7b	2026-05-01 13:23:05.907	2026-05-01 13:28:22.4
b44c3d92-47c0-574e-bb98-49fc9123fc84	Рис с овощами	рис, морковь, горошек зеленый, кукуруза, перец болгарский, масло растительное, соль, специи	\N	0	200	180	GRAM	f	f	f	\N	bd2dc83e-50de-5b56-9fd6-a0d8542b4d7b	2026-05-01 13:23:05.908	2026-05-01 13:28:22.524
650459a6-affe-5411-9c82-f8632c76a6e6	Пенне	макаронные изделия пенне, вода, соль, масло сливочное/растительное	\N	0	200	180	GRAM	f	f	f	\N	3b1090aa-80aa-58b4-97ef-afe93fba4610	2026-05-01 13:23:05.909	2026-05-01 13:28:29.336
6c23665c-05dd-5b82-8356-0bd44edf1346	Спагетти	спагетти, вода, соль, масло сливочное/растительное	\N	0	200	180	GRAM	f	f	f	\N	3b1090aa-80aa-58b4-97ef-afe93fba4610	2026-05-01 13:23:05.91	2026-05-01 13:28:29.464
6c0a986a-a40c-5029-9700-4878b4e45aed	Спиральки	макаронные изделия спиральки, вода, соль, масло сливочное/растительное	\N	0	200	180	GRAM	f	f	f	\N	3b1090aa-80aa-58b4-97ef-afe93fba4610	2026-05-01 13:23:05.911	2026-05-01 13:28:29.594
36d76173-b090-5595-baad-1b3adc4b6d38	Английский рисовый пудинг	рис, молоко, сахар, яйцо, масло сливочное, ванилин, изюм/цукаты, соль	\N	0	250	180	GRAM	f	f	f	\N	15010c6f-6fbd-5b14-a1de-61e64aa65d48	2026-05-01 13:23:05.922	2026-05-01 13:28:37.662
6b0b9aa9-f79c-50b4-b7b8-0a9a210d8177	Блин с курицей 1 шт.	блин, куриное филе, лук репчатый, сливки/сметана, масло растительное, соль, перец черный	\N	0	250	100	GRAM	f	f	f	\N	229b4aeb-5913-5977-a0bc-06b323f15ead	2026-05-01 13:23:05.912	2026-05-01 13:28:49.388
afc618ab-3e42-5518-bf81-9852e9ac1b03	Блины классик 2 шт	мука пшеничная, молоко, яйцо, сахар, соль, масло растительное	\N	0	250	100	GRAM	f	f	f	\N	229b4aeb-5913-5977-a0bc-06b323f15ead	2026-05-01 13:23:05.913	2026-05-01 13:28:49.513
7763c271-1960-5dfa-aba6-ee8d85afa237	Блины курица	блины, куриное филе, лук репчатый, масло растительное, соль, перец черный	\N	0	250	100	GRAM	f	f	f	\N	229b4aeb-5913-5977-a0bc-06b323f15ead	2026-05-01 13:23:05.914	2026-05-01 13:28:49.637
936b73af-3e47-51e6-9613-365c00b7a865	Блины творог	блины, творог, сахар, яйцо, ванилин, масло сливочное	\N	0	250	100	GRAM	f	f	f	\N	229b4aeb-5913-5977-a0bc-06b323f15ead	2026-05-01 13:23:05.915	2026-05-01 13:28:49.759
238a4e23-d06d-5983-85aa-ece9cad46ce8	Бутерброд ветчина сыр	хлеб, ветчина, сыр	\N	0	270	100	GRAM	f	f	f	\N	229b4aeb-5913-5977-a0bc-06b323f15ead	2026-05-01 13:23:05.916	2026-05-01 13:28:49.883
130ae7f8-7f16-53ba-be3d-7d8cbefe209d	Бутерброд с сыром	хлеб, сыр	\N	0	200	100	GRAM	f	f	f	\N	229b4aeb-5913-5977-a0bc-06b323f15ead	2026-05-01 13:23:05.917	2026-05-01 13:28:50.009
7288f8bd-5976-57df-8cb3-16575c247ba8	Панкейки	мука пшеничная, молоко, яйцо, сахар, разрыхлитель, масло растительное, соль	\N	0	250	100	GRAM	f	f	f	\N	229b4aeb-5913-5977-a0bc-06b323f15ead	2026-05-01 13:23:05.918	2026-05-01 13:28:50.134
d304a273-bd15-588e-8b7f-dc25a8d64f59	Слойка	тесто слоеное, яйцо для смазки	\N	0	250	100	GRAM	f	f	f	\N	229b4aeb-5913-5977-a0bc-06b323f15ead	2026-05-01 13:23:05.919	2026-05-01 13:28:50.258
8a35864f-ced2-546b-afa6-e3149254ffb8	Слойка с фруктово-ягодной начинкой	тесто слоеное, начинка фруктово-ягодная, сахар, яйцо для смазки	\N	0	250	100	GRAM	f	f	f	\N	229b4aeb-5913-5977-a0bc-06b323f15ead	2026-05-01 13:23:05.92	2026-05-01 13:28:50.384
69431799-4fde-5031-ba93-4c3601fa9ecd	Яйцо отварное	яйцо куриное, вода, соль	\N	0	80	100	GRAM	f	f	f	\N	229b4aeb-5913-5977-a0bc-06b323f15ead	2026-05-01 13:23:05.921	2026-05-01 13:28:50.508
887d6fc6-c233-5dcc-ab32-3ebce779c4ca	Гороховый суп по барски с копченостями	горох, копчености мясные, картофель, морковь, лук репчатый, чеснок, масло растительное, соль, перец черный, лавровый лист	\N	0	400	350	GRAM	f	f	f	\N	db52dfdc-02cf-549c-9ede-938a89b3963e	2026-05-01 13:23:05.938	2026-05-01 13:23:05.938
78298c5f-cbb0-5ed9-9c12-0eae0a92d4ab	Китайский суп с яйцом и помидорами	бульон куриный/овощной, яйцо куриное, томаты, лук зеленый, соевый соус, крахмал, соль, перец белый	\N	0	400	350	GRAM	f	f	f	\N	db52dfdc-02cf-549c-9ede-938a89b3963e	2026-05-01 13:23:05.944	2026-05-01 13:23:05.944
b44009af-8819-5c6c-8a5c-175831d9d276	греческий салат	помидоры, огурцы, перец болгарский, сыр фета/брынза, маслины, лук красный, масло оливковое, лимонный сок, соль, орегано	\N	0	400	120	GRAM	f	f	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.939	2026-05-01 13:27:47.866
e06e3314-3efb-5164-b406-3d4481053252	запеченая тыква с твороженным сыром порци	тыква, сыр творожный, масло оливковое/растительное, мед/сахар, соль, перец черный, зелень	\N	0	400	120	GRAM	f	f	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.941	2026-05-01 13:27:47.99
ed869f2d-1ffa-5a19-90bd-09d24845d282	кедровый салат	микс салата, томаты, огурцы, сыр, кедровые орехи, масло оливковое, лимонный сок, соль	\N	0	400	120	GRAM	f	f	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.943	2026-05-01 13:27:48.115
b8f5f898-8d70-59d3-a022-b4966fb1f68c	бифштекс с яйцом и трюфельным пюре	фарш говяжий, лук репчатый, яйцо куриное, картофель, молоко, масло сливочное, трюфельное масло/паста, соль, перец черный	\N	0	400	300	GRAM	f	f	f	\N	b8175c31-9e4c-5a52-be93-bc3e1ad282da	2026-05-01 13:23:05.936	2026-05-01 13:28:03.474
0f244d62-1216-5f18-a588-0d9a5e02e7ac	запеченая тилапия с сыром и картофелем по-деревенски порция	тилапия, сыр твердый, картофель, масло растительное, лимонный сок, соль, перец черный, паприка, зелень	\N	0	400	300	GRAM	f	f	f	\N	b8175c31-9e4c-5a52-be93-bc3e1ad282da	2026-05-01 13:23:05.94	2026-05-01 13:28:03.599
9abdedb3-aa64-5ea7-89ba-147a11dc5961	индейка Унаги с пюре из батата порция	филе индейки, соус унаги, батат, молоко/сливки, масло сливочное, кунжут, соль, перец черный	\N	0	400	300	GRAM	f	f	f	\N	b8175c31-9e4c-5a52-be93-bc3e1ad282da	2026-05-01 13:23:05.942	2026-05-01 13:28:03.723
f1fcd3b0-ab02-5cfa-aada-de61d61e58aa	Запеканка твороженая с изюмом "Мамина"	творог, яйцо, сахар, манная крупа, сметана, изюм, ванилин, масло сливочное	\N	0	250	180	GRAM	f	f	f	\N	15010c6f-6fbd-5b14-a1de-61e64aa65d48	2026-05-01 13:23:05.923	2026-05-01 13:28:37.79
3140586b-baf2-56d6-ae1b-b3acfa06ae03	Каша 3 злака	хлопья 3 злака, молоко/вода, сахар, соль, масло сливочное	\N	0	135	180	GRAM	f	f	f	\N	15010c6f-6fbd-5b14-a1de-61e64aa65d48	2026-05-01 13:23:05.924	2026-05-01 13:28:37.919
af1aace1-5209-5aef-8344-bb9a8cf6a524	Каша гречневая	крупа гречневая, вода/молоко, сахар, соль, масло сливочное	\N	0	140	180	GRAM	f	f	f	\N	15010c6f-6fbd-5b14-a1de-61e64aa65d48	2026-05-01 13:23:05.925	2026-05-01 13:28:38.045
01a4d7ab-1a23-5d70-84b0-8625d95e71fb	Каша кукурузная молочная	крупа кукурузная, молоко, вода, сахар, соль, масло сливочное	\N	0	135	180	GRAM	f	f	f	\N	15010c6f-6fbd-5b14-a1de-61e64aa65d48	2026-05-01 13:23:05.926	2026-05-01 13:28:38.172
78d1cfce-4f4e-53a7-bc09-34a2c4bb9ab7	Каша овсяная молочная	хлопья овсяные, молоко, вода, сахар, соль, масло сливочное	\N	0	120	180	GRAM	f	f	f	\N	15010c6f-6fbd-5b14-a1de-61e64aa65d48	2026-05-01 13:23:05.927	2026-05-01 13:28:38.299
ce53c161-6796-5040-9781-2825829f797e	Каша овсянная молочная	хлопья овсяные, молоко, вода, сахар, соль, масло сливочное	\N	0	120	180	GRAM	f	f	f	\N	15010c6f-6fbd-5b14-a1de-61e64aa65d48	2026-05-01 13:23:05.928	2026-05-01 13:28:38.426
9bb634d6-bb04-53cf-9590-6a44abedbe9d	Каша пшенная молочная	пшено, молоко, вода, сахар, соль, масло сливочное	\N	0	135	180	GRAM	f	f	f	\N	15010c6f-6fbd-5b14-a1de-61e64aa65d48	2026-05-01 13:23:05.928	2026-05-01 13:28:38.553
5876668d-7a82-50ae-9c15-90488ff1338f	Каша рисовая молочная	рис, молоко, вода, сахар, соль, масло сливочное	\N	0	130	180	GRAM	f	f	f	\N	15010c6f-6fbd-5b14-a1de-61e64aa65d48	2026-05-01 13:23:05.929	2026-05-01 13:28:38.68
eb527eb2-18ef-5767-833d-77b242f4af06	Манный пудинг	манная крупа, молоко, яйцо, сахар, масло сливочное, ванилин, соль	\N	0	250	180	GRAM	f	f	f	\N	15010c6f-6fbd-5b14-a1de-61e64aa65d48	2026-05-01 13:23:05.93	2026-05-01 13:28:38.805
a869ed62-ad29-5298-9a2e-1f196c1fc17c	Омлет классик	яйцо куриное, молоко, масло сливочное, соль	\N	0	180	180	GRAM	f	f	f	\N	15010c6f-6fbd-5b14-a1de-61e64aa65d48	2026-05-01 13:23:05.931	2026-05-01 13:28:38.929
1195d2c9-2018-509d-a7d5-7b1d8bf6ac17	Омлет с ветчиной	яйцо куриное, молоко, ветчина, масло сливочное, соль	\N	0	180	180	GRAM	f	f	f	\N	15010c6f-6fbd-5b14-a1de-61e64aa65d48	2026-05-01 13:23:05.932	2026-05-01 13:28:39.054
2a9619df-9252-5097-9d6d-ccd6ff7a6254	Омлет с овощами	яйцо куриное, молоко, перец болгарский, томаты, зелень, масло сливочное, соль	\N	0	180	180	GRAM	f	f	f	\N	15010c6f-6fbd-5b14-a1de-61e64aa65d48	2026-05-01 13:23:05.933	2026-05-01 13:28:39.181
c5ff8937-4011-5927-9432-bcb18d355b5a	Скрэмбл	яйцо куриное, сливки/молоко, масло сливочное, соль	\N	0	250	180	GRAM	f	f	f	\N	15010c6f-6fbd-5b14-a1de-61e64aa65d48	2026-05-01 13:23:05.934	2026-05-01 13:28:39.309
14662d72-d1df-5081-bb62-25cc6f228a56	Сырники классические со сметаной 3 шт.	творог, яйцо, мука пшеничная, сахар, ванилин, масло растительное, сметана	\N	0	300	180	GRAM	f	f	f	\N	15010c6f-6fbd-5b14-a1de-61e64aa65d48	2026-05-01 13:23:05.935	2026-05-01 13:28:39.435
a01419cf-a40e-5592-b1fd-9445ed9ff459	Крем суп из шапминьонов	шампиньоны, картофель, лук репчатый, сливки, масло сливочное, бульон, соль, перец черный	\N	0	400	350	GRAM	f	f	f	\N	db52dfdc-02cf-549c-9ede-938a89b3963e	2026-05-01 13:23:05.946	2026-05-01 13:23:05.946
c05d3159-24e9-55ea-9bc0-4beca6e60380	Куриный суп со шпинатом и митболами	бульон куриный, митболы куриные, картофель, морковь, лук репчатый, шпинат, соль, перец черный	\N	0	400	350	GRAM	f	f	f	\N	db52dfdc-02cf-549c-9ede-938a89b3963e	2026-05-01 13:23:05.95	2026-05-01 13:23:05.95
ac41a24a-b343-5615-950d-4ac047e32a92	Куриный суп щавелем и яйцом	бульон куриный, курица, картофель, морковь, лук репчатый, щавель, яйцо, соль, перец черный	\N	0	400	350	GRAM	f	f	f	\N	db52dfdc-02cf-549c-9ede-938a89b3963e	2026-05-01 13:23:05.951	2026-05-01 13:23:05.951
4549fb23-80fc-594c-9196-33fbc9d7a169	Минестроне суп	бульон овощной, фасоль, картофель, морковь, лук репчатый, сельдерей, томаты, кабачок, макаронные изделия, масло оливковое, соль, базилик	\N	0	400	350	GRAM	f	f	f	\N	db52dfdc-02cf-549c-9ede-938a89b3963e	2026-05-01 13:23:05.954	2026-05-01 13:23:05.954
24d8aece-22cc-5480-8af6-1d4ae26bbff6	Наваристый борщ из говядины с французской булочкой и смальцем	говядина, бульон говяжий, свекла, капуста, картофель, морковь, лук репчатый, томатная паста, чеснок, масло растительное, соль, сахар, уксус, специи, булочка французская, смалец	\N	0	400	350	GRAM	f	f	f	\N	db52dfdc-02cf-549c-9ede-938a89b3963e	2026-05-01 13:23:05.956	2026-05-01 13:23:05.956
8a4e1598-0f64-5ebf-bb34-8cb01f6e6401	Окрошка на кефире	кефир, картофель, яйцо, огурцы, редис, зелень, колбаса/курица, соль, горчица	\N	0	400	350	GRAM	f	f	f	\N	db52dfdc-02cf-549c-9ede-938a89b3963e	2026-05-01 13:23:05.958	2026-05-01 13:23:05.958
96dab328-e40c-5ddd-9da4-0fd7cb31d1a7	малибу салат	куриное филе, ананас, сыр, яйцо, кукуруза, майонез, соль	\N	0	400	120	GRAM	f	f	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.953	2026-05-01 13:27:48.361
0a7fc9f6-606c-508a-8025-d3031477603f	нисуаз салат с тунцом порция	тунец, картофель, яйцо, фасоль стручковая, томаты, оливки, лист салата, масло оливковое, горчица, лимонный сок, соль	\N	0	400	120	GRAM	f	f	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.957	2026-05-01 13:27:48.486
3784a945-1d01-5ae8-9b6e-ff6ddb9c03ce	салат из белой фасоли с сельдерееем и мятой	фасоль белая, сельдерей стеблевой, лук красный, мята, масло оливковое/растительное, лимонный сок, соль, перец черный	\N	0	400	120	GRAM	f	f	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.963	2026-05-01 13:27:48.613
d63d44be-78f2-5e0f-a804-9d9aea664caf	салат с куриной грудкой и апельсиновой заправкой	куриная грудка, микс салата, апельсин, огурцы, томаты, масло оливковое, сок апельсина, горчица, мед, соль	\N	0	400	120	GRAM	f	f	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.948	2026-05-01 13:27:49.134
840632f8-3841-5a15-9f7e-5ee73ef57e6e	купаты из индейки с сыром + Гроттен	купаты из индейки, сыр, картофель, сливки, чеснок, масло сливочное, соль, перец черный	\N	0	400	300	GRAM	f	f	f	\N	b8175c31-9e4c-5a52-be93-bc3e1ad282da	2026-05-01 13:23:05.947	2026-05-01 13:28:03.846
737ef0a0-6a61-5fc8-9db9-6f0630688e64	куриный стейк с грибным сосусом	куриное филе, шампиньоны, сливки, лук репчатый, масло растительное, соль, перец черный	\N	0	400	300	GRAM	f	f	f	\N	b8175c31-9e4c-5a52-be93-bc3e1ad282da	2026-05-01 13:23:05.949	2026-05-01 13:28:03.972
bbd383db-98e8-51f8-bf4f-f6b231a5476c	курица карри с желтым рисом	куриное филе, рис, сливки/кокосовое молоко, лук репчатый, морковь, куркума, карри, масло растительное, соль	\N	0	400	300	GRAM	f	f	f	\N	b8175c31-9e4c-5a52-be93-bc3e1ad282da	2026-05-01 13:23:05.952	2026-05-01 13:28:04.096
0c55b8ae-a220-5f08-a5af-145192b1aa7e	мясо по французски	свинина, лук репчатый, картофель, сыр твердый, майонез/сметана, масло растительное, соль, перец черный	\N	0	400	300	GRAM	f	f	f	\N	b8175c31-9e4c-5a52-be93-bc3e1ad282da	2026-05-01 13:23:05.955	2026-05-01 13:28:04.22
b3dde62d-2482-5efb-9735-13ad3dd6604f	паста с куриной грудкой и шпинатом	паста, куриная грудка, шпинат, сливки, сыр, чеснок, масло растительное, соль, перец черный	\N	0	400	300	GRAM	f	f	f	\N	b8175c31-9e4c-5a52-be93-bc3e1ad282da	2026-05-01 13:23:05.959	2026-05-01 13:28:04.342
05d415fa-38a3-58b6-9dec-055b50ddd23c	паста с морепродуктами	паста, морепродукты, сливки/томатный соус, чеснок, лук репчатый, масло оливковое/растительное, соль, перец черный, зелень	\N	0	400	300	GRAM	f	f	f	\N	b8175c31-9e4c-5a52-be93-bc3e1ad282da	2026-05-01 13:23:05.96	2026-05-01 13:28:04.467
fa1c4971-41a8-545d-8ba5-6db20c3f7a45	печеные голубцы в духовке	капуста, фарш мясной, рис, лук репчатый, морковь, томатная паста, сметана, масло растительное, соль, перец черный	\N	0	400	300	GRAM	f	f	f	\N	b8175c31-9e4c-5a52-be93-bc3e1ad282da	2026-05-01 13:23:05.96	2026-05-01 13:28:04.593
51bd24a2-da89-5f56-8311-4f047d52df1e	плов из говядины	рис, говядина, морковь, лук репчатый, чеснок, масло растительное, соль, зира, барбарис, перец черный	\N	0	400	300	GRAM	f	f	f	\N	b8175c31-9e4c-5a52-be93-bc3e1ad282da	2026-05-01 13:23:05.961	2026-05-01 13:28:04.718
9791e795-a85a-586a-a1a2-9ac792d42885	Сливочный суп из лосося (крем-чиз)	лосось/горбуша, картофель, морковь, лук репчатый, сливки, сыр крем-чиз, масло сливочное, соль, перец черный, зелень	\N	0	400	350	GRAM	f	f	f	\N	db52dfdc-02cf-549c-9ede-938a89b3963e	2026-05-01 13:23:05.97	2026-05-01 13:23:05.97
18b29f76-c7a8-5818-ad5c-bf79337150e2	Суп пюре из брокколи	брокколи, картофель, лук репчатый, сливки, масло сливочное, бульон овощной, соль, перец черный	\N	0	400	350	GRAM	f	f	f	\N	db52dfdc-02cf-549c-9ede-938a89b3963e	2026-05-01 13:23:05.971	2026-05-01 13:23:05.971
73083857-2adc-520e-8c67-b5b27d0a149b	Сырный суп с горбушей	горбуша, картофель, морковь, лук репчатый, сыр плавленый, сливки, масло, соль, перец черный	\N	0	400	350	GRAM	f	f	f	\N	db52dfdc-02cf-549c-9ede-938a89b3963e	2026-05-01 13:23:05.972	2026-05-01 13:23:05.972
da477ebc-1657-50a2-a8fc-1f3646637e72	Том ям кхале с курицей	курица, бульон, кокосовое молоко, паста том ям, шампиньоны, томаты, лайм/лимон, имбирь, чеснок, кинза, соль	\N	0	400	350	GRAM	f	f	f	\N	db52dfdc-02cf-549c-9ede-938a89b3963e	2026-05-01 13:23:05.974	2026-05-01 13:23:05.974
9ceb7f3e-7903-538e-a081-719df93dbcd6	Тыквенный крем суп	тыква, картофель, морковь, лук репчатый, сливки, масло сливочное, бульон овощной, соль, мускатный орех	\N	0	400	350	GRAM	f	f	f	\N	db52dfdc-02cf-549c-9ede-938a89b3963e	2026-05-01 13:23:05.975	2026-05-01 13:23:05.975
2c7b0ef2-af36-520a-be35-e1348689adcd	Чечевичный суп	чечевица, картофель, морковь, лук репчатый, томаты, чеснок, масло растительное, соль, специи	\N	0	400	350	GRAM	f	f	f	\N	db52dfdc-02cf-549c-9ede-938a89b3963e	2026-05-01 13:23:05.979	2026-05-01 13:23:05.979
8ce455e4-b4ab-5c1d-9371-6a129c578ec6	Шурпа из говядины	говядина, картофель, морковь, лук репчатый, перец болгарский, томаты, чеснок, зелень, соль, зира, перец черный	\N	0	400	350	GRAM	f	f	f	\N	db52dfdc-02cf-549c-9ede-938a89b3963e	2026-05-01 13:23:05.98	2026-05-01 13:23:05.98
a3500d1f-f599-5c3e-802b-98b379737363	Салат из кальмаров	кальмар, яйцо, огурцы, лук репчатый, майонез, соль, перец черный	\N	0	120	120	GRAM	f	f	t	\N	84935dc2-5d82-56c5-969b-c5df4e41360a	2026-05-01 13:23:05.982	2026-05-01 13:27:26.425
24529209-6d53-531a-a31f-b9cf2d001fe5	Салат капуста с огурцами	капуста белокочанная, огурцы свежие, зелень, масло растительное, уксус/лимонный сок, сахар, соль	\N	0	120	120	GRAM	f	f	t	\N	84935dc2-5d82-56c5-969b-c5df4e41360a	2026-05-01 13:23:05.983	2026-05-01 13:27:26.547
249371a4-5dda-5ff3-8456-205ed15270c0	Салат Коул сло	капуста белокочанная, морковь, майонез, сметана/йогурт, сахар, уксус, соль, перец черный	\N	0	120	120	GRAM	f	f	t	\N	84935dc2-5d82-56c5-969b-c5df4e41360a	2026-05-01 13:23:05.984	2026-05-01 13:27:26.671
65827b05-4a13-59a7-bade-e1a760f974b9	салат с говяжьим языком порция	язык говяжий, огурцы, картофель/листья салата, яйцо, горошек, майонез/сметана, соль, перец черный	\N	0	400	120	GRAM	f	f	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.965	2026-05-01 13:27:48.86
13af8c50-27d6-50f9-9649-537970ea8b23	салат с жареными помидорами	томаты, микс салата, чеснок, масло растительное/оливковое, сыр, соль, перец черный	\N	0	400	120	GRAM	f	f	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.966	2026-05-01 13:27:49.01
8e4e9f01-0222-5d4f-8a79-93cf92d7a6f1	салат с утиной печенью	печень утиная, микс салата, яблоко/груша, лук красный, масло растительное, бальзамический соус, соль, перец черный	\N	0	400	120	GRAM	f	f	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.967	2026-05-01 13:27:49.256
cc29c484-e68e-5276-983d-d0b142444273	салат с фенхелем и морковью	фенхель, морковь, яблоко, зелень, масло оливковое/растительное, лимонный сок, соль	\N	0	400	120	GRAM	f	f	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.968	2026-05-01 13:27:49.377
1b3fe8e5-ed14-59f1-b0d7-3c3fa6804115	салат Тбилиси с говядиной	говядина отварная, фасоль красная, перец болгарский, лук красный, грецкий орех, кинза, чеснок, масло растительное, уксус, соль, хмели-сунели	\N	0	400	120	GRAM	f	f	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.969	2026-05-01 13:27:49.499
eaef288f-c152-5672-a39a-40f497567e99	французский салат  с говядиной порция	говядина отварная, картофель, огурцы, яйцо, сыр, майонез/сметана, горчица, соль, перец черный	\N	0	400	120	GRAM	f	f	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.978	2026-05-01 13:27:49.621
cf69b019-e280-5343-a54f-b5c748e1888f	томленая говядина с черносливом	говядина, чернослив, лук репчатый, морковь, томатная паста, масло растительное, бульон, соль, перец черный, лавровый лист	\N	0	400	300	GRAM	f	f	f	\N	b8175c31-9e4c-5a52-be93-bc3e1ad282da	2026-05-01 13:23:05.973	2026-05-01 13:28:04.964
694300d9-5b8b-5bee-87d0-53d1f7482154	удон с курицей	лапша удон, куриное филе, морковь, перец болгарский, лук репчатый, соевый соус, чеснок, масло растительное, кунжут	\N	0	400	300	GRAM	f	f	f	\N	b8175c31-9e4c-5a52-be93-bc3e1ad282da	2026-05-01 13:23:05.976	2026-05-01 13:28:05.087
b0ee5f0c-1506-505e-8927-9ac64ed8761d	утиное филес апельсиновым кремом и  бэйби-картофеле	филе утки, картофель бэйби, апельсин, сливки, масло сливочное, мед/сахар, соль, перец черный, тимьян	\N	0	400	300	GRAM	f	f	f	\N	b8175c31-9e4c-5a52-be93-bc3e1ad282da	2026-05-01 13:23:05.977	2026-05-01 13:28:05.212
570a1b4d-1fc7-5a26-8efa-23f2c1f51b53	Окрошка	квас/кефир, картофель, яйцо, огурцы, редис, колбаса/курица, зелень, соль, горчица	\N	0	120	350	GRAM	t	f	f	\N	ab0d14a1-ab6a-56c2-ba03-9022a33d099f	2026-05-01 13:23:06.004	2026-05-01 13:27:07.7
6121612d-84bd-5289-99ec-bb14ee700b2a	Свекольник	свекла, картофель, огурцы, яйцо, зелень, вода/кефир, лимонный сок, соль, сахар	\N	0	150	350	GRAM	t	f	f	\N	ab0d14a1-ab6a-56c2-ba03-9022a33d099f	2026-05-01 13:23:06.005	2026-05-01 13:27:07.822
82c0295a-5fe0-5c28-a28b-2cd1acfe4a5b	Суп грибной	шампиньоны/грибы, картофель, морковь, лук репчатый, крупа/вермишель, масло растительное, соль, перец черный	\N	0	150	350	GRAM	t	f	f	\N	ab0d14a1-ab6a-56c2-ba03-9022a33d099f	2026-05-01 13:23:06.006	2026-05-01 13:27:07.944
4f60e1fe-184f-5b6b-84b1-5bf4bd6e6086	Суп лапша по домашнему	куриный бульон, курица, лапша, картофель, морковь, лук репчатый, зелень, соль, перец черный	\N	0	150	350	GRAM	t	f	f	\N	ab0d14a1-ab6a-56c2-ba03-9022a33d099f	2026-05-01 13:23:06.007	2026-05-01 13:27:08.068
94ae8640-84a9-574a-a2b2-57c68b4708f3	Сырный	куриный/овощной бульон, картофель, морковь, лук репчатый, сыр плавленый, сливки, масло, соль, перец черный	\N	0	150	350	GRAM	t	f	f	\N	ab0d14a1-ab6a-56c2-ba03-9022a33d099f	2026-05-01 13:23:06.008	2026-05-01 13:27:08.19
185c5278-bec2-5708-9b1c-c3a8391b3313	Щи из свежей капусты с курицей	курица, капуста свежая, картофель, морковь, лук репчатый, томатная паста, масло растительное, соль, перец черный, лавровый лист	\N	0	150	350	GRAM	t	f	f	\N	ab0d14a1-ab6a-56c2-ba03-9022a33d099f	2026-05-01 13:23:06.009	2026-05-01 13:27:08.313
43e9b4c5-1314-5668-94ce-39cbcc37aae3	Гречневый суп со свининой	свинина, крупа гречневая, картофель, морковь, лук репчатый, масло растительное, соль, перец черный, лавровый лист	\N	0	150	350	GRAM	t	f	f	\N	e12c64b4-a8ca-56bc-8bfc-f03007e92532	2026-05-01 13:23:06.01	2026-05-01 13:27:15.723
0bd3643c-df65-5603-a792-c30d74c83241	Салат Рыбный	рыба консервированная/отварная, картофель, морковь, яйцо, лук репчатый, майонез, соль	\N	0	120	120	GRAM	f	f	t	\N	84935dc2-5d82-56c5-969b-c5df4e41360a	2026-05-01 13:23:05.987	2026-05-01 13:27:27.051
5b1153ba-5e07-5388-a689-2ea3135f7250	Салат Свекольный с чесноком и черносливом	свекла, чернослив, чеснок, грецкий орех, майонез/масло, соль	\N	0	120	120	GRAM	f	t	t	\N	84935dc2-5d82-56c5-969b-c5df4e41360a	2026-05-01 13:23:05.988	2026-05-01 13:27:27.178
9912a221-b239-5dc6-8aaa-572e58f5b64d	Салат с зеленым горошком и курицей	куриное филе, горошек зеленый, огурцы, яйцо, картофель, майонез, соль	\N	0	120	120	GRAM	f	f	t	\N	84935dc2-5d82-56c5-969b-c5df4e41360a	2026-05-01 13:23:05.989	2026-05-01 13:27:27.32
b0270935-4c53-5e84-ad4c-14a46aace723	Салат Фасолевый	фасоль красная/белая, огурцы маринованные, лук репчатый, зелень, масло растительное/майонез, соль	\N	0	120	120	GRAM	f	f	t	\N	84935dc2-5d82-56c5-969b-c5df4e41360a	2026-05-01 13:23:05.99	2026-05-01 13:27:27.446
235f214c-31be-59f8-a704-f88c7e35ea67	Столичный	курица, картофель, морковь, яйцо, огурцы маринованные, горошек, майонез, соль	\N	0	120	120	GRAM	f	f	t	\N	84935dc2-5d82-56c5-969b-c5df4e41360a	2026-05-01 13:23:05.991	2026-05-01 13:27:27.568
296a959f-993c-597d-ba2d-2d5792cf2307	Битые огруцы	огурцы свежие, чеснок, соевый соус, уксус, масло растительное, кунжут, соль, сахар	\N	0	120	120	GRAM	f	t	f	\N	184419e0-a676-5f0b-8e9e-df5333cf9fa3	2026-05-01 13:23:05.992	2026-05-01 13:27:35.472
82f1c6c3-b319-52ec-8059-2bc1c8cd7d1d	Винегрет	свекла, картофель, морковь, огурцы соленые, капуста квашеная, горошек зеленый, масло растительное, соль	\N	0	120	120	GRAM	f	f	f	\N	184419e0-a676-5f0b-8e9e-df5333cf9fa3	2026-05-01 13:23:05.993	2026-05-01 13:27:35.592
6ab9012e-df91-5dfa-80f6-c0d45c86ab37	Грибы по корейски	шампиньоны, морковь, чеснок, уксус, масло растительное, сахар, соль, кориандр, перец	\N	0	120	120	GRAM	f	t	f	\N	184419e0-a676-5f0b-8e9e-df5333cf9fa3	2026-05-01 13:23:05.993	2026-05-01 13:27:35.718
a24bf948-feb2-5a33-a943-272e13100a92	Пилюстка	капуста белокочанная, свекла, морковь, чеснок, уксус, сахар, соль, масло растительное, специи	\N	0	120	120	GRAM	f	f	f	\N	184419e0-a676-5f0b-8e9e-df5333cf9fa3	2026-05-01 13:23:05.995	2026-05-01 13:27:35.843
b5d04712-2778-5d97-9421-4a5fdb2fea5d	Провансаль	капуста маринованная, морковь, перец болгарский, чеснок, масло растительное, уксус, сахар, соль	\N	0	120	120	GRAM	f	f	f	\N	184419e0-a676-5f0b-8e9e-df5333cf9fa3	2026-05-01 13:23:05.997	2026-05-01 13:27:35.966
94704050-2e07-5a97-9216-5cf67fecc6a0	Салат Деревенский	картофель, огурцы соленые, грибы маринованные, лук репчатый, зелень, масло растительное, соль	\N	0	120	120	GRAM	f	f	f	\N	184419e0-a676-5f0b-8e9e-df5333cf9fa3	2026-05-01 13:23:05.998	2026-05-01 13:27:36.088
4dd0cfb1-bb73-5bad-94a5-3b7233e32df5	Салат морковь по-корейски	морковь, чеснок, масло растительное, уксус, сахар, соль, кориандр, перец	\N	0	120	120	GRAM	f	t	f	\N	184419e0-a676-5f0b-8e9e-df5333cf9fa3	2026-05-01 13:23:05.999	2026-05-01 13:27:36.211
672a9a57-62f1-5975-b0ed-17b529d721f4	Салат свекольный с сыром фета	свекла, сыр фета, лист салата/зелень, масло растительное/оливковое, лимонный сок, соль	\N	0	120	120	GRAM	f	f	f	\N	184419e0-a676-5f0b-8e9e-df5333cf9fa3	2026-05-01 13:23:06	2026-05-01 13:27:36.333
3482c9b2-84e1-586a-a0e8-f74ddc1e95d5	Фунчеза	лапша фунчоза, морковь, огурцы, перец болгарский, чеснок, соевый соус, масло растительное, уксус, соль	\N	0	120	120	GRAM	f	t	f	\N	184419e0-a676-5f0b-8e9e-df5333cf9fa3	2026-05-01 13:23:06.001	2026-05-01 13:27:36.454
51529a2b-f511-539c-8b17-e1ae5e7f9ef5	Чукка	водоросли чука, ореховый соус, кунжут	\N	0	120	120	GRAM	f	f	f	\N	184419e0-a676-5f0b-8e9e-df5333cf9fa3	2026-05-01 13:23:06.002	2026-05-01 13:27:36.578
5f5075e1-ec51-5d23-9327-3e5b2fc12e68	Курица по-мескикански	филе куриное, фасоль красная, кукуруза, томаты, перец болгарский, лук репчатый, чеснок, масло растительное, соль, паприка, перец чили	\N	0	350	120	GRAM	t	f	f	\N	f31119c5-4543-5a1e-939b-b155a4ef59fd	2026-05-01 13:23:05.876	2026-05-01 13:26:09.086
46b61dbb-d78b-56cd-8600-6cf33f75abeb	Тефтели свиные	фарш свиной, рис, лук репчатый, яйцо, томатная паста, сметана, мука пшеничная, масло растительное, соль, перец черный	\N	0	350	120	GRAM	t	f	f	\N	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	2026-05-01 13:23:05.896	2026-05-01 13:26:31.102
a824a08d-8cda-5929-a6f2-2237937f77c5	Фрикадельки в томатно-сливочном соусе	фарш мясной, лук репчатый, яйцо, сухари панировочные, томатная паста, сливки, мука пшеничная, масло растительное, соль, перец черный	\N	0	350	120	GRAM	t	f	f	\N	6d3d1ea9-fecc-5e2a-89ae-dc52b88944f9	2026-05-01 13:23:05.897	2026-05-01 13:26:31.227
3cf6f219-2d40-59b0-9a81-f9099f0ab5c7	Овощной	помидоры, огурцы, перец болгарский, лук красный, зелень, масло растительное, соль	\N	0	150	350	GRAM	t	f	f	\N	ab0d14a1-ab6a-56c2-ba03-9022a33d099f	2026-05-01 13:23:06.003	2026-05-01 13:27:07.574
bfb1c4a3-73eb-5f7b-9480-50aa5ae0e71f	Рассольник Ленинградский	говядина/курица, перловка, картофель, огурцы соленые, рассол, морковь, лук репчатый, томатная паста, масло растительное, соль, перец черный	\N	0	150	350	GRAM	t	f	f	\N	e12c64b4-a8ca-56bc-8bfc-f03007e92532	2026-05-01 13:23:06.011	2026-05-01 13:27:15.848
8324cee5-e3c4-5063-8f7b-548135f12c86	Солянка сборная	говядина/колбасные изделия, огурцы соленые, лук репчатый, томатная паста, маслины, лимон, масло растительное, соль, перец черный	\N	0	150	350	GRAM	t	f	f	\N	e12c64b4-a8ca-56bc-8bfc-f03007e92532	2026-05-01 13:23:06.012	2026-05-01 13:27:15.971
cc9478dc-ea4a-5412-aa18-845131ada94a	Суп гороховый с копченостями	горох, копчености мясные, картофель, морковь, лук репчатый, масло растительное, соль, перец черный, лавровый лист	\N	0	150	350	GRAM	t	f	f	\N	e12c64b4-a8ca-56bc-8bfc-f03007e92532	2026-05-01 13:23:06.013	2026-05-01 13:27:16.092
2fb8b4bb-ac0c-5b32-8c95-972303b47895	Суп с фрикадельками	фарш мясной, картофель, морковь, лук репчатый, яйцо, зелень, соль, перец черный, лавровый лист	\N	0	150	350	GRAM	t	f	f	\N	e12c64b4-a8ca-56bc-8bfc-f03007e92532	2026-05-01 13:23:06.014	2026-05-01 13:27:16.215
3e894bf1-a08e-5985-ba6c-6cca26acd4ad	Суп Харчо на свинине	свинина, рис, томатная паста/томаты, лук репчатый, чеснок, зелень, ткемали/кислота, хмели-сунели, соль, перец	\N	0	150	350	GRAM	t	t	f	\N	e12c64b4-a8ca-56bc-8bfc-f03007e92532	2026-05-01 13:23:06.015	2026-05-01 13:27:16.339
e721e4ce-7145-55ff-98e0-25de05d08d88	Щи из квашеной капусты	квашеная капуста, мясной/куриный бульон, картофель, морковь, лук репчатый, томатная паста, масло растительное, соль, перец черный, лавровый лист	\N	0	150	350	GRAM	t	f	f	\N	e12c64b4-a8ca-56bc-8bfc-f03007e92532	2026-05-01 13:23:06.016	2026-05-01 13:27:16.464
6b499ef0-88cf-5269-a092-8f6ac581ff53	Оливье	картофель, морковь, яйцо, огурцы маринованные, горошек зеленый, колбаса вареная/курица, майонез, соль	\N	0	120	120	GRAM	f	f	t	\N	84935dc2-5d82-56c5-969b-c5df4e41360a	2026-05-01 13:23:05.981	2026-05-01 13:27:26.303
0baa1de3-f565-5e77-b689-3d06ff714b84	Салат морковь с чесноком и сыром	морковь, сыр, чеснок, майонез, соль	\N	0	120	120	GRAM	f	t	t	\N	84935dc2-5d82-56c5-969b-c5df4e41360a	2026-05-01 13:23:05.986	2026-05-01 13:27:26.926
dd0bef0f-ba3b-52fa-bdd7-2d77330d7254	броколи в чесночном соусе салат порция	брокколи, чеснок, масло растительное/оливковое, лимонный сок, соль, перец черный	\N	0	400	120	GRAM	f	t	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.937	2026-05-01 13:27:47.742
c30f958a-3a19-5e12-9f05-9af5d94d3e39	креветки с томатами и зеленью	креветки, томаты, чеснок, зелень, масло оливковое/растительное, лимонный сок, соль, перец черный	\N	0	400	120	GRAM	f	f	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.945	2026-05-01 13:27:48.24
1420c2fe-a8b8-5f40-9860-a673b42b0d91	салат из картофеля зеленой фасоли и тунца	картофель, фасоль стручковая, тунец, яйцо, лук красный, масло растительное/оливковое, горчица, лимонный сок, соль	\N	0	400	120	GRAM	f	f	f	\N	3843c1af-8b05-5ddc-8f0d-8ab4caddb43d	2026-05-01 13:23:05.964	2026-05-01 13:27:48.738
e70897b0-dcaa-55b5-94fa-ffdb2d28d006	рагу из оссобуко с картофельным пюре порция	оссобуко говяжье, лук репчатый, морковь, сельдерей, томаты, вино/бульон, чеснок, картофель, молоко, масло сливочное, соль, перец черный	\N	0	400	300	GRAM	f	f	f	\N	b8175c31-9e4c-5a52-be93-bc3e1ad282da	2026-05-01 13:23:05.962	2026-05-01 13:28:04.842
\.


--
-- Data for Name: EmployeeAttendance; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."EmployeeAttendance" (id, "userId", date, status, comment, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."Invoice" (id, number, "companyId", type, status, "periodStart", "periodEnd", "issueDate", "dueDate", currency, subtotal, "deviationTotal", total, comment, "buyerSnapshotName", "buyerSnapshotAddress", "buyerSnapshotDetails", "sellerSnapshotName", "sellerSnapshotAddress", "sellerSnapshotDetails", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: InvoiceLine; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."InvoiceLine" (id, "invoiceId", date, description, quantity, "unitPrice", amount, "deviationAmount", total, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."Order" (id, "orderNumber", "userId", "companyId", status, "totalAmount", "deliveryDate", "deliveryTime", comment, "createdAt", "updatedAt") FROM stdin;
06411953-96f0-408e-baca-a9ac81a10f88	WM-368507A2-MOMZQ1BH	db8e2d5c-751f-41e2-8e56-bd991acb54c9	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	PAID	0	2026-05-02 00:00:00	\N	Списание заявки на меню	2026-05-01 14:10:43.374	2026-05-01 14:10:43.374
f3a59bb2-cafe-414b-903e-8fc4ff47e647	WM-65466E0E-MON00MV6	db8e2d5c-751f-41e2-8e56-bd991acb54c9	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	PAID	1760	2026-05-02 00:00:00	\N	Списание заявки на меню	2026-05-01 14:18:57.858	2026-05-01 14:18:57.858
ae7ef137-f3a1-4e91-8f94-f1c2db1cfc3a	WM-3E8BA1AF-MON01O4X	db8e2d5c-751f-41e2-8e56-bd991acb54c9	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	PAID	2584	2026-05-02 00:00:00	\N	Списание заявки на меню	2026-05-01 14:19:46.162	2026-05-01 14:19:46.162
efed98bf-88ea-45e4-a224-bbaad2f47836	WM-101931BE-MON06KIC	db8e2d5c-751f-41e2-8e56-bd991acb54c9	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	PAID	1448	2026-05-02 00:00:00	\N	Списание заявки на меню	2026-05-01 14:23:34.741	2026-05-01 14:23:34.741
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."OrderItem" (id, "orderId", "dishId", quantity, "unitPrice") FROM stdin;
1537ccf1-8b7e-45e5-9c57-1547c94b65e4	06411953-96f0-408e-baca-a9ac81a10f88	c8eaa235-5c31-5077-858c-b7900950b3e8	2	0
07e4a067-2769-4d95-bcd8-614cfbb10e77	06411953-96f0-408e-baca-a9ac81a10f88	85725fb9-eca2-54e6-aee4-1815d6cffe71	3	0
6363c6d8-e06b-40b9-977b-4f75ee71cbcc	f3a59bb2-cafe-414b-903e-8fc4ff47e647	c8eaa235-5c31-5077-858c-b7900950b3e8	3	312
13feed7f-0f9a-4163-b389-a6d85f49d793	f3a59bb2-cafe-414b-903e-8fc4ff47e647	85725fb9-eca2-54e6-aee4-1815d6cffe71	2	412
099d95cb-26a1-4337-b290-d8c4f2a28451	ae7ef137-f3a1-4e91-8f94-f1c2db1cfc3a	85725fb9-eca2-54e6-aee4-1815d6cffe71	4	412
6dcada29-3f5a-43d5-bed1-2d151f17e78f	ae7ef137-f3a1-4e91-8f94-f1c2db1cfc3a	c8eaa235-5c31-5077-858c-b7900950b3e8	3	312
1153c875-f0ab-4c3e-8477-bb8340529f30	efed98bf-88ea-45e4-a224-bbaad2f47836	c8eaa235-5c31-5077-858c-b7900950b3e8	2	312
1c716f45-f52b-4645-b7b8-7b24f51338f7	efed98bf-88ea-45e4-a224-bbaad2f47836	85725fb9-eca2-54e6-aee4-1815d6cffe71	2	412
\.


--
-- Data for Name: SelectedDish; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."SelectedDish" (id, "daySelectionId", "dishId", quantity) FROM stdin;
\.


--
-- Data for Name: SupportMessage; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."SupportMessage" (id, "companyId", "userId", text, "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."User" (id, email, password, "firstName", "lastName", "jobTitle", phone, allergies, "avatarUrl", role, status, "companyId", "mealModeOverride", "setTypeOverride", "isHalal", "isVip", "avoidGarlic", "avoidMayonnaise", "createdAt", "updatedAt") FROM stdin;
c67decbf-fb6b-44db-a24d-4f5949f7f205	admin@catering.com	$2b$10$frY.O4Ugg2QD4SzQJ/xAEOW2lN5nBMPhOnC8xKZ15WefmkAjGRzu.	ADMIN	\N	\N	\N	\N	\N	SUPERADMIN	ACTIVE	d3622cc6-34ac-4c9d-9cad-036e1de0471f	\N	\N	f	f	f	f	2026-05-01 12:45:33.643	2026-05-01 12:45:33.643
82e4639c-5eae-4518-820f-c538806fc924	сlient	$2b$10$FBhmZWoShj7EYpNMq/b2XeCZQLP9vtXDuJuVcptNbRwgFw9wr1hny			\N	\N	\N	\N	CLIENT	ACTIVE	a3258b35-9579-4d15-938b-1cb5ef8b1635	\N	\N	f	f	f	f	2026-05-01 14:09:17.141	2026-05-01 14:09:17.141
db8e2d5c-751f-41e2-8e56-bd991acb54c9	client2	$2b$10$Q2pA7TfNdMNIbTYeMQGz5ebXUzCxrsTmZmSYUXbj.LfBgUvVVuadq			\N	\N	\N	\N	CLIENT	ACTIVE	61f12bb7-241a-4b9d-a73d-b8bc5f5495b1	\N	\N	f	f	f	f	2026-05-01 14:10:07.792	2026-05-01 14:10:07.792
\.


--
-- Data for Name: WeeklyMenu; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."WeeklyMenu" (id, "userId", "startDate", "endDate", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: BillingSettings BillingSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."BillingSettings"
    ADD CONSTRAINT "BillingSettings_pkey" PRIMARY KEY (key);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: ChatAttachment ChatAttachment_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatAttachment"
    ADD CONSTRAINT "ChatAttachment_pkey" PRIMARY KEY (id);


--
-- Name: ChatConversation ChatConversation_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatConversation"
    ADD CONSTRAINT "ChatConversation_pkey" PRIMARY KEY (id);


--
-- Name: ChatInviteGuest ChatInviteGuest_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatInviteGuest"
    ADD CONSTRAINT "ChatInviteGuest_pkey" PRIMARY KEY (id);


--
-- Name: ChatInvite ChatInvite_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatInvite"
    ADD CONSTRAINT "ChatInvite_pkey" PRIMARY KEY (id);


--
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: ChatParticipant ChatParticipant_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatParticipant"
    ADD CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY (id);


--
-- Name: CompanyCategoryPrice CompanyCategoryPrice_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CompanyCategoryPrice"
    ADD CONSTRAINT "CompanyCategoryPrice_pkey" PRIMARY KEY (id);


--
-- Name: CompanyDocument CompanyDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CompanyDocument"
    ADD CONSTRAINT "CompanyDocument_pkey" PRIMARY KEY (id);


--
-- Name: Company Company_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_pkey" PRIMARY KEY (id);


--
-- Name: CrmDealLog CrmDealLog_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmDealLog"
    ADD CONSTRAINT "CrmDealLog_pkey" PRIMARY KEY (id);


--
-- Name: CrmDeal CrmDeal_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmDeal"
    ADD CONSTRAINT "CrmDeal_pkey" PRIMARY KEY (id);


--
-- Name: CrmPayment CrmPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmPayment"
    ADD CONSTRAINT "CrmPayment_pkey" PRIMARY KEY (id);


--
-- Name: CrmRouteStop CrmRouteStop_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmRouteStop"
    ADD CONSTRAINT "CrmRouteStop_pkey" PRIMARY KEY (id);


--
-- Name: CrmRoute CrmRoute_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmRoute"
    ADD CONSTRAINT "CrmRoute_pkey" PRIMARY KEY (id);


--
-- Name: CrmTask CrmTask_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmTask"
    ADD CONSTRAINT "CrmTask_pkey" PRIMARY KEY (id);


--
-- Name: DailyMenuItem DailyMenuItem_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."DailyMenuItem"
    ADD CONSTRAINT "DailyMenuItem_pkey" PRIMARY KEY (id);


--
-- Name: DailyMenu DailyMenu_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."DailyMenu"
    ADD CONSTRAINT "DailyMenu_pkey" PRIMARY KEY (id);


--
-- Name: DaySelection DaySelection_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."DaySelection"
    ADD CONSTRAINT "DaySelection_pkey" PRIMARY KEY (id);


--
-- Name: DeliveryClosing DeliveryClosing_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."DeliveryClosing"
    ADD CONSTRAINT "DeliveryClosing_pkey" PRIMARY KEY (id);


--
-- Name: Dish Dish_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."Dish"
    ADD CONSTRAINT "Dish_pkey" PRIMARY KEY (id);


--
-- Name: EmployeeAttendance EmployeeAttendance_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."EmployeeAttendance"
    ADD CONSTRAINT "EmployeeAttendance_pkey" PRIMARY KEY (id);


--
-- Name: InvoiceLine InvoiceLine_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."InvoiceLine"
    ADD CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: SelectedDish SelectedDish_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."SelectedDish"
    ADD CONSTRAINT "SelectedDish_pkey" PRIMARY KEY (id);


--
-- Name: SupportMessage SupportMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."SupportMessage"
    ADD CONSTRAINT "SupportMessage_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WeeklyMenu WeeklyMenu_pkey; Type: CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."WeeklyMenu"
    ADD CONSTRAINT "WeeklyMenu_pkey" PRIMARY KEY (id);


--
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- Name: ChatAttachment_messageId_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "ChatAttachment_messageId_idx" ON public."ChatAttachment" USING btree ("messageId");


--
-- Name: ChatConversation_companyId_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "ChatConversation_companyId_idx" ON public."ChatConversation" USING btree ("companyId");


--
-- Name: ChatConversation_companyId_type_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "ChatConversation_companyId_type_key" ON public."ChatConversation" USING btree ("companyId", type);


--
-- Name: ChatInviteGuest_accessToken_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "ChatInviteGuest_accessToken_key" ON public."ChatInviteGuest" USING btree ("accessToken");


--
-- Name: ChatInviteGuest_inviteId_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "ChatInviteGuest_inviteId_idx" ON public."ChatInviteGuest" USING btree ("inviteId");


--
-- Name: ChatInviteGuest_userId_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "ChatInviteGuest_userId_key" ON public."ChatInviteGuest" USING btree ("userId");


--
-- Name: ChatInvite_companyId_revokedAt_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "ChatInvite_companyId_revokedAt_idx" ON public."ChatInvite" USING btree ("companyId", "revokedAt");


--
-- Name: ChatInvite_conversationId_revokedAt_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "ChatInvite_conversationId_revokedAt_idx" ON public."ChatInvite" USING btree ("conversationId", "revokedAt");


--
-- Name: ChatInvite_token_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "ChatInvite_token_key" ON public."ChatInvite" USING btree (token);


--
-- Name: ChatMessage_conversationId_createdAt_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "ChatMessage_conversationId_createdAt_idx" ON public."ChatMessage" USING btree ("conversationId", "createdAt");


--
-- Name: ChatMessage_senderId_createdAt_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "ChatMessage_senderId_createdAt_idx" ON public."ChatMessage" USING btree ("senderId", "createdAt");


--
-- Name: ChatParticipant_conversationId_userId_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "ChatParticipant_conversationId_userId_key" ON public."ChatParticipant" USING btree ("conversationId", "userId");


--
-- Name: ChatParticipant_userId_lastReadAt_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "ChatParticipant_userId_lastReadAt_idx" ON public."ChatParticipant" USING btree ("userId", "lastReadAt");


--
-- Name: CompanyCategoryPrice_categoryId_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "CompanyCategoryPrice_categoryId_idx" ON public."CompanyCategoryPrice" USING btree ("categoryId");


--
-- Name: CompanyCategoryPrice_companyId_categoryId_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "CompanyCategoryPrice_companyId_categoryId_key" ON public."CompanyCategoryPrice" USING btree ("companyId", "categoryId");


--
-- Name: CompanyCategoryPrice_companyId_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "CompanyCategoryPrice_companyId_idx" ON public."CompanyCategoryPrice" USING btree ("companyId");


--
-- Name: CompanyDocument_companyId_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "CompanyDocument_companyId_idx" ON public."CompanyDocument" USING btree ("companyId");


--
-- Name: Company_userId_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "Company_userId_key" ON public."Company" USING btree ("userId");


--
-- Name: CrmDealLog_dealId_createdAt_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "CrmDealLog_dealId_createdAt_idx" ON public."CrmDealLog" USING btree ("dealId", "createdAt");


--
-- Name: CrmDeal_companyId_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "CrmDeal_companyId_idx" ON public."CrmDeal" USING btree ("companyId");


--
-- Name: CrmDeal_managerId_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "CrmDeal_managerId_idx" ON public."CrmDeal" USING btree ("managerId");


--
-- Name: CrmDeal_stage_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "CrmDeal_stage_idx" ON public."CrmDeal" USING btree (stage);


--
-- Name: CrmPayment_companyId_date_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "CrmPayment_companyId_date_idx" ON public."CrmPayment" USING btree ("companyId", date);


--
-- Name: CrmRouteStop_routeId_companyId_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "CrmRouteStop_routeId_companyId_key" ON public."CrmRouteStop" USING btree ("routeId", "companyId");


--
-- Name: CrmRouteStop_routeId_sortOrder_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "CrmRouteStop_routeId_sortOrder_idx" ON public."CrmRouteStop" USING btree ("routeId", "sortOrder");


--
-- Name: CrmRoute_date_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "CrmRoute_date_idx" ON public."CrmRoute" USING btree (date);


--
-- Name: CrmTask_dealId_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "CrmTask_dealId_idx" ON public."CrmTask" USING btree ("dealId");


--
-- Name: CrmTask_dueDate_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "CrmTask_dueDate_idx" ON public."CrmTask" USING btree ("dueDate");


--
-- Name: CrmTask_userId_status_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "CrmTask_userId_status_idx" ON public."CrmTask" USING btree ("userId", status);


--
-- Name: DailyMenuItem_dailyMenuId_dishId_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "DailyMenuItem_dailyMenuId_dishId_key" ON public."DailyMenuItem" USING btree ("dailyMenuId", "dishId");


--
-- Name: DailyMenu_date_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "DailyMenu_date_key" ON public."DailyMenu" USING btree (date);


--
-- Name: DaySelection_weeklyMenuId_date_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "DaySelection_weeklyMenuId_date_key" ON public."DaySelection" USING btree ("weeklyMenuId", date);


--
-- Name: DeliveryClosing_companyId_date_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "DeliveryClosing_companyId_date_key" ON public."DeliveryClosing" USING btree ("companyId", date);


--
-- Name: EmployeeAttendance_userId_date_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "EmployeeAttendance_userId_date_key" ON public."EmployeeAttendance" USING btree ("userId", date);


--
-- Name: Invoice_number_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "Invoice_number_key" ON public."Invoice" USING btree (number);


--
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- Name: SupportMessage_companyId_createdAt_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "SupportMessage_companyId_createdAt_idx" ON public."SupportMessage" USING btree ("companyId", "createdAt");


--
-- Name: SupportMessage_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "SupportMessage_userId_createdAt_idx" ON public."SupportMessage" USING btree ("userId", "createdAt");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: catering
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: WeeklyMenu_userId_idx; Type: INDEX; Schema: public; Owner: catering
--

CREATE INDEX "WeeklyMenu_userId_idx" ON public."WeeklyMenu" USING btree ("userId");


--
-- Name: ChatAttachment ChatAttachment_messageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatAttachment"
    ADD CONSTRAINT "ChatAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES public."ChatMessage"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatConversation ChatConversation_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatConversation"
    ADD CONSTRAINT "ChatConversation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatInviteGuest ChatInviteGuest_inviteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatInviteGuest"
    ADD CONSTRAINT "ChatInviteGuest_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES public."ChatInvite"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatInviteGuest ChatInviteGuest_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatInviteGuest"
    ADD CONSTRAINT "ChatInviteGuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatInvite ChatInvite_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatInvite"
    ADD CONSTRAINT "ChatInvite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatInvite ChatInvite_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatInvite"
    ADD CONSTRAINT "ChatInvite_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."ChatConversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatInvite ChatInvite_createdByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatInvite"
    ADD CONSTRAINT "ChatInvite_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMessage ChatMessage_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."ChatConversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMessage ChatMessage_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatParticipant ChatParticipant_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatParticipant"
    ADD CONSTRAINT "ChatParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."ChatConversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatParticipant ChatParticipant_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."ChatParticipant"
    ADD CONSTRAINT "ChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompanyCategoryPrice CompanyCategoryPrice_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CompanyCategoryPrice"
    ADD CONSTRAINT "CompanyCategoryPrice_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompanyCategoryPrice CompanyCategoryPrice_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CompanyCategoryPrice"
    ADD CONSTRAINT "CompanyCategoryPrice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompanyDocument CompanyDocument_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CompanyDocument"
    ADD CONSTRAINT "CompanyDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Company Company_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CrmDealLog CrmDealLog_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmDealLog"
    ADD CONSTRAINT "CrmDealLog_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public."CrmDeal"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CrmDealLog CrmDealLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmDealLog"
    ADD CONSTRAINT "CrmDealLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CrmDeal CrmDeal_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmDeal"
    ADD CONSTRAINT "CrmDeal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CrmDeal CrmDeal_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmDeal"
    ADD CONSTRAINT "CrmDeal_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CrmPayment CrmPayment_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmPayment"
    ADD CONSTRAINT "CrmPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CrmPayment CrmPayment_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmPayment"
    ADD CONSTRAINT "CrmPayment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CrmRouteStop CrmRouteStop_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmRouteStop"
    ADD CONSTRAINT "CrmRouteStop_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CrmRouteStop CrmRouteStop_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmRouteStop"
    ADD CONSTRAINT "CrmRouteStop_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CrmRouteStop CrmRouteStop_routeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmRouteStop"
    ADD CONSTRAINT "CrmRouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES public."CrmRoute"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CrmTask CrmTask_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmTask"
    ADD CONSTRAINT "CrmTask_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CrmTask CrmTask_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmTask"
    ADD CONSTRAINT "CrmTask_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public."CrmDeal"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CrmTask CrmTask_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."CrmTask"
    ADD CONSTRAINT "CrmTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DailyMenuItem DailyMenuItem_dailyMenuId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."DailyMenuItem"
    ADD CONSTRAINT "DailyMenuItem_dailyMenuId_fkey" FOREIGN KEY ("dailyMenuId") REFERENCES public."DailyMenu"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DailyMenuItem DailyMenuItem_dishId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."DailyMenuItem"
    ADD CONSTRAINT "DailyMenuItem_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES public."Dish"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DailyMenuItem DailyMenuItem_garnishDishId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."DailyMenuItem"
    ADD CONSTRAINT "DailyMenuItem_garnishDishId_fkey" FOREIGN KEY ("garnishDishId") REFERENCES public."Dish"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DaySelection DaySelection_weeklyMenuId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."DaySelection"
    ADD CONSTRAINT "DaySelection_weeklyMenuId_fkey" FOREIGN KEY ("weeklyMenuId") REFERENCES public."WeeklyMenu"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DeliveryClosing DeliveryClosing_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."DeliveryClosing"
    ADD CONSTRAINT "DeliveryClosing_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Dish Dish_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."Dish"
    ADD CONSTRAINT "Dish_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EmployeeAttendance EmployeeAttendance_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."EmployeeAttendance"
    ADD CONSTRAINT "EmployeeAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceLine InvoiceLine_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."InvoiceLine"
    ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invoice Invoice_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_dishId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES public."Dish"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SelectedDish SelectedDish_daySelectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."SelectedDish"
    ADD CONSTRAINT "SelectedDish_daySelectionId_fkey" FOREIGN KEY ("daySelectionId") REFERENCES public."DaySelection"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SelectedDish SelectedDish_dishId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."SelectedDish"
    ADD CONSTRAINT "SelectedDish_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES public."Dish"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SupportMessage SupportMessage_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."SupportMessage"
    ADD CONSTRAINT "SupportMessage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupportMessage SupportMessage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."SupportMessage"
    ADD CONSTRAINT "SupportMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WeeklyMenu WeeklyMenu_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: catering
--

ALTER TABLE ONLY public."WeeklyMenu"
    ADD CONSTRAINT "WeeklyMenu_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: catering
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict ZTBJv4C5krSEYKgUwawEsDboGynir0Vr73Ok3vNccLqpo8soXZpRxdVevEQleVg

