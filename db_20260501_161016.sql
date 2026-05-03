--
-- PostgreSQL database dump
--

\restrict NfBAMFXmhhGsAAx4J3m1egruP562SQXxoLcBRd7IsKCdcdiZTe6y7fBcNLsKgsH

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
    "userId" text
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

COPY public."Company" (id, name, status, "contactPerson", address, "logoUrl", "billingAddress", "billingDetails", "entryConditions", "routeName", "deliveryTime", "peopleCount", notes, "mealPlan", "workEmail", website, "priceSegment", "defaultSetType", "accountNumber", balance, "creditBalance", "limit", "dailyLimit", "userId") FROM stdin;
d3622cc6-34ac-4c9d-9cad-036e1de0471f	Gastroprime	ACTIVE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	STANDARD	FULL	GP-32A0E19	50000	0	50000	0	\N
44261db9-29f1-4019-ac21-f8f5b4ce8b9e	Клиент	ACTIVE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	STANDARD	FULL	GP-TEST1	40000	0	0	0	\N
9501b10a-3b49-408f-8bc8-ea55b56f9d11	Артем	ACTIVE	Артем Ш	Мск ленина 1	\N	\N	\N	\N	\N	\N	12	Телефон: +79166989449	\N	sham-88@mail.ru	\N	STANDARD	FULL	N/A	0	0	50000	0	\N
9ec40310-5ed4-42e6-9cc3-b84d31c5e376	Артем	ACTIVE	Артем Ш	Мск ленина 1	\N	\N	\N	\N	\N	\N	12	Телефон: +79166989449	\N	sham-88@mail.ru	\N	STANDARD	FULL	N/A	0	0	50000	0	\N
688c065b-b856-470c-8f47-35a1f6cf99b2	Артем	ACTIVE	Артем Ш	Мск ленина 1	\N	\N	\N	\N	\N	\N	12	Телефон: +79166989449	\N	sham-88@mail.ru	\N	STANDARD	FULL	N/A	0	0	50000	0	\N
\.


--
-- Data for Name: CompanyCategoryPrice; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."CompanyCategoryPrice" (id, "companyId", "categoryId", price, "createdAt", "updatedAt") FROM stdin;
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
\.


--
-- Data for Name: CrmDealLog; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."CrmDealLog" (id, "dealId", "userId", action, "oldValue", "newValue", comment, "createdAt") FROM stdin;
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
\.


--
-- Data for Name: DailyMenuItem; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."DailyMenuItem" (id, "dailyMenuId", "dishId", "maxQuantity", "sortOrder", "garnishDishId") FROM stdin;
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
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: catering
--

COPY public."OrderItem" (id, "orderId", "dishId", quantity, "unitPrice") FROM stdin;
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
03623c41-6da9-4968-be12-c43ae3b9beee	client@catering.com	$2b$10$WKib4h2EZjQrHZQZ2WBxt.qACUJ8gAQolzZO7bOrtiMJe79i7g2zq	Клиент	\N	\N	\N	\N	\N	CLIENT	ACTIVE	44261db9-29f1-4019-ac21-f8f5b4ce8b9e	\N	\N	f	f	f	f	2026-05-01 12:45:33.708	2026-05-01 12:45:33.708
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

\unrestrict NfBAMFXmhhGsAAx4J3m1egruP562SQXxoLcBRd7IsKCdcdiZTe6y7fBcNLsKgsH

