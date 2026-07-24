/**
 * V2 Mock Users — source of truth for user context, permissions, and profiles.
 * In production this would be fetched from an HR/IAM system.
 */

const USERS_V2 = [
  {
    id: "u_lta_family",
    identity: {
      name: "John Doe",
      email: "john.doe@company.com",
      avatar: "JD",
    },
    permissions: {
      assignmentType: "LTA",
      policiesAllowed: ["lta-global-2026-v3"],
    },
    corporateContext: {
      homeCountry: "Brazil",
      hostCountry: "United States",
      department: "Supply Chain",
      manager: "Sarah Chen",
    },
    profile: {
      family: {
        hasPartner: true,
        hasChildren: true,
        childrenAges: [5, 10],
        hasPets: true,
      },
      mobility: {
        firstAssignment: true,
        relocationExperienceLevel: "low",
        languageBarrier: true,
      },
      move: {
        moveComplexity: "family",
        needsSchoolSearch: true,
        needsTempHousing: true,
      },
      financial: {
        concernedAboutTaxes: true,
        wantsBenefitDetails: true,
      },
      timeline: {
        assignmentStage: "pre-assignment",
        immigrationInProgress: true,
        visaApproved: false,
      },
      preferences: {
        preferredResponseStyle: "detailed",
        wantsStepByStep: true,
      },
    },
  },

  {
    id: "u_sta_single",
    identity: {
      name: "Ana Ferreira",
      email: "ana.ferreira@company.com",
      avatar: "AF",
    },
    permissions: {
      assignmentType: "STA",
      policiesAllowed: ["sta-latam-2026-v2"],
    },
    corporateContext: {
      homeCountry: "Mexico",
      hostCountry: "Germany",
      department: "Finance",
      manager: "Klaus Müller",
    },
    profile: {
      family: {
        hasPartner: false,
        hasChildren: false,
        childrenAges: [],
        hasPets: false,
      },
      mobility: {
        firstAssignment: false,
        relocationExperienceLevel: "high",
        languageBarrier: false,
      },
      move: {
        moveComplexity: "individual",
        needsSchoolSearch: false,
        needsTempHousing: true,
      },
      financial: {
        concernedAboutTaxes: false,
        wantsBenefitDetails: false,
      },
      timeline: {
        assignmentStage: "mid-assignment",
        immigrationInProgress: false,
        visaApproved: true,
      },
      preferences: {
        preferredResponseStyle: "concise",
        wantsStepByStep: false,
      },
    },
  },

  {
    id: "u_ia_complex",
    identity: {
      name: "David Park",
      email: "david.park@company.com",
      avatar: "DP",
    },
    permissions: {
      assignmentType: "IA",
      policiesAllowed: ["ia-apac-2026-v1", "lta-global-2026-v3"],
    },
    corporateContext: {
      homeCountry: "South Korea",
      hostCountry: "United Kingdom",
      department: "Marketing",
      manager: "Emma Williams",
    },
    profile: {
      family: {
        hasPartner: true,
        hasChildren: true,
        childrenAges: [3, 7, 14],
        hasPets: false,
      },
      mobility: {
        firstAssignment: false,
        relocationExperienceLevel: "medium",
        languageBarrier: false,
      },
      move: {
        moveComplexity: "family",
        needsSchoolSearch: true,
        needsTempHousing: false,
      },
      financial: {
        concernedAboutTaxes: true,
        wantsBenefitDetails: true,
      },
      timeline: {
        assignmentStage: "post-assignment",
        immigrationInProgress: false,
        visaApproved: true,
      },
      preferences: {
        preferredResponseStyle: "detailed",
        wantsStepByStep: false,
      },
    },
  },

  {
    id: "u_commuter",
    identity: {
      name: "Maria Santos",
      email: "maria.santos@company.com",
      avatar: "MS",
    },
    permissions: {
      assignmentType: "COMMUTER",
      policiesAllowed: ["commuter-emea-2026-v1"],
    },
    corporateContext: {
      homeCountry: "Portugal",
      hostCountry: "Spain",
      department: "Operations",
      manager: "Carlos Ruiz",
    },
    profile: {
      family: {
        hasPartner: true,
        hasChildren: false,
        childrenAges: [],
        hasPets: true,
      },
      mobility: {
        firstAssignment: true,
        relocationExperienceLevel: "low",
        languageBarrier: false,
      },
      move: {
        moveComplexity: "individual",
        needsSchoolSearch: false,
        needsTempHousing: false,
      },
      financial: {
        concernedAboutTaxes: true,
        wantsBenefitDetails: true,
      },
      timeline: {
        assignmentStage: "pre-assignment",
        immigrationInProgress: true,
        visaApproved: false,
      },
      preferences: {
        preferredResponseStyle: "detailed",
        wantsStepByStep: true,
      },
    },
  },
];

module.exports = { USERS_V2 };
