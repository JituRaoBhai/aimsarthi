/* EXAMS: to add a course, add one entry below.

   Recommended rich form (per-subject object):
     t: {
       'Subject': {
         pri: 0-100,          // subject priority (higher = more time, more priority)
         topics: [
           ['Topic name', 0-100],              // priority only; minutes from defMins
           ['Topic name', 0-100, 90, 60, 40]   // priority + beginner/intermediate/advanced minutes
         ]
       }
     }

   Legacy form still works:
     'Subject': ['Topic 1', 'Topic 2']         // priority 60, minutes from defMins

   Optional exam-level fields:
     found: ['Subject', ...]       // foundational subjects, tier 1. Scheduled before all others.
     tier: { 'Subject': 1|2|3 }    // 1=base, 2=core, 3=advanced. Default: 1 if in `found`, else 2.
     defMins: { b, i, a }          // per-topic minutes for Beginner / Intermediate / Advanced.
     crunchMins: 45                // ONE fixed minutes-per-topic used in the 30/60-day crunch plans.
                                   // The crunch plan is identical for every learner regardless of level.
     crunch: { 30: {'Subject': %}, 60: {'Subject': %} }
                                   // explicit % weights for the 1-month and 2-month crunch plans.
                                   // If omitted, weights are auto-derived from subject priorities.

   Priority (0–100) drives both the time a subject/topic gets and whether it survives when time is short.
   Effective topic priority = subjectPri × topicPri / 100.
*/
const EX = {
  /*
 * NEET (PG) — National Eligibility cum Entrance Test (Postgraduate)
 * Conducting body: NBEMS | Syllabus authority: NMC — Graduate Medical Education Regulations (all 19 MBBS subjects)
 * Paper pattern:
 *   - 200 compulsory MCQs in 210 minutes (800 marks; +4 correct, -1 incorrect, 0 unattempted)
 *   - Divided into 5 mandatory time-bound sections (Sections A–E: 40 questions and 42 minutes per section)
 *   - Predominantly integrated clinical vignettes and multimodal image-based questions (IBQs)
 * Syllabus decomposition:
 *   - All 19 official MBBS subjects mapped across 3 pedagogical tiers (136 topics total)
 *   - Updated for current Indian medico-legal frameworks (BNS/BNSS/BSA, MHCA 2017) and national health programmes
 */
neetpg: {
  n: 'NEET (PG)',
  mock: 210,
  defMins: { b: 75, i: 55, a: 35 },
  crunchMins: 45,
  found: [
    'Anatomy',
    'Physiology',
    'Biochemistry',
  ],
  tier: {
    'Anatomy': 1,
    'Physiology': 1,
    'Biochemistry': 1,
    'General Medicine': 2,
    'General Surgery': 2,
    'Obstetrics & Gynaecology': 2,
    'Pathology': 2,
    'Pharmacology': 2,
    'Community Medicine': 2,
    'Microbiology': 2,
    'Paediatrics': 2,
    'Ophthalmology': 3,
    'ENT': 3,
    'Forensic Medicine': 3,
    'Orthopaedics': 3,
    'Radiodiagnosis': 3,
    'Dermatology': 3,
    'Psychiatry': 3,
    'Anaesthesiology': 3,
  },
  crunch: {
    // Concentrates 30-day prep on the 8 core para-clinical and major clinical subjects (~75% of paper weight), while 60-day prep touches all 19 subjects with reduced Tier-1 shares
    30: {
      'General Medicine': 20,
      'General Surgery': 16,
      'Obstetrics & Gynaecology': 16,
      'Pathology': 13,
      'Pharmacology': 11,
      'Community Medicine': 9,
      'Microbiology': 8,
      'Paediatrics': 7,
    },
    60: {
      'General Medicine': 14,
      'General Surgery': 12,
      'Obstetrics & Gynaecology': 12,
      'Pathology': 9,
      'Pharmacology': 8,
      'Community Medicine': 7,
      'Microbiology': 6,
      'Paediatrics': 5,
      'Anatomy': 4,
      'Physiology': 4,
      'Biochemistry': 4,
      'Ophthalmology': 3,
      'ENT': 3,
      'Forensic Medicine': 2,
      'Orthopaedics': 2,
      'Radiodiagnosis': 2,
      'Dermatology': 1,
      'Psychiatry': 1,
      'Anaesthesiology': 1,
    },
  },
  t: {
    'Anatomy': {
      pri: 82,
      topics: [
        ['General Anatomy and General Embryology — Gametogenesis, Germ Layers, Pharyngeal Arches, Placenta and Teratology', 86],
        ['General and Systemic Histology — Epithelium, Connective Tissue, Cartilage, Bone, Lymphoid and Organ Histology', 74],
        ['Upper Limb — Brachial Plexus, Shoulder, Arm, Forearm, Hand Spaces and Peripheral Nerve Injuries', 88],
        ['Thorax — Thoracic Wall, Mediastinum, Heart, Coronary Circulation, Lungs, Pleura and Diaphragm', 84],
        ['Abdomen, Pelvis and Perineum — Peritoneum, Gut Blood Supply, Hepatobiliary System, Pelvic Floor and Perineal Pouches', 94, 120, 85, 50],
        ['Lower Limb — Femoral Triangle, Gluteal Region, Thigh/Leg Compartments, Sciatic/Peroneal Nerves and Arches of Foot', 82],
        ['Head and Neck — Cranial Nerves, Triangles of Neck, Thyroid, Larynx, Orbit, Parotid and Deep Cervical Fascia', 92],
        ['Neuroanatomy — Brainstem, Cranial Nerve Nuclei, Cerebellum, Basal Ganglia, Internal Capsule, Ventricles and Tracts', 96],
      ],
    },
    'Physiology': {
      pri: 80,
      topics: [
        ['General and Cellular Physiology — Cell Membrane Transport, Intercellular Junctions, Resting and Action Potentials', 85],
        ['Nerve and Muscle Physiology — Neuromuscular Junction, Excitation-Contraction Coupling and Skeletal/Smooth Muscle Mechanics', 84],
        ['Cardiovascular Physiology — Cardiac Cycle, Conducting System, Haemodynamics, Cardiac Output and BP Regulation', 94],
        ['Respiratory Physiology — Mechanics of Breathing, Compliance, Surfactant, V/Q Ratio, Gas Transport and Regulation', 92],
        ['Renal and Acid-Base Physiology — Clearance, GFR, Tubular Transport, Countercurrent Multiplier and Acid-Base Balance', 90],
        ['Gastrointestinal Physiology — GI Motility, Slow Waves, GI Hormones, Hepatobiliary Secretion and Digestion/Absorption', 78],
        ['Endocrine and Reproductive Physiology — Hypothalamic-Pituitary Axis, Thyroid, Adrenal, Pancreas, Calcium and Reproductive Cycles', 88],
        ['Central Nervous System and Special Senses — Synaptic Transmission, Somatosensory/Motor Tracts, Cerebellum, Sleep and Vision/Audition', 86],
      ],
    },
    'Biochemistry': {
      pri: 75,
      topics: [
        ['Enzymology and Bioenergetics — Enzyme Kinetics, Inhibition, Allosteric Regulation, Electron Transport Chain and Oxidative Phosphorylation', 90],
        ['Carbohydrate Chemistry and Metabolism — Glycolysis, TCA Cycle, Gluconeogenesis, HMP Shunt, Glycogen Metabolism and GSDs', 94],
        ['Lipid Chemistry and Metabolism — Fatty Acid Synthesis/Oxidation, Ketogenesis, Cholesterol, Lipoproteins and Dyslipidaemias', 88],
        ['Amino Acid and Protein Metabolism — Urea Cycle, Inborn Errors of Amino Acid Metabolism, One-Carbon Metabolism and Heme Porphyrias', 92],
        ['Nucleotide Metabolism and Molecular Biology — Purine/Pyrimidine Disorders, DNA Replication, Repair, Transcription, Translation and PCR', 96],
        ['Vitamins, Minerals and Clinical Nutrition — Fat- and Water-Soluble Vitamins, Trace Elements and Deficiency Syndromes', 90],
        ['Extracellular Matrix and Cancer Biochemistry — Collagen/Elastin Disorders, Free Radicals, Xenobiotics and Tumour Markers', 72],
      ],
    },
    'Pathology': {
      pri: 91,
      topics: [
        ['Cell Injury, Cellular Adaptations and Intracellular Accumulations — Reversible/Irreversible Injury, Necrosis, Apoptosis and Calcification', 94],
        ['Inflammation, Tissue Repair and Haemodynamic Disorders — Chemical Mediators, Granulomas, Wound Healing, Thrombosis, Embolism and Shock', 92],
        ['Genetics and Immunopathology — Mendelian/Cytogenetic Disorders, Hypersensitivity Reactions, Autoimmunity, Transplant Rejection and Amyloidosis', 95],
        ['Neoplasia — Hallmarks of Cancer, Oncogenes, Tumour Suppressor Genes, Carcinogenesis, Paraneoplastic Syndromes and Lab Diagnosis', 98],
        ['Haematopathology — Microcytic/Macrocytic/Haemolytic Anaemias, Leukaemias, Lymphomas, Myeloma, Coagulation and Transfusion Medicine', 96, 150, 105, 55],
        ['Cardiovascular and Respiratory Pathology — Atherosclerosis, Vasculitis, Infective Endocarditis, Rheumatic Heart Disease, Pneumoconiosis and Lung Tumours', 86],
        ['Gastrointestinal, Hepatobiliary and Renal Pathology — Peptic Ulcer, IBD, GI Polyps, Cirrhosis, Glomerulonephritis and Renal Tumours', 90],
        ['Endocrine, Breast, Reproductive and Musculoskeletal Pathology — Thyroid/Breast Carcinoma, Germ Cell Tumours and Bone/CNS Tumours', 88],
      ],
    },
    'Pharmacology': {
      pri: 89,
      topics: [
        ['General Pharmacology — Pharmacokinetics, Pharmacodynamics, Dose-Response Curves, Cyp450 Interactions, Clinical Trials and TDM', 95],
        ['Autonomic Nervous System — Cholinergic Agonists/Antagonists, Adrenergic Agonists, Alpha/Beta Blockers and Glaucoma Pharmacology', 92],
        ['Cardiovascular and Renal Pharmacology — Antihypertensives, Antianginals, Heart Failure Drugs, Antiarrhythmics, Dyslipidaemics and Diuretics', 94],
        ['Central Nervous System Pharmacology — Sedative-Hypnotics, Antiepileptics, Antiparkinsonian, Antipsychotics, Antidepressants and Opioids', 90],
        ['Autacoids, Respiratory and GI Pharmacology — Prostaglandins, NSAIDs, Gout, DMARDs, Bronchodilators, Peptic Ulcer and Antiemetics', 84],
        ['Endocrine Pharmacology — Insulins, Oral Antidiabetics, Corticosteroids, Thyroid/Antithyroid, Sex Hormones, Contraceptives and Osteoporosis Drugs', 88],
        ['Antimicrobial Therapy — Beta-Lactams, Aminoglycosides, Macrolides, Antitubercular, Antileprotic, Antiviral, Antifungal and Antiprotozoal Drugs', 96, 135, 95, 55],
        ['Haematological Pharmacology — Anticoagulants, Antiplatelets, Fibrinolytics, Antifibrinolytics and Haematinics', 86],
        ['Anticancer Drugs, Immunosuppressants and Toxicology — Cytotoxic Chemotherapy, Targeted Biologics, Monoclonal Antibodies and Chelating Agents', 88],
      ],
    },
    'Microbiology': {
      pri: 84,
      topics: [
        ['General Microbiology and Sterilisation — Bacterial Morphology, Staining Techniques, Culture Media, Disinfection, Sterilisation and Bacterial Genetics', 90],
        ['Immunology — Innate/Adaptive Immunity, Antigens, Antibodies, Complement System, MHC, Cytokines, Agglutination/ELISA and Immunodeficiencies', 94],
        ['Systemic Bacteriology — Staphylococci, Streptococci, Corynebacterium, Clostridium, Enterobacteriaceae, Vibrio, Pseudomonas, Mycobacteria and Spirochaetes', 96, 130, 90, 50],
        ['Virology — General Properties, Herpesviruses, Hepatitis Viruses, HIV, Arboviruses, Rabies, Influenza and Viral Vaccines', 92],
        ['Mycology — Superficial, Cutaneous, Subcutaneous, Systemic and Opportunistic Mycoses and Laboratory Fungal Diagnostics', 84],
        ['Parasitology — Intestinal/Free-Living Amoebae, Flagellates, Malaria, Babesia, Toxoplasma, Leishmania, Cestodes, Trematodes and Nematodes', 86],
        ['Clinical and Applied Microbiology — Syndrome-Based Bloodstream/CNS/UTI/GI Infections, Nosocomial Surveillance and Antimicrobial Stewardship', 80],
      ],
    },
    'Community Medicine': {
      pri: 86,
      topics: [
        ['Concept of Health, Disease and Prevention — Natural History of Disease, Levels of Prevention, Iceberg Phenomenon and Morbidity/Mortality Indicators', 86],
        ['Epidemiology and Screening — Observational and Experimental Study Designs, Odds Ratio, Relative Risk, Bias, Confounding and Screening Validity', 98],
        ['Biostatistics — Measures of Central Tendency and Dispersion, Normal Distribution, Sampling Methods, Hypothesis Testing, P-Value and Correlation', 94],
        ['Communicable and Non-Communicable Diseases — Epidemiology and National Health Programmes for TB (NTEP), Vector-Borne Diseases, HIV (NACP) and NCDs', 92],
        ['Reproductive, Maternal and Child Health — RMNCH+A Strategy, Maternal/Infant Mortality, Contraceptive Methods and National Immunisation Schedule', 96],
        ['Demography, Nutrition and Environment — Demographic Cycle, Fertility Indicators, Macronutrients/Micronutrients, Food Adulteration, Water Quality and Air Pollution', 85],
        ['Health Planning, Management and Healthcare Delivery — Primary Health Care, Three-Tier Rural System, Ayushman Bharat, Health Committees and Planning Cycle', 84],
        ['Occupational Health, International Health and Biomedical Waste Management — Pneumoconiosis, ESI/Factory Acts, Disaster Triage, WHO and BMW Rules', 82],
      ],
    },
    'General Medicine': {
      pri: 98,
      topics: [
        ['Cardiovascular System — ECG Interpretation, Heart Failure, Valvular Heart Disease, Acute Coronary Syndromes, Arrhythmias and Cardiomyopathies', 98, 180, 120, 60],
        ['Respiratory Medicine — Spirometry, Bronchial Asthma, COPD, Pneumonia, Pleural Effusion, Interstitial Lung Disease, Sarcoidosis and Pulmonary Embolism', 94, 135, 95, 55],
        ['Nephrology, Fluid-Electrolyte and Acid-Base Disorders — Sodium/Potassium/Calcium Imbalances, ABG Interpretation, AKI, CKD, RRT and Glomerulonephritis', 96, 135, 95, 55],
        ['Central Nervous System — Ischaemic/Haemorrhagic Stroke, Epilepsy, Movement Disorders, Multiple Sclerosis, Neuromuscular Junction Disorders and CNS Infections', 95, 150, 105, 55],
        ['Endocrinology and Metabolic Disorders — Diabetes Mellitus, DKA/HHS, Thyroid Disorders, Cushing/Addison Disease, Phaeochromocytoma and Pituitary/Parathyroid Disorders', 94, 135, 95, 55],
        ['Gastroenterology and Hepatology — Upper/Lower GI Bleed, Malabsorption, Inflammatory Bowel Disease, Viral/Autoimmune Hepatitis, Cirrhosis and Portal Hypertension', 90],
        ['Clinical Haematology and Medical Oncology — Clinical Approach to Anaemias, Bleeding/Thrombotic Disorders, Leukaemias, Lymphomas and Oncologic Emergencies', 88],
        ['Rheumatology and Connective Tissue Disorders — Rheumatoid Arthritis, SLE, Seronegative Spondyloarthropathies, Systemic Sclerosis, Crystal Arthropathies and Vasculitis', 92],
        ['Infectious Diseases and Tropical Medicine — Approach to PUO, Sepsis, Malaria, Dengue, Scrub Typhus, Leptospirosis, Enteric Fever and HIV Opportunistic Infections', 86],
        ['Emergency and Critical Care Medicine — Shock Classification, Mechanical Ventilation Waveforms, Acute Poisoning/Toxidromes and Heat/Cold Emergencies', 82],
      ],
    },
    'General Surgery': {
      pri: 95,
      topics: [
        ['General Surgical Principles — Metabolic Response to Injury, Wound Healing, ASEPSIS/SSI, Perioperative Fluids, Shock, Burns, Sutures and Energy Devices', 92],
        ['Trauma and Critical Care — ATLS Primary and Secondary Survey, Glasgow Coma Scale, Thoracic Trauma, Abdominal Trauma (eFAST, Splenic/Liver Injury) and Triage', 96],
        ['Endocrine and Breast Surgery — Benign Breast Disorders, Carcinoma Breast Staging/Management, Solitary Thyroid Nodule, Thyroid Carcinoma and Parathyroid/Adrenal Tumours', 96],
        ['Upper Gastrointestinal Surgery — Oesophageal Motility Disorders, GERD, Carcinoma Oesophagus, Peptic Ulcer Complications, Gastric Carcinoma and Bariatric Surgery', 88],
        ['Hepatobiliary and Pancreatic Surgery — Gallstones, Acute Cholecystitis, Bile Duct Injuries, Obstructive Jaundice, Hydatid Cyst, Acute Pancreatitis and Pancreatic Neoplasms', 96, 150, 105, 55],
        ['Small and Large Intestine, Appendix, Rectum and Anal Canal — Intestinal Obstruction, Mesenteric Ischaemia, Appendicitis, GI Stomas, Colorectal Cancer and Anorectal Disorders', 94, 135, 95, 55],
        ['Hernias, Abdominal Wall and Peritoneum — Inguinal, Femoral, Umbilical and Incisional Hernias, Laparoscopic Anatomical Landmarks and Retroperitoneal Fibrosis/Sarcomas', 88],
        ['Urology — Renal Calculi, Hydronephrosis, Genitourinary TB, Benign Prostatic Hyperplasia, Renal/Bladder/Prostate/Testicular Cancers and Urethral Trauma', 90],
        ['Vascular, Cardiothoracic, Plastic and Paediatric Surgery — Peripheral Arterial Disease, Varicose Veins, DVT, Skin Grafts/Flaps, Cleft Lip/Palate and Paediatric Surgical Emergencies', 82],
      ],
    },
    'Obstetrics & Gynaecology': {
      pri: 94,
      topics: [
        ['Reproductive Basics and Antenatal Care — Gametogenesis, Placentation, Maternal Physiological Adaptations, Antenatal Screening, Teratogens and Fetal Surveillance', 88],
        ['Early Pregnancy Complications — Spontaneous/Recurrent Miscarriage, MTP Act, Ectopic Pregnancy and Gestational Trophoblastic Disease', 94],
        ['Medical and Obstetrical Complications in Pregnancy — Preeclampsia/Eclampsia, Gestational Diabetes, Anaemia, Heart Disease, Rh Isoimmunisation and Multifetal Pregnancy', 96],
        ['Antepartum Haemorrhage and Amniotic Fluid Disorders — Placenta Praevia, Abruptio Placentae, Vasa Praevia, Fetal Growth Restriction and Oligo/Polyhydramnios', 92],
        ['Intrapartum and Postpartum Obstetrics — Maternal Pelvis, Mechanism of Normal Labour, Partograph, Malpresentations, Instrumental/Caesarean Delivery and Postpartum Haemorrhage', 96, 135, 95, 55],
        ['General Gynaecology and Pelvic Infections — Normal Menstrual Cycle, Abnormal Uterine Bleeding (PALM-COEIN), Vaginal Discharge, Pelvic Inflammatory Disease and Female Genital TB', 88],
        ['Reproductive Endocrinology, Infertility and Contraception — Disorders of Sexual Differentiation, Puberty, PCOS, Primary/Secondary Amenorrhoea, Infertility Workup/ART and Contraception', 96],
        ['Benign Gynaecological Conditions and Urogynaecology — Uterine Fibroids, Endometriosis, Adenomyosis, Benign Ovarian Cysts, Pelvic Organ Prolapse and Genitourinary Fistula', 90],
        ['Gynaecological Oncology — Cervical Cancer Screening, CIN, Carcinoma Cervix, Endometrial Carcinoma, Ovarian Malignancies and Vulvar Cancer', 94],
      ],
    },
    'Paediatrics': {
      pri: 77,
      topics: [
        ['Normal Growth, Development and Behavioural Paediatrics — Anthropometry, WHO Growth Charts, Short Stature, Developmental Milestones and Autism/ADHD', 94],
        ['Paediatric Nutrition and Micronutrient Deficiencies — Breastfeeding, Infant Milk Substitutes, Severe Acute Malnutrition Management, Vitamin Deficiencies and Rickets', 90],
        ['Neonatology — Neonatal Resuscitation (NRP Algorithm), Thermoregulation, Respiratory Distress Syndrome, Neonatal Jaundice, Sepsis, Hypoglycaemia and Neonatal Seizures', 96],
        ['Paediatric Infectious Diseases and Immunisation — Exanthematous Fevers, Diphtheria, Pertussis, Childhood Tuberculosis, HIV in Children and National/IAP Immunisation', 86],
        ['Paediatric Cardiology and Pulmonology — Fetal Circulation, Acyanotic/Cyanotic Congenital Heart Diseases, Acute Rheumatic Fever, Kawasaki Disease, Croup and Bronchiolitis', 92],
        ['Paediatric Nephrology, GI and Haematology — Nephrotic Syndrome, Acute Post-Streptococcal Glomerulonephritis, HUS, Acute Diarrhoea (IMNCI Plans A/B/C), Celiac Disease and Thalassemia', 88],
        ['Paediatric Neurology, Genetics and Inborn Errors — Febrile Seizures, Childhood Epilepsy Syndromes, Hydrocephalus, Down/Turner/Klinefelter Syndromes and Storage Disorders', 82],
      ],
    },
    'Ophthalmology': {
      pri: 70,
      topics: [
        ['Clinical Optics and Refraction — Emmetropia, Myopia, Hypermetropia, Astigmatism, Aphakia, Presbyopia, Retinoscopy and Refractive Surgeries', 85],
        ['Conjunctiva, Cornea and Sclera — Allergic/Infective Conjunctivitis, Trachoma, Vitamin A Deficiency, Bacterial/Viral/Fungal/Acanthamoeba Keratitis and Keratoconus', 92],
        ['Uvea and Lens — Classification of Uveitis, Systemic Associations, Endophthalmitis, Congenital/Developmental/Senile Cataract, Phacoemulsification and IOL Power/Complications', 94],
        ['Glaucoma — Aqueous Humour Outflow, Tonometry/Gonioscopy, Congenital Glaucoma, Primary Open-Angle and Angle-Closure Glaucoma and Secondary Glaucomas', 92],
        ['Retina and Vitreous — Diabetic Retinopathy, Hypertensive Retinopathy, Retinal Detachment, CRAO/CRVO, Retinopathy of Prematurity, Retinoblastoma and ARMD', 90],
        ['Neuro-Ophthalmology and Strabismus — Visual Pathway Lesions, Pupillary Reflex Abnormalities (RAPD, Argyll Robertson, Adie), Optic Neuritis, Papilloedema and Paralytic/Concomitant Squint', 95],
        ['Orbit, Ocular Adnexa, Trauma and Community Ophthalmology — Ptosis, Entropion/Ectropion, Dacryocystitis, Thyroid Eye Disease, Blunt/Chemical Ocular Injuries and NPCBVI', 78],
      ],
    },
    'ENT': {
      pri: 68,
      topics: [
        ['Ear: Anatomy, Physiology and Audiology — External/Middle/Inner Ear Anatomy, Physiology of Hearing/Vestibular System, Tuning Fork Tests, Pure Tone/Impedance Audiometry and BERA/OAE', 90],
        ['Diseases of the Ear and Facial Nerve — Otitis Externa, ASOM, Serous Otitis Media, CSOM (Tubotympanic/Atticoantral and Complications), Otosclerosis, Meniere Disease, Acoustic Neuroma and Facial Nerve Palsy', 96],
        ['Nose and Paranasal Sinuses — Nasal Septum Disorders, Epistaxis, Allergic/Vasomotor/Fungal Rhinitis, Acute/Chronic Rhinosinusitis, Antrochoanal/Ethmoidal Polyps and Juvenile Nasopharyngeal Angiofibroma', 88],
        ['Pharynx and Oral Cavity — Waldeyer Ring, Adenoid Hypertrophy, Acute/Chronic Tonsillitis, Post-Tonsillectomy Bleed, Peritonsillar/Parapharyngeal/Retropharyngeal Abscesses and Nasopharyngeal Carcinoma', 86],
        ['Larynx and Tracheobronchial Tree — Laryngeal Cartilages/Membranes, Congenital Stridor, Acute Epiglottitis, Croup, Vocal Cord Paralysis, Recurrent Respiratory Papillomatosis, Carcinoma Larynx and Tracheostomy', 94],
        ['Salivary Glands, Oesophagus and Recent Advances — Sialadenitis, Salivary Gland Neoplasms, Dysphagia, Plummer-Vinson Syndrome, Foreign Bodies in Air/Food Passage and Cochlear Implants', 78],
      ],
    },
    'Forensic Medicine': {
      pri: 65,
      topics: [
        ['Legal Procedures, Medical Law and Ethics — Inquest Types, Courts of Law, Dying Declaration, Medical Evidence, BNS/BNSS/BSA Sections, Professional Negligence and NMC Ethics Regulations', 84],
        ['Personal Identification and Thanatology — Race/Sex/Age Estimation, Odontology, Dactylography, Autopsy Techniques, Immediate/Early/Late Postmortem Changes and Time Since Death', 92],
        ['Mechanical Injuries, Regional Trauma and Ballistics — Abrasions, Contusions, Lacerations, Incised/Stab Wounds, Firearm Wound Ballistics, Skull Fractures and Intracranial Haemorrhages', 94],
        ['Asphyxial Deaths and Thermal/Electrical Injuries — Hanging, Ligature/Manual Strangulation, Smothering, Choking, Café Coronary, Drowning, Burns, Scalds, Pugilistic Attitude and Lightning', 90],
        ['Forensic Psychiatry, Sexual Jurisprudence and Infant Deaths — Delusions/Hallucinations, McNaughten Rule, Sexual Offences, Seminal Stains, Criminal Abortion and Hydrostatic Test in Infanticide', 80],
        ['General and Systemic Toxicology — Gastric Lavage, Corrosives, Organophosphates/Carbamates, Heavy Metals (Arsenic, Lead, Mercury, Thallium), Deliriant/Cardiac Plant Poisons, Alcohol and Snakebite', 96],
      ],
    },
    'Orthopaedics': {
      pri: 58,
      topics: [
        ['General Orthopaedics and Fracture Healing — Bone Structure, Fracture Healing Stages, Gustilo-Anderson Open Fractures, Compartment Syndrome, Fat Embolism, Myositis Ossificans and Non-Union', 92],
        ['Upper Limb Traumatology — Clavicle, Anterior/Posterior Shoulder Dislocation, Supracondylar Humerus, Elbow Dislocation, Monteggia/Galeazzi, Colles/Smith/Barton and Scaphoid Fractures', 94],
        ['Lower Limb, Pelvis and Spine Traumatology — Pelvic Fractures, Hip Dislocations, Neck of Femur, Intertrochanteric, Shaft Femur, Knee Ligament/Meniscal Injuries, Tibial Plateau/Pilon and Spine Trauma', 90],
        ['Peripheral Nerve Injuries and Brachial Plexus — Seddon/Sunderland Classification, Erb/Klumpke Palsy, Radial, Median, Ulnar, Sciatic and Common Peroneal Nerve Injuries and Splints', 95],
        ['Bone and Joint Infections, Arthritis and Metabolic Bone Diseases — Acute/Chronic Osteomyelitis, Brodie Abscess, Septic Arthritis, Pott Spine, Osteoarthritis, Rickets, Osteomalacia, Scurvy and Paget Disease', 88],
        ['Bone Tumours and Paediatric Orthopaedics — Osteoid Osteoma, Osteochondroma, Giant Cell Tumour, Osteosarcoma, Ewing Sarcoma, Chondrosarcoma, DDH, CTEV, Perthes Disease and SCFE', 92],
      ],
    },
    'Radiodiagnosis': {
      pri: 56,
      topics: [
        ['Radiation Physics, Contrast Media and Radiation Safety — X-Ray Tube, CT Hounsfield Units, MRI Sequences, Doppler USG, Contrast Nephropathy/Reactions, AERB Guidelines and TLD/Dosimetry', 84],
        ['Chest and Cardiovascular Imaging — Silhouette Sign, Air Bronchogram, Pneumothorax, Pleural Effusion, Cavitary/Interstitial Lung Lesions, Mediastinal Masses and Classic Cardiac Contours', 95],
        ['Neuroimaging and Head/Neck Radiology — Non-Contrast CT in EDH/SDH/SAH/Stroke, MRI Diffusion-Weighted Imaging, Brain Tumours, Ring-Enhancing Lesions and Classic Skull Radiographs', 94],
        ['Gastrointestinal and Hepatobiliary Imaging — Barium Swallow/Meal/Follow-Through/Enema Appearances, Pneumoperitoneum Signs, Small/Large Bowel Obstruction, Volvulus and Hepatobiliary USG/CT', 92],
        ['Genitourinary, Obstetrics and Musculoskeletal Imaging — IVU Signs, Renal Calculi/Masses, Hysterosalpingography, Early Pregnancy/Anomaly USG and Classic Metabolic/Neoplastic Bone X-Rays', 88],
        ['Radiotherapy and Nuclear Medicine — Particulate/Electromagnetic Radiations, Linear Energy Transfer, Radiosensitivity, Brachytherapy/Teletherapy and PET-CT/Radionuclide Scans (Tc-99m, I-131, MIBG)', 82],
      ],
    },
    'Dermatology': {
      pri: 52,
      topics: [
        ['Basics of Dermatology and Cutaneous Infections — Epidermal Layers, Primary/Secondary Lesions, Bedside Tests (Tzanck, KOH, Wood Lamp), Impetigo, Dermatophytosis, Viral Warts/Molluscum and Scabies', 92],
        ['Mycobacterial Cutaneous Diseases — Leprosy (Ridley-Jopling Classification, Cardinal Signs, Type 1 and Type 2 Lepra Reactions, WHO MDT) and Cutaneous Tuberculosis (Lupus Vulgaris, Scrofuloderma)', 95],
        ['Papulosquamous, Eczematous and Pigmentary Disorders — Psoriasis, Lichen Planus, Pityriasis Rosea, Erythroderma, Allergic/Irritant Contact Dermatitis, Atopic Dermatitis, Vitiligo and Melasma', 90],
        ['Vesiculobullous, Appendageal and Connective Tissue Skin Disorders — Pemphigus Vulgaris/Foliaceus, Bullous Pemphigoid, Dermatitis Herpetiformis, Acne Vulgaris, Rosacea, Alopecia Areata and Cutaneous Lupus/Dermatomyositis', 94],
        ['Sexually Transmitted Infections, Genodermatoses and Drug Reactions — Syndromic STI Management, Chancre, Chancroid, LGV, Donovanosis, Neurofibromatosis, Tuberous Sclerosis and SJS/TEN/DRESS', 90],
      ],
    },
    'Psychiatry': {
      pri: 48,
      topics: [
        ['Descriptive Psychopathology and Schizophrenia Spectrum — Disorders of Perception, Thought, Motor Behaviour (Catatonia) and Affect, Schizophrenia Diagnostic Criteria, Delusional Disorder and Clozapine/Antipsychotics', 94],
        ['Mood, Anxiety and Stress-Related Disorders — Major Depressive Episode, Bipolar I/II Disorder, Suicide Risk, Lithium Monitoring, Panic Disorder, Phobias, OCD, PTSD and ECT/CBT', 95],
        ['Substance Use Disorders — Alcohol Withdrawal, Wernicke-Korsakoff Syndrome, Delirium Tremens, Opioid/Cannabis/Cocaine Intoxication and Withdrawal and Anticraving Pharmacotherapy', 92],
        ['Somatoform, Dissociative, Eating, Sleep and Personality Disorders — Somatic Symptom/Conversion Disorder, Anorexia and Bulimia Nervosa, Sleep Architecture/Parasomnias, Sexual Dysfunctions and Cluster A/B/C Personalities', 82, 50, 35, 20],
        ['Child Psychiatry, Neurocognitive Disorders and Forensic Psychiatry — Autism Spectrum Disorder, ADHD, Rett Syndrome, Delirium vs Dementia, Alzheimer Disease and Mental Healthcare Act 2017', 86],
      ],
    },
    'Anaesthesiology': {
      pri: 45,
      topics: [
        ['Preoperative Evaluation, Airway Management and Breathing Circuits — ASA Physical Status, Mallampati/Cormack-Lehane Grading, Endotracheal Tubes, LMA, Capnography Waveforms and Mapleson Systems', 95],
        ['Anaesthesia Machine, Medical Gas Cylinders and Intraoperative Monitoring — Pin Index Safety System, Cylinder Colour Coding, Flowmeters, Vaporisers, CO2 Absorbers, Pulse Oximetry and Train-of-Four Monitoring', 92],
        ['Inhalational and Intravenous Anaesthetics — Minimum Alveolar Concentration, Blood-Gas Partition Coefficient, Nitrous Oxide, Sevoflurane, Desflurane, Isoflurane, Propofol, Ketamine, Etomidate and Thiopentone', 96],
        ['Neuromuscular Blockers and Regional Anaesthesia — Succinylcholine, Malignant Hyperthermia, Non-Depolarising Blockers, Sugammadex/Neostigmine, Local Anaesthetic Systemic Toxicity and Spinal vs Epidural Block', 94],
        ['Cardiopulmonary Resuscitation, Oxygen Therapy and Perioperative Fluids — Adult/Paediatric BLS and ACLS Algorithms, Defibrillation, Oxygen Delivery Devices, Crystalloids/Colloids and Brain Death Criteria', 90, 50, 35, 20],
      ],
    },
  },
},

  /*
 * NEET SS (Surgical Group / MCh) — National Eligibility cum Entrance Test (Super Speciality)
 * Conducting body: NBEMS | Syllabus authority: NMC / MCh Exit Level Curricula for the Surgical Group
 * Paper pattern:
 *   - 150 compulsory MCQs in 150 minutes (600 marks; +4 correct, -1 incorrect, 0 unattempted)
 *   - Divided into 3 time-bound sections of 50 questions and 50 minutes each (Section transitions are locked)
 *   - Combines broad-speciality feeder knowledge (MS General Surgery) with super-speciality surgical sciences
 * Syllabus decomposition:
 *   - Covers foundational surgical principles, trauma, operative oncology, vascular, transplant, and specialized MCh disciplines (Urology, Neurosurgery, CTVS, Surgical Gastroenterology, Plastic Surgery, Pediatric Surgery, Surgical Oncology)
 */
neetss: {
  n: 'NEET SS (Surgical Group / MCh)',
  mock: 150,
  defMins: { b: 75, i: 55, a: 35 },
  crunchMins: 60,
  found: [
    'Surgical Anatomy & Applied Physiology',
    'General Surgery & Critical Care Foundation',
    'Surgical Pathology & Oncologic Principles',
  ],
  tier: {
    'Surgical Anatomy & Applied Physiology': 1,
    'General Surgery & Critical Care Foundation': 1,
    'Surgical Pathology & Oncologic Principles': 1,
    'Trauma & Emergency Surgery': 2,
    'Gastrointestinal & Hepato-Pancreato-Biliary Surgery': 2,
    'Urology & Renal Transplantation': 2,
    'Cardiothoracic & Vascular Surgery': 2,
    'Neurosurgery Principles': 3,
    'Plastic, Reconstructive & Hand Surgery': 3,
    'Paediatric Surgery & Neonatal Anomalies': 3,
    'Surgical Oncology & Endocrine Surgery': 3,
  },
  crunch: {
    // Concentrates 30-day prep on high-yield core sub-specialties (GI/HPB, Urology, CTVS, Trauma) accounting for the bulk of MCh exam weight, while 60-day prep includes all foundational and specialized branches
    30: {
      'Gastrointestinal & Hepato-Pancreato-Biliary Surgery': 22,
      'Urology & Renal Transplantation': 20,
      'Cardiothoracic & Vascular Surgery': 18,
      'Trauma & Emergency Surgery': 15,
      'Surgical Pathology & Oncologic Principles': 14,
      'General Surgery & Critical Care Foundation': 11,
    },
    60: {
      'Gastrointestinal & Hepato-Pancreato-Biliary Surgery': 16,
      'Urology & Renal Transplantation': 14,
      'Cardiothoracic & Vascular Surgery': 14,
      'Trauma & Emergency Surgery': 11,
      'Surgical Pathology & Oncologic Principles': 10,
      'General Surgery & Critical Care Foundation': 9,
      'Surgical Anatomy & Applied Physiology': 7,
      'Neurosurgery Principles': 6,
      'Plastic, Reconstructive & Hand Surgery': 5,
      'Paediatric Surgery & Neonatal Anomalies': 4,
      'Surgical Oncology & Endocrine Surgery': 4,
    },
  },
  t: {
    'Surgical Anatomy & Applied Physiology': {
      pri: 84,
      topics: [
        ['Applied Head, Neck and Mediastinal Embryology and Surgical Spaces', 85],
        ['Abdominal Compartments, Retroperitoneal Fascial Planes and Pelvic Floor Anatomy', 92, 90, 60, 40],
        ['Cardiorespiratory Physiology, Pulmonary Mechanics and Hemodynamic Monitoring', 88],
        ['Hepatic Segments, Biliary Tree Variations and Portal Circulation Architecture', 94],
        ['Renal Microvasculature, Ureteral Blood Supply and Pelvic Autonomic Innervation', 86],
      ],
    },
    'General Surgery & Critical Care Foundation': {
      pri: 88,
      topics: [
        ['Metabolic Response to Severe Trauma, Sepsis and Nutritional Support in Surgical Patients', 90],
        ['Advanced Hemodynamic Instability, Vasopressors, Inotropes and Multiorgan Dysfunction Syndrome', 95],
        ['Mechanical Ventilation Modes, ARDS Management and Perioperative Respiratory Care', 92],
        ['Coagulopathies, Massive Transfusion Protocols and Hemostatic Agents in Major Surgery', 88],
      ],
    },
    'Surgical Pathology & Oncologic Principles': {
      pri: 90,
      topics: [
        ['Principles of Surgical Oncology, Molecular Carcinogenesis, Staging Systems and Immunotherapy', 95],
        ['Pathology of Soft Tissue Sarcomas, Neuroendocrine Tumours and Metastatic Disease', 89],
        ['Surgical Margin Evaluation, Frozen Section Interpretation and Biopsy Pitfalls', 92],
        ['Genetic Cancer Syndromes (BRCA, Lynch, MEN) and Prophylactic Surgeries', 86],
      ],
    },
    'Trauma & Emergency Surgery': {
      pri: 92,
      topics: [
        ['Advanced Trauma Life Support (ATLS) Protocols, Triage and Emergency Resuscitation', 96],
        ['Abdominal Trauma, Damage Control Laparotomy and Splenic/Liver Salvage Techniques', 98, 120, 80, 50],
        ['Thoracic Trauma, Emergency Department Thoracotomy and Flail Chest Management', 92],
        ['Complex Pelvic Ring Disruptions, Packing and Angioembolisation Indications', 88],
      ],
    },
    'Gastrointestinal & Hepato-Pancreato-Biliary Surgery': {
      pri: 96,
      topics: [
        ['Oesophageal Motility Disorders, Caustic Injuries and Oesophageal Cancer Resection', 90],
        ['Portal Hypertension, Variceal Bleeding, Shunt Surgery and Liver Resection Techniques', 95],
        ['Pancreaticoduodenectomy (Whipple Procedure) and Management of Acute Necrotising Pancreatitis', 98, 135, 90, 55],
        ['Colorectal Carcinoma, Total Mesorectal Excision (TME) and Sphincter-Preserving Surgeries', 94],
        ['Liver Transplantation — Donor Selection, Graft Procurement and Biliary Reconstruction', 96],
      ],
    },
    'Urology & Renal Transplantation': {
      pri: 95,
      topics: [
        ['Urolithiasis — Flexible Ureteroscopy, PCNL, RIRS and Metabolic Stone Workup', 92],
        ['Urothelial Malignancies — Radical Cystectomy, Urinary Diversions and Radical Nephrectomy', 95],
        ['BPH, Laser Prostatectomy (HoLEP/ThuLEP) and Urethral Stricture Reconstruction', 88],
        ['Renal Transplantation — Living and Cadaveric Donor Nephrectomy, Vascular Anastomosis and Complications', 98, 135, 90, 55],
        ['Paediatric Urology — Posterior Urethral Valves, Vesicoureteral Reflux and Hypospadias Repair', 86],
      ],
    },
    'Cardiothoracic & Vascular Surgery': {
      pri: 94,
      topics: [
        ['Coronary Artery Bypass Grafting (CABG) on-pump vs off-pump and Valve Replacement Surgeries', 96, 135, 90, 55],
        ['Thoracic Aortic Aneurysms, Dissections and Endovascular Stent-Grafting (TEVAR/EVAR)', 94],
        ['Congenital Heart Disease — Tetralogy of Fallot, ASD/VSD Closure and PDA Ligation', 90],
        ['Peripheral Vascular Disease, Bypass Grafting and Management of Acute Limb Ischaemia', 88],
        ['Mediastinal Masses, VATS Lobectomy and Management of Empyema Thoracis', 85],
      ],
    },
    'Neurosurgery Principles': {
      pri: 78,
      topics: [
        ['Traumatic Brain Injury, ICP Monitoring, Decompressive Craniectomy and Subdural Hematoma Evacuation', 92],
        ['Intracranial Tumours — Gliomas, Meningiomas, Pituitary Adenomas and Acoustic Schwannomas', 90],
        ['Cerebrovascular Neurosurgery — Aneurysm Clipping, AVM Embolisation and Carotid Endarterectomy', 85],
        ['Spinal Pathology — Cervical/Lumbar Disc Herniation, Spinal Cord Tumours and Spinal Trauma', 88],
      ],
    },
    'Plastic, Reconstructive & Hand Surgery': {
      pri: 75,
      topics: [
        ['Principles of Microvascular Surgery, Flap Design, Free Tissue Transfer and Anastomosis', 94, 120, 80, 50],
        ['Burn Management, Fluid Resuscitation, Early Excision and Post-Burn Contracture Release', 88],
        ['Cleft Lip and Palate Repair and Craniofacial Anomalies', 82],
        ['Hand Surgery — Tendon Injuries, Nerve Repairs, Flexor/Extensor Zones and Replantation Basics', 85],
      ],
    },
    'Paediatric Surgery & Neonatal Anomalies': {
      pri: 72,
      topics: [
        ['Neonatal Surgical Emergencies — Tracheo-Oesophageal Fistula, Intestinal Atresia and Gastroschisis', 92],
        ['Congenital Diaphragmatic Hernia, Hirschsprung Disease and Anorectal Malformations', 90],
        ['Hypertrophic Pyloric Stenosis and Intussusception Reduction Strategies', 85],
      ],
    },
    'Surgical Oncology & Endocrine Surgery': {
      pri: 82,
      topics: [
        ['Head and Neck Oncology — Composite Resections, Neck Dissections and Free Flap Reconstruction', 92],
        ['Breast Oncology — Oncoplastic Breast-Conserving Surgery, Sentinel Lymph Node Biopsy and Reconstruction', 94],
        ['Thyroid Malignancies, Hyperparathyroidism and Adrenalectomy (Laparoscopic/Retroperitoneoscopic)', 90],
        ['Sarcomas and Melanoma — Wide Local Excision, Sentinel Node Biopsy and Limb-Salvage Protocols', 86],
      ],
    },
  },
},
  /*
 * NEET (UG) — National Eligibility cum Entrance Test (Undergraduate)
 * Conducting body: NTA | Syllabus authority: NMC (50 units: 20 Physics, 20 Chemistry, 10 Biology)
 * Paper pattern (pre-COVID format restored from 2025 onward):
 *   - 180 compulsory MCQs in 180 minutes (720 marks; +4 correct, -1 incorrect, 0 unattempted)
 *   - Section B optional questions and the 200-minute window are discontinued
 *   - Question split: Botany (45), Zoology (45), Chemistry (45), Physics (45)
 * Syllabus decomposition:
 *   - Divided into 8 subjects matching paper sections and NCERT/NMC sub-disciplines
 *   - All 50 official NMC units are mapped in pedagogical order (56 topics total)
 */
neetug: {
  n: 'NEET (UG)',
  mock: 180,
  defMins: { b: 60, i: 45, a: 30 },
  crunchMins: 45,
  found: [
    'Botany',
    'Physical Chemistry',
    'Physics — Mechanics',
  ],
  tier: {
    'Botany': 1,
    'Physical Chemistry': 1,
    'Physics — Mechanics': 1,
    'Zoology': 2,
    'Physics — Electrodynamics, Optics & Modern': 2,
    'Organic Chemistry': 2,
    'Inorganic Chemistry': 2,
    'Physics — Thermal, Waves & Experimental': 3,
  },
  crunch: {
    // Prioritises the 360-mark Biology core, high-ROI Class 12 Physics, and NCERT Chemistry while trimming earlier Tier-1 foundations and cutting time-heavy Mechanics/Waves in the 30-day plan
    30: {
      'Zoology': 28,
      'Botany': 24,
      'Physics — Electrodynamics, Optics & Modern': 18,
      'Organic Chemistry': 12,
      'Inorganic Chemistry': 10,
      'Physical Chemistry': 8,
    },
    60: {
      'Zoology': 24,
      'Botany': 22,
      'Physics — Electrodynamics, Optics & Modern': 15,
      'Organic Chemistry': 11,
      'Inorganic Chemistry': 9,
      'Physical Chemistry': 8,
      'Physics — Mechanics': 7,
      'Physics — Thermal, Waves & Experimental': 4,
    },
  },
  t: {
    'Botany': {
      pri: 96,
      topics: [
        ['Cell Structure and Function — Cell: The Unit of Life, Biomolecules and Cell Division', 95],
        ['Diversity in Living World — What is Living, Biodiversity, Classification, Monera, Protista and Fungi', 84],
        ['Diversity in Living World — Plant Kingdom (Algae, Bryophytes, Pteridophytes, Gymnosperms and Angiosperms)', 80],
        ['Structural Organisation in Plants — Morphology, Anatomy and Families of Flowering Plants', 86],
        ['Plant Physiology — Photosynthesis, Respiration and Plant Growth Regulators', 88, 90, 68, 45],
        ['Sexual Reproduction in Flowering Plants', 85],
        ['Genetics — Principles of Inheritance, Variation and Molecular Basis of Inheritance', 98, 95, 70, 45],
        ['Biology and Human Welfare — Microbes in Human Welfare', 68],
        ['Ecology and Environment — Organisms and Populations, Ecosystem, Biodiversity and Conservation', 92],
      ],
    },
    'Zoology': {
      pri: 95,
      topics: [
        ['Structural Organisation in Animals — Animal Tissues, Morphology and Anatomy of Frog and Cockroach', 82],
        ['Diversity in Living World — Animal Kingdom (Non-Chordates and Chordates)', 88],
        ['Human Physiology I — Breathing and Exchange of Gases, Body Fluids and Circulation, Excretory Products', 92, 90, 68, 45],
        ['Human Physiology II — Locomotion and Movement, Neural Control and Coordination, Chemical Coordination', 90, 90, 68, 45],
        ['Reproduction — Human Reproduction and Reproductive Health', 88],
        ['Evolution — Origin of Life, Darwinism, Mechanism of Evolution and Hardy-Weinberg Principle', 76],
        ['Biology and Human Welfare — Human Health and Diseases, Immunology, Cancer and Substance Abuse', 85],
        ['Biotechnology and Its Applications — Principles, Recombinant DNA Technology and Applications', 96],
      ],
    },
    'Physics — Electrodynamics, Optics & Modern': {
      pri: 88,
      topics: [
        ["Electrostatics — Coulomb's Law, Electric Field, Gauss's Law, Electric Potential, Dipoles and Capacitors", 86],
        ["Current Electricity — Ohm's Law, Drift Velocity, Resistor/Cell Combinations, Kirchhoff's Laws and Bridges", 94],
        ["Magnetic Effects of Current and Magnetism — Biot-Savart Law, Ampere's Law, Galvanometer and Magnetic Materials", 86],
        ["Electromagnetic Induction and Alternating Currents — Faraday's Law, Inductance, LCR Circuit and Transformers", 84],
        ['Optics — Ray Optics, Optical Instruments, Wave Optics, Interference, Diffraction and Polarisation', 92, 95, 70, 45],
        ['Dual Nature of Matter and Radiation, Atoms and Nuclei — Photoelectric Effect, Bohr Model and Radioactivity', 95],
        ['Electronic Devices — Semiconductors, p-n Junction Diode, LED, Photodiode, Zener Diode and Logic Gates', 92],
      ],
    },
    'Organic Chemistry': {
      pri: 84,
      topics: [
        ['Some Basic Principles of Organic Chemistry — IUPAC, Isomerism, Electronic Effects and Reaction Intermediates', 96],
        ['Purification and Characterisation of Organic Compounds — Qualitative and Quantitative Elemental Analysis', 68],
        ['Hydrocarbons — Alkanes, Alkenes, Alkynes and Aromatic Hydrocarbons', 88],
        ['Organic Compounds Containing Halogens — Haloalkanes, Haloarenes, SN1, SN2 and Elimination Reactions', 78],
        ['Organic Compounds Containing Oxygen — Alcohols, Phenols, Ethers, Aldehydes, Ketones and Carboxylic Acids', 95, 95, 70, 45],
        ['Organic Compounds Containing Nitrogen — Amines, Cyanides, Isocyanides and Diazonium Salts', 82],
        ['Biomolecules — Carbohydrates, Proteins, Enzymes, Vitamins, Nucleic Acids and Hormones', 80],
      ],
    },
    'Physical Chemistry': {
      pri: 81,
      topics: [
        ['Some Basic Concepts in Chemistry — Mole Concept, Stoichiometry and Empirical/Molecular Formulae', 85],
        ['Atomic Structure — Bohr Model, Dual Nature of Matter, Quantum Numbers and Electronic Configurations', 86],
        ['Chemical Thermodynamics — Laws of Thermodynamics, Enthalpy, Entropy and Gibbs Free Energy', 88],
        ['Equilibrium — Chemical and Ionic Equilibrium, Ionisation, Buffer Solutions and Solubility Product', 90],
        ['Redox Reactions and Electrochemistry — Nernst Equation, Conductance, Kohlrausch Law and Galvanic Cells', 88],
        ["Solutions — Concentration Terms, Raoult's Law, Colligative Properties and Van't Hoff Factor", 82],
        ['Chemical Kinetics — Rate Laws, Order and Molecularity, Integrated Rate Equations and Arrhenius Equation', 84],
      ],
    },
    'Inorganic Chemistry': {
      pri: 78,
      topics: [
        ['Classification of Elements and Periodicity in Properties — Periodic Trends in Atomic and Ionisation Properties', 80],
        ['Chemical Bonding and Molecular Structure — VSEPR Theory, Hybridisation, Molecular Orbital Theory and H-Bonding', 96],
        ['p-Block Elements — Group 13 to Group 18 General Trends, Anomalous Behaviour and Electronic Configurations', 82],
        ['d- and f-Block Elements — Transition Metals, Lanthanoids, Actinoids, KMnO4 and K2Cr2O7', 85],
        ['Co-ordination Compounds — IUPAC Nomenclature, Isomerism, Valence Bond Theory and Crystal Field Theory', 94],
        ['Principles Related to Practical Chemistry — Qualitative Salt Analysis, Titrimetry and Functional Group Tests', 65],
      ],
    },
    'Physics — Mechanics': {
      pri: 72,
      topics: [
        ['Physics and Measurement — SI Units, Least Count, Significant Figures, Errors and Dimensional Analysis', 82],
        ['Kinematics — Frame of Reference, Straight-Line Motion, Vectors, Projectile and Relative Motion', 78],
        ["Laws of Motion — Newton's Laws, Impulse, Conservation of Linear Momentum, Friction and Circular Dynamics", 84],
        ['Work, Energy and Power — Work-Energy Theorem, Conservative Forces, Potential Energy and Collisions', 82],
        ['Rotational Motion — Centre of Mass, Torque, Angular Momentum, Moment of Inertia and Rolling Motion', 85, 95, 70, 45],
        ['Gravitation — Universal Law of Gravitation, Acceleration Due to Gravity, Potential Energy and Satellites', 76],
        ['Properties of Solids and Liquids — Stress-Strain, Viscosity, Surface Tension, Bernoulli Theorem and Heat Transfer', 78],
      ],
    },
    'Physics — Thermal, Waves & Experimental': {
      pri: 56,
      topics: [
        ['Thermodynamics — Thermal Equilibrium, First and Second Laws, Isothermal and Adiabatic Processes', 84],
        ['Kinetic Theory of Gases — Ideal Gas Pressure, RMS Speed, Degrees of Freedom and Mean Free Path', 72],
        ['Oscillations and Waves — Simple Harmonic Motion, Energy in SHM, Pendulum, Wave Motion and Beats', 70],
        ['Electromagnetic Waves — Displacement Current, EM Wave Characteristics and Electromagnetic Spectrum', 58, 30, 20, 15],
        ['Experimental Skills — Vernier Callipers, Screw Gauge, Meter Bridge, Resonance Tube and Diode Curves', 64],
      ],
    },
  },
},
   // SSC CGL (Staff Selection Commission – Combined Graduate Level)
// Tier-I is qualifying (100 Q / 200 marks / 60 min; 0.50 negative).
// Tier-II Paper-I is merit-deciding (Session-I: Maths 30Q, Reasoning 30Q,
// English 45Q, GA 25Q; Session-II: Computer + DEST qualifying).
// This entry covers the four core subjects that appear in BOTH tiers.
// Paper-II (Statistics, JSO only) is intentionally excluded because the
// learner is building for the general Paper-I track. No hard dependency
// graph exists across subjects, so all are tier-2 and found is empty.
// crunchMins = 30 because SSC CGL is a speed-and-recall exam; 45-minute
// blocks would over-invest in a single topic during a 30/60-day sprint.
'ssccgl': {
  n: 'SSC CGL (Tier I + Tier II Paper I)',
  mock: 60, // Tier-I full mock; Tier-II Paper-I is longer (135 min Session-I + 15 min DEST)
  defMins: { b: 45, i: 35, a: 25 },
  crunchMins: 30,
  found: [], // No subject is a hard prerequisite for another
  tier: {
    'General Intelligence & Reasoning': 2,
    'General Awareness': 2,
    'Quantitative Aptitude': 2,
    'English Comprehension': 2,
  },
  // Crunch weights are relative. 30-day keeps the two highest-scoring,
  // most-practiceable sections (English + Quant) at a larger share;
  // 60-day touches every subject because all four carry equal Tier-I marks.
  crunch: {
    30: {
      'English Comprehension': 30,
      'Quantitative Aptitude': 30,
      'General Intelligence & Reasoning': 20,
      'General Awareness': 20,
    },
    60: {
      'English Comprehension': 25,
      'Quantitative Aptitude': 25,
      'General Intelligence & Reasoning': 25,
      'General Awareness': 25,
    },
  },
  t: {
    'General Intelligence & Reasoning': {
      pri: 85,
      topics: [
        ['Analogy (Verbal & Non-Verbal)', 90],
        ['Classification / Odd One Out', 85],
        ['Number & Alphabet Series', 85],
        ['Coding-Decoding', 90],
        ['Blood Relations', 80],
        ['Direction & Distance', 75],
        ['Syllogism & Venn Diagrams', 80],
        ['Seating Arrangement & Puzzles', 75],
        ['Mirror & Water Images', 70],
        ['Paper Folding, Cutting & Embedded Figures', 65],
      ],
    },
    'General Awareness': {
      pri: 85,
      topics: [
        ['Ancient & Medieval Indian History', 70],
        ['Modern Indian History (Freedom Struggle)', 80],
        ['Indian Polity & Constitution', 85],
        ['Geography (India & World)', 75],
        ['Indian Economy & Budget', 75],
        ['General Science (Physics, Chemistry, Biology)', 80],
        ['Static GK (Awards, Books, Important Days)', 70],
        ['Current Affairs (last 6–8 months)', 90],
      ],
    },
    'Quantitative Aptitude': {
      pri: 85,
      topics: [
        ['Number System, LCM & HCF', 80],
        ['Percentage, Ratio & Average', 85],
        ['Profit, Loss & Discount', 85],
        ['Simple & Compound Interest', 80],
        ['Time, Speed, Distance & Trains', 80],
        ['Time & Work, Pipes & Cisterns', 85],
        ['Algebra (Identities, Linear & Quadratic Equations)', 80],
        ['Geometry (Triangles, Circles, Quadrilaterals)', 75],
        ['Mensuration (2D & 3D)', 75],
        ['Trigonometry & Heights/Distances', 70],
        ['Data Interpretation (Tables, Bar, Pie, Line)', 90, 60, 45, 30], // heavier than defMins
      ],
    },
    'English Comprehension': {
      pri: 85,
      topics: [
        ['Grammar: Noun, Pronoun, Verb, Tense, Article', 80],
        ['Error Detection / Spotting', 85],
        ['Sentence Improvement', 80],
        ['Fill in the Blanks', 75],
        ['Synonyms & Antonyms', 85],
        ['Idioms & Phrases', 80],
        ['One Word Substitution', 80],
        ['Spelling Correction / Homonyms', 70],
        ['Active-Passive & Direct-Indirect Speech', 70],
        ['Para Jumbles / Sentence Rearrangement', 75],
        ['Reading Comprehension', 90, 60, 45, 30], // RC is a monster topic
      ],
    },
  },
},
   
  upsc:{n:'UPSC CSE',mock:240,t:{
    'Polity':['Constitution and fundamental rights','Parliament and executive','Judiciary and federalism','Local government and governance','Constitutional bodies and amendments'],
    'History':['Ancient and medieval India','Modern India and freedom struggle','Art and culture','World history'],
    'Geography':['Physical geography','Indian geography','World and human geography','Climate and oceans'],
    'Economy':['Basic concepts and national income','Banking, money and inflation','Budget, taxation and fiscal policy','Agriculture and industry','External sector'],
    'Environment':['Ecology and biodiversity','Climate change and conventions','Environmental laws and conservation'],
    'Science & Tech':['Space, defence and nuclear','Biotechnology and health','IT, AI and emerging technology'],
    'Current Affairs':['Government schemes and policies','International relations','Reports, indices and summits'],
    'CSAT':['Comprehension','Logical reasoning','Basic numeracy and data interpretation']}},

  // Rajasthan 2nd Grade English (Sr. Teacher, Secondary Education Dept., RPSC)
// Paper-II only (subject paper); Paper-I (GK/Rajasthan/Ed-Psych) is out of scope.
// 150 MCQs / 300 marks / 2.5 hours; ⅓ negative marking.
// Official split: Part-I (Secondary & Sr. Secondary Grammar) = 90 Q / 180 marks;
// Part-II (Graduation Grammar, Usage & Literature) = 40 Q / 80 marks;
// Part-III (Teaching Methods) = 20 Q / 40 marks.
// Grammar-Translation through Communicative Language Teaching are all in Part-III.
// No hard prerequisite between parts, so found: [] and everything is tier 2.
// crunchMins = 45: this is a language-theory paper, not a 30-second-recall SSC paper.
'rajenglish': {
  n: 'Rajasthan 2nd Grade English (Sr. Teacher Paper-II)',
  mock: 150, // 2 hours 30 minutes for 150 questions
  defMins: { b: 50, i: 40, a: 30 }, // teaching-exam band from the rule sheet
  crunchMins: 45,
  found: [], // No subject is a hard prerequisite for another
  tier: {
    'Grammar and Usage (Secondary & Sr. Secondary)': 2,
    'Grammar, Usage & Literature (Graduation)': 2,
    'Teaching Methods': 2,
  },
  // Crunch weights are relative. 30-day prioritises Part-I (60% of marks),
  // keeps Literature at 30%, and trims Teaching Methods to 10% because 20 Q
  // cannot justify a full third of a 30-day sprint. 60-day widens Literature
  // and Teaching Methods without letting Part-I fall below 50%.
  crunch: {
    30: {
      'Grammar and Usage (Secondary & Sr. Secondary)': 60,
      'Grammar, Usage & Literature (Graduation)': 30,
      'Teaching Methods': 10,
    },
    60: {
      'Grammar and Usage (Secondary & Sr. Secondary)': 50,
      'Grammar, Usage & Literature (Graduation)': 30,
      'Teaching Methods': 20,
    },
  },
  t: {
    'Grammar and Usage (Secondary & Sr. Secondary)': {
      pri: 90, // 90 Q / 180 marks — the largest block by far
      topics: [
        ['Parts of Speech (Nouns, Verbs, Adjectives, Adverbs)', 85],
        ['Articles and Determiners', 80],
        ['Tenses', 90],
        ['Prepositions', 80],
        ['Modal Auxiliaries', 70],
        ['Degrees of Comparison (Comparative, Superlative)', 65],
        ['Subject-Verb Agreement', 85],
        ['Subordination and Co-ordination — Compound & Complex Sentences', 70],
        ['Conditional Sentences', 65],
        ['Transformation of Sentences (Affirmative/Negative/Interrogative; Active/Passive; Direct/Indirect)', 85],
        ['Idioms, Phrasal Verbs & Proverbs', 75],
        ['Vocabulary: Synonyms, Antonyms, Spelling & Confused Words', 80],
        ['Phonetic Transcription and Word Stress', 60],
      ],
    },
    'Grammar, Usage & Literature (Graduation)': {
      pri: 70, // 40 Q / 80 marks
      topics: [
        ['Basic Sentence Patterns', 70],
        ['Phrase Analysis (M H M)', 60],
        ['Clause Analysis (SPOCA)', 60],
        ['Reading Comprehension and Vocabulary', 85],
        ['Poetry Appreciation', 75],
        ['Literary Forms / Devices / Techniques (Ode, Elegy, Sonnet, Epic, Dramatic Monologue, Ballad; Alliteration, Hyperbole, Simile/Metaphor, Personification, Satire/Irony, Onomatopoeia)', 80],
        ['Major Literary Periods (Renaissance, Metaphysical, Jacobean, Neo-Classical, Romantic, Victorian, Modern, Post-Modern)', 70],
        ['Literary Movements (Romanticism, Gothic, Pre-Raphaelite, Realism, Existentialism, Stream of Consciousness, Symbolism, Modernism, Post-Modernism)', 70],
        ['Twentieth Century Indian Writers / Poets in English (Tagore, Mulk Raj Anand, R.K. Narayan, Sarojini Naidu, Toru Dutt, Nissim Ezekiel, Ruskin Bond, Arun Kolatkar, Anita Desai, Shashi Deshpande, Kamala Das, Jayant Mahapatra, Amitav Ghosh, Manju Kapoor, Arundhati Roy)', 65],
      ],
    },
    'Teaching Methods': {
      pri: 60, // 20 Q / 40 marks
      topics: [
        ['Grammar-Translation Method', 60],
        ['Direct Method', 60],
        ['Structural Method', 55],
        ['Audio-Lingual Method', 55],
        ['Communicative Language Teaching', 70],
        ['Teaching Prose', 65],
        ['Teaching Poetry', 65],
        ['Teaching Grammar and Composition', 60],
        ['Basic Principles of Second Language Teaching (Selection, Gradation, Presentation, Testing)', 65],
      ],
    },
  },
                   }
   };
Object.values(EX).forEach(e=>e.sub=Object.keys(e.t));
