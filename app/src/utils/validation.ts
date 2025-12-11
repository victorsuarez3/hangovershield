/**
 * Validation utilities for Casa Latina forms
 */

export interface MembershipApplication {
  age: number;
  city: string;
  educationLevel: string;
  university?: string;
  position: string;
  employer: string;
  industry: string;
  incomeRange: string;
  instagramHandle: string;
  howDidYouHearAboutUs?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validate membership application form
 * Returns validation errors object, empty if valid
 */
export const validateMembershipApplication = (
  formData: Partial<MembershipApplication>
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Age validation: must be >= 21
  if (!formData.age) {
    errors.age = 'Age is required';
  } else if (typeof formData.age === 'string') {
    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 21) {
      errors.age = 'Must be 21 or older';
    }
  } else if (formData.age < 21) {
    errors.age = 'Must be 21 or older';
  }

  // City validation: required
  if (!formData.city || !formData.city.trim()) {
    errors.city = 'City is required';
  }

  // Education level validation: required dropdown
  if (!formData.educationLevel || !formData.educationLevel.trim()) {
    errors.educationLevel = 'Education level is required';
  }

  // Position validation: required
  if (!formData.position || !formData.position.trim()) {
    errors.position = 'Position is required';
  }

  // Employer/Company validation: required
  if (!formData.employer || !formData.employer.trim()) {
    errors.employer = 'Company/Employer is required';
  }

  // Industry validation: required dropdown
  if (!formData.industry || !formData.industry.trim()) {
    errors.industry = 'Industry is required';
  }

  // Income range validation: required dropdown
  if (!formData.incomeRange || !formData.incomeRange.trim()) {
    errors.incomeRange = 'Income range is required';
  }

  // Instagram handle validation: just the username (without @)
  // The @ is added automatically in the UI, so we validate the handle without it
  if (!formData.instagramHandle || !formData.instagramHandle.trim()) {
    errors.instagramHandle = 'Instagram handle is required';
  } else {
    const handle = formData.instagramHandle.trim();
    // Remove @ if user typed it (we add it automatically)
    const cleanHandle = handle.replace(/^@+/, '');
    if (cleanHandle.length < 1) {
      errors.instagramHandle = 'Please enter a valid Instagram handle';
    }
  }

  // University is optional, no validation needed
  // howDidYouHearAboutUs is optional, no validation needed

  return errors;
};

