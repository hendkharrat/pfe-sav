-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prenom` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'TECHNICIAN') NOT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `typeClient` ENUM('SOCIETE', 'PERSONNE_PHYSIQUE') NOT NULL,
    `societe` VARCHAR(191) NULL,
    `contact` VARCHAR(191) NULL,
    `prenom` VARCHAR(191) NULL,
    `nom` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `adresse` TEXT NULL,
    `ville` VARCHAR(191) NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Client_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Equipment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reference` VARCHAR(191) NOT NULL,
    `type` ENUM('CLIMATISEUR', 'SYSTEME_SURPRESSION') NOT NULL,
    `marque` VARCHAR(191) NOT NULL,
    `modele` VARCHAR(191) NOT NULL,
    `numeroSerie` VARCHAR(191) NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `Equipment_reference_key`(`reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EquipmentImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipmentId` INTEGER NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `isMain` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientEquipement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `equipementId` INTEGER NOT NULL,
    `dateAchat` DATETIME(3) NULL,
    `localisation` VARCHAR(191) NULL,
    `dateInstallation` DATETIME(3) NOT NULL,
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contract` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reference` VARCHAR(191) NOT NULL,
    `clientId` INTEGER NOT NULL,
    `dateDebut` DATETIME(3) NOT NULL,
    `dateFin` DATETIME(3) NOT NULL,
    `periodicite` ENUM('MENSUELLE', 'TRIMESTRIELLE', 'SEMESTRIELLE', 'ANNUELLE') NOT NULL,
    `statut` ENUM('ACTIF', 'BIENTOT_EXPIRE', 'EXPIRE') NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `Contract_reference_key`(`reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContractEquipement` (
    `contractId` INTEGER NOT NULL,
    `clientEquipementId` INTEGER NOT NULL,

    PRIMARY KEY (`contractId`, `clientEquipementId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Intervention` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reference` VARCHAR(191) NOT NULL,
    `type` ENUM('PREVENTIVE', 'CURATIVE') NOT NULL,
    `clientId` INTEGER NOT NULL,
    `clientEquipementId` INTEGER NULL,
    `technicienId` INTEGER NULL,
    `contractId` INTEGER NULL,
    `datePrevue` DATETIME(3) NOT NULL,
    `dateRealisation` DATETIME(3) NULL,
    `statut` ENUM('PLANIFIEE', 'EN_COURS', 'REALISEE', 'ANNULEE') NOT NULL,
    `couvertureContrat` BOOLEAN NOT NULL DEFAULT false,
    `description` TEXT NOT NULL,
    `diagnostic` TEXT NULL,
    `actionsRealisees` TEXT NULL,
    `materielUtilise` TEXT NULL,
    `dureeMinutes` INTEGER NULL,
    `observations` TEXT NULL,

    UNIQUE INDEX `Intervention_reference_key`(`reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Panne` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reference` VARCHAR(191) NOT NULL,
    `clientId` INTEGER NOT NULL,
    `clientEquipementId` INTEGER NULL,
    `dateDeclaration` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `description` TEXT NOT NULL,
    `statut` ENUM('EN_ATTENTE', 'PRISE_EN_CHARGE', 'CONVERTIE', 'ANNULEE') NOT NULL DEFAULT 'EN_ATTENTE',
    `interventionId` INTEGER NULL,

    UNIQUE INDEX `Panne_reference_key`(`reference`),
    UNIQUE INDEX `Panne_interventionId_key`(`interventionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PieceJointe` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `panneId` INTEGER NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Facture` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(191) NOT NULL,
    `clientId` INTEGER NOT NULL,
    `interventionId` INTEGER NULL,
    `dateEmission` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `montantHT` DOUBLE NOT NULL,
    `tva` DOUBLE NOT NULL,
    `montantTTC` DOUBLE NOT NULL,
    `statut` ENUM('PAYEE', 'IMPAYEE', 'EN_ATTENTE') NOT NULL DEFAULT 'EN_ATTENTE',

    UNIQUE INDEX `Facture_numero_key`(`numero`),
    UNIQUE INDEX `Facture_interventionId_key`(`interventionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LigneFacture` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `factureId` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `quantite` DOUBLE NOT NULL,
    `prixUnitaire` DOUBLE NOT NULL,
    `montant` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EquipmentImage` ADD CONSTRAINT `EquipmentImage_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `Equipment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientEquipement` ADD CONSTRAINT `ClientEquipement_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientEquipement` ADD CONSTRAINT `ClientEquipement_equipementId_fkey` FOREIGN KEY (`equipementId`) REFERENCES `Equipment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contract` ADD CONSTRAINT `Contract_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractEquipement` ADD CONSTRAINT `ContractEquipement_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `Contract`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContractEquipement` ADD CONSTRAINT `ContractEquipement_clientEquipementId_fkey` FOREIGN KEY (`clientEquipementId`) REFERENCES `ClientEquipement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Intervention` ADD CONSTRAINT `Intervention_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Intervention` ADD CONSTRAINT `Intervention_clientEquipementId_fkey` FOREIGN KEY (`clientEquipementId`) REFERENCES `ClientEquipement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Intervention` ADD CONSTRAINT `Intervention_technicienId_fkey` FOREIGN KEY (`technicienId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Intervention` ADD CONSTRAINT `Intervention_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `Contract`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Panne` ADD CONSTRAINT `Panne_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Panne` ADD CONSTRAINT `Panne_clientEquipementId_fkey` FOREIGN KEY (`clientEquipementId`) REFERENCES `ClientEquipement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Panne` ADD CONSTRAINT `Panne_interventionId_fkey` FOREIGN KEY (`interventionId`) REFERENCES `Intervention`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PieceJointe` ADD CONSTRAINT `PieceJointe_panneId_fkey` FOREIGN KEY (`panneId`) REFERENCES `Panne`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Facture` ADD CONSTRAINT `Facture_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Facture` ADD CONSTRAINT `Facture_interventionId_fkey` FOREIGN KEY (`interventionId`) REFERENCES `Intervention`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LigneFacture` ADD CONSTRAINT `LigneFacture_factureId_fkey` FOREIGN KEY (`factureId`) REFERENCES `Facture`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

