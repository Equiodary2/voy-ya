CREATE TABLE `drivers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`vehicleType` enum('economy','comfort','premium') NOT NULL DEFAULT 'economy',
	`vehicleMake` varchar(100),
	`vehicleModel` varchar(100),
	`vehiclePlate` varchar(20),
	`vehicleColor` varchar(50),
	`vehicleImageUrl` text,
	`licenseNumber` varchar(50),
	`licenseExpiry` timestamp,
	`isAvailable` boolean NOT NULL DEFAULT false,
	`currentLatitude` decimal(10,8),
	`currentLongitude` decimal(11,8),
	`lastLocationUpdate` timestamp,
	`documentsVerified` boolean DEFAULT false,
	`backgroundCheckPassed` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drivers_id` PRIMARY KEY(`id`),
	CONSTRAINT `drivers_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `drivers_vehiclePlate_unique` UNIQUE(`vehiclePlate`),
	CONSTRAINT `drivers_licenseNumber_unique` UNIQUE(`licenseNumber`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`paymentType` enum('card','wallet','bank_transfer') NOT NULL,
	`cardLast4` varchar(4),
	`cardBrand` varchar(50),
	`walletBalance` decimal(10,2) DEFAULT '0.00',
	`isDefault` boolean DEFAULT false,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rideId` int NOT NULL,
	`ratedById` int NOT NULL,
	`ratedUserId` int NOT NULL,
	`ratingType` enum('driver_rating','rider_rating') NOT NULL,
	`score` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`),
	CONSTRAINT `ratings_rideId_unique` UNIQUE(`rideId`)
);
--> statement-breakpoint
CREATE TABLE `ride_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`pickupLatitude` decimal(10,8) NOT NULL,
	`pickupLongitude` decimal(11,8) NOT NULL,
	`dropoffLatitude` decimal(10,8) NOT NULL,
	`dropoffLongitude` decimal(11,8) NOT NULL,
	`vehicleType` enum('economy','comfort','premium') NOT NULL DEFAULT 'economy',
	`estimatedFare` decimal(8,2) NOT NULL,
	`status` enum('pending','accepted','expired') NOT NULL DEFAULT 'pending',
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ride_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riderId` int NOT NULL,
	`driverId` int,
	`pickupLatitude` decimal(10,8) NOT NULL,
	`pickupLongitude` decimal(11,8) NOT NULL,
	`pickupAddress` text,
	`dropoffLatitude` decimal(10,8) NOT NULL,
	`dropoffLongitude` decimal(11,8) NOT NULL,
	`dropoffAddress` text,
	`distance` decimal(8,2),
	`estimatedDuration` int,
	`actualDuration` int,
	`baseFare` decimal(8,2) NOT NULL,
	`distanceFare` decimal(8,2) DEFAULT '0.00',
	`timeFare` decimal(8,2) DEFAULT '0.00',
	`totalFare` decimal(8,2) NOT NULL,
	`status` enum('requested','accepted','driver_arriving','arrived','in_progress','completed','cancelled') NOT NULL DEFAULT 'requested',
	`vehicleType` enum('economy','comfort','premium') NOT NULL DEFAULT 'economy',
	`paymentMethod` enum('cash','card','wallet') DEFAULT 'card',
	`paymentStatus` enum('pending','completed','failed') DEFAULT 'pending',
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`acceptedAt` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`cancelledAt` timestamp,
	`cancellationReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userType` enum('rider','driver','both') NOT NULL DEFAULT 'rider',
	`phoneNumber` varchar(20),
	`profileImageUrl` text,
	`rating` decimal(3,2) DEFAULT '5.00',
	`totalRides` int DEFAULT 0,
	`totalEarnings` decimal(10,2) DEFAULT '0.00',
	`bio` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `driverUserIdIdx` ON `drivers` (`userId`);--> statement-breakpoint
CREATE INDEX `vehiclePlateIdx` ON `drivers` (`vehiclePlate`);--> statement-breakpoint
CREATE INDEX `availabilityIdx` ON `drivers` (`isAvailable`);--> statement-breakpoint
CREATE INDEX `paymentUserIdIdx` ON `payment_methods` (`userId`);--> statement-breakpoint
CREATE INDEX `rideIdIdx` ON `ratings` (`rideId`);--> statement-breakpoint
CREATE INDEX `ratedByIdIdx` ON `ratings` (`ratedById`);--> statement-breakpoint
CREATE INDEX `ratedUserIdIdx` ON `ratings` (`ratedUserId`);--> statement-breakpoint
CREATE INDEX `requestRiderIdIdx` ON `ride_requests` (`riderId`);--> statement-breakpoint
CREATE INDEX `requestStatusIdx` ON `ride_requests` (`status`);--> statement-breakpoint
CREATE INDEX `riderIdIdx` ON `rides` (`riderId`);--> statement-breakpoint
CREATE INDEX `driverIdIdx` ON `rides` (`driverId`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `rides` (`status`);--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `user_profiles` (`userId`);