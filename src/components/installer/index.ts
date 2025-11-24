/**
 * Installer Components
 * 
 * Components for installer role functionality including:
 * - Installation photo uploads
 * - Data access restrictions
 */

export { InstallationPhotoUploader } from './InstallationPhotoUploader';
export {
  InstallerDataRestrictions,
  InstallerRestrictionMessage,
  filterLeadDataForInstaller,
  filterStepRemarksForInstaller,
  filterDocumentsForInstaller,
  canAccessPMSuryagharForm,
  canAccessFinancialDetails,
  canAccessSurveyInformation,
  useIsInstaller,
} from './InstallerDataRestrictions';
