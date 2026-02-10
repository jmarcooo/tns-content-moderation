const Config = {
    // Shared Queue Definitions
    queues: [
        // Video/Image Review (BP or GP Only)
        { id: 'bp_img',   category: 'BP', name: 'Dynamic Image Review',   aht: '12s', latency: '1m 20s' },
        { id: 'bp_vid',   category: 'BP', name: 'Dynamic Video Review',   aht: '45s', latency: '3m 45s' },
        { id: 'gp_img',   category: 'GP', name: 'Dynamic Image Review',   aht: '15s', latency: '5m 10s' },
        { id: 'gp_vid',   category: 'GP', name: 'Dynamic Video Review',   aht: '55s', latency: '8m 20s' },
        
        // Avatar (Community Only)
        { id: 'comm_ava', category: 'Community', name: 'Avatar Review',    aht: '8s',  latency: '2m 15s' },
        
        // Nickname/Profile (Community Only)
        { id: 'comm_nick',category: 'Community', name: 'Nickname Review',  aht: '3s',  latency: '0m 50s' },
        { id: 'comm_prof',category: 'Community', name: 'Profile Review',   aht: '20s', latency: '4m 30s' }
    ],

    // Violation Reasons
    violations: {
        "Insults": ["Personal Attacks", "Uncivilized Language", "Implicit and Uncivilized Language", "Bullying"],
        "Advertising": ["General Advertising", "Betting Advertising", "Content Details", "Marketing Advertising"],
        "Religious and Racial Insults": ["Discrimination and Insult"],
        "Prohibited": ["Drugs", "Prohibited Goods", "Firearms Ammunition", "Tobacco", "Alcohol"],
        "Pornography": ["Perverted Porn Sexual", "Sexual Description", "Pornographic Depiction", "Sexual Harassment"],
        "Violence": ["War Events", "Violence and Bloody", "Shooting Incidents", "Horror Scenes"],
        "Terrorism": ["Terrorist Figures", "Terrorist Orgainizations", "Terrorist Incidents"],
        "Involving Minors": ["Sexual Content Involving Minors", "Underage Drinking", "Underage Smoking", "Underage Drug", "Underage Self-Harm ", "Child Gambling or Betting activities", "Child Inappropriate Language or Gestures"],
        "Involved in Politics ": ["Domestic Leaders", "Foreign Leaders", "National Institution ", "Negative Speech", "Policies and Regulations ", "Coordinated Inauthentic Behavior (CIB)"],
        "Unauthorized Solicitation": ["Coerced Interaction/ Begging", "Fraudulent Reward Promotions", "Exploitative Follow-for-Follow Schemes", "Direct Requests for Funds", "Asking for Third-Party Donations", "Emotional/Distress Solicitation", "Implied Solicitation"],
        "Disturbing Content": ["Body Horror/Distortion Imagery", "Unsanitary Practices", "Graphic Medical/Dermatological Imagery", "Bodily Fluids/Waste"],
        "Suicide and Self-Harm": ["Suicidal Tendencies", "Suicide Depiction ", "Self-Harm Tendencies", "Promotion of Suicide/Self-Harm ", "Aftermath or Consequence", "Suicide and Self Harm (Emoji)", "Implicit suicidal and self harm expressions/slangs"],
        "Low Quality Content": ["Low Quality and Meaningless"],
        "Company Negative": ["Malicious smear", "Negative Reviews ", "Malicious Users ", "Experience Related"]
    }
};
